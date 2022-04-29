/**
 * @description Gerenciador de informações com o banco de dados
 * @author GuilhermeSantos001
 * @update 28/02/2022
 */

import { FilterQuery } from 'mongoose';
import {
    UsersSchema,
    UserInterface,
    UserModelInterface,
    PrivilegesSystem,
    Location,
    Session,
    Authentication,
    Devices,
    Unit,
    History,
    Token,
    RefreshToken,
    sessionDefault,
    authenticationDefault
} from '@/schemas/UsersSchema';
import { Encrypt, Decrypt } from '@/utils/bcrypt';
import { verify as twoFactorVerify, generateQRCode, QRCode } from '@/utils/twoFactor';
import Queue from '@/lib/Queue';
import { JsonWebToken } from '@/lib/JsonWebToken';
import Moment from '@/utils/moment';

export interface IUserInfo {
    authorization: string;
    privileges: PrivilegesSystem[];
    privilege: string;
    photoProfile: string;
    username: string;
    email: string;
    name: string;
    surname: string;
    cnpj: string;
    location: Location;
    session: Session;
    signature: string;
    token: string;
    authentication: Authentication;
}

export interface UpdateUserInfo {
    email: string;
    username: string;
    name: string;
    surname: string;
    cnpj: string;
    location: Location;
}

declare interface RequestLocation {
    locationIP: string;
    internetAdress: string;
    browser: string;
    os: string;
}

declare interface ConnectedOptions {
    ip: string;
    token: string;
    device: Devices;
    location: RequestLocation;
    signature: string;
}

function getTime(unit: Unit, tmp: number): Date {
    const time = new Date();

    if (unit === 's') {
        time.setSeconds(time.getSeconds() + tmp);
    }
    else if (unit === 'm') {
        time.setMinutes(time.getMinutes() + tmp);
    }
    else if (unit === 'h') {
        time.setHours(time.getHours() + tmp);
    }
    else if (unit === 'd') {
        time.setDate(time.getDate() + tmp);
    }

    return time;
}

export class UsersManagerDB {
    /**
      * @description Retorna uma lista de usuários
      * @param filter {Object} - Filtro Aplicado na busca
      * @param skip {Number} - Pular x itens iniciais no banco de dados
      * @param limit {Number} - Limite de itens a serem retornados
     */
    public async get(filter: FilterQuery<UserModelInterface>, skip: number, limit: number): Promise<Omit<IUserInfo, "token">[]> {
        const users = await UsersSchema.find(filter).skip(skip).limit(limit);

        return users.map(user => {
            if (!user.session)
                user.session = sessionDefault;

            if (!user.authentication)
                user.authentication = authenticationDefault;

            return {
                authorization: user.authorization,
                privileges: user.privileges,
                privilege: user.privilege,
                photoProfile: user.photoProfile,
                username: user.username,
                email: user.clearEmail,
                name: user.name,
                surname: user.surname,
                cnpj: user.cnpj,
                location: user.location,
                session: {
                    connected: user.session.connected,
                    limit: user.session.limit,
                    device: user.session.device,
                    alerts: user.session.alerts,
                    cache: user.session.cache
                },
                signature: user.signature,
                authentication: user.authentication,
                status: user.status
            };
        });
    }

    /**
     * * @description Registra um novo usuário
     */
    public async register(user: UserInterface): Promise<boolean> {
        const _user = await UsersSchema.findOne({ authorization: user.authorization });

        if (_user)
            throw new Error(`Usuário(${user.authorization}) já está registrado`);

        user.password = await Encrypt(user.password); // ? Gera a criptografia da senha

        const model = await UsersSchema.create({
            ...user,
            createdAt: Moment.format()
        });

        await model.validate();
        await model.save();

        return true;
    }

    /**
     * * @description Registra um novo usuário
     */
    public async delete(authorization: string): Promise<boolean> {
        const _user = await UsersSchema.deleteOne({ authorization });

        if (_user.deletedCount <= 0)
            throw new Error(`Usuário(${authorization}) não está registrado.`);

        return true;
    }

    /**
     * @description Retorna o total de usuários ativos e inativos
     */
    public async getUsersEnabledAndDisabled(): Promise<number[]> {
        const totals: number[] = [];

        const _user = await UsersSchema.find({});

        totals.push(_user.filter((user: UserModelInterface) => user.isEnabled).length);
        totals.push(_user.filter((user: UserModelInterface) => !user.isEnabled).length);

        if (totals[0] <= 0 && totals[1] <= 0) {
            throw new Error(`Nenhum usuário está registrado.`);
        }

        return totals;
    }

    /**
     * @description Recupera a conta de usuário
     */
    // TODO: Implementar um código secreto enviado por email para o usuário quando o mesmo criar sua conta, esse código secreto deve ser usado para situações como geração de um novo qrcode de autenticação de duas etapas, recuperação da conta, troca da senha e etc.
    public async retrieve(auth: string): Promise<boolean> {
        const _user = await UsersSchema.findOne({ authorization: auth });

        if (_user) {
            if (!_user.authentication)
                _user.authentication = authenticationDefault;

            _user.authentication.twofactor = { secret: '', enabled: false };

            await UsersSchema.updateOne({ authorization: auth }, {
                $set: {
                    authentication: _user.authentication
                }
            });
        } else {
            throw new Error(`Usuário(${auth}) não está registrado.`);
        }

        return true;
    }

    /**
     * @description Confirma a conta de usuário
     */
    public async confirmAccount(auth: string): Promise<boolean> {
        const _user = await UsersSchema.findOne({ authorization: auth });

        if (_user) {
            _user.email.status = true;

            await UsersSchema.updateOne({ authorization: auth }, {
                $set: {
                    email: _user.email
                }
            });
        } else {
            throw new Error(`Usuário(${auth}) não está registrado.`);
        }

        return true;
    }

    /**
     * @description Verifica a senha de usuário
     */
    public async confirmPassword(auth: string, pwd: string): Promise<IUserInfo> {
        const _user = await UsersSchema.findOne({ authorization: auth });

        if (_user) {
            if (!await Decrypt(pwd, _user.password))
                throw new Error(`Senha está invalida, tente novamente!`);
        } else {
            throw new Error(`Usuário(${auth}) não está registrado.`);
        }

        if (!_user.session)
            _user.session = sessionDefault;

        if (!_user.authentication)
            _user.authentication = authenticationDefault;

        return {
            authorization: _user.authorization,
            privileges: _user.privileges,
            privilege: _user.privilege,
            photoProfile: _user.photoProfile,
            username: _user.username,
            email: _user.clearEmail,
            name: _user.name,
            surname: _user.surname,
            cnpj: _user.cnpj,
            location: _user.location,
            session: {
                connected: _user.session.connected,
                limit: _user.session.limit,
                device: _user.session.device,
                alerts: _user.session.alerts,
                cache: _user.session.cache
            },
            signature: _user.signature,
            token: await _user.token,
            authentication: _user.authentication
        };
    }

    /**
     * @description Troca a senha do usuário
     */
    public async changePassword(auth: string, newpass: string): Promise<boolean> {
        const _user = await UsersSchema.findOne({ authorization: auth });

        if (_user) {
            _user.password = await Encrypt(newpass);

            await UsersSchema.updateOne({ authorization: auth }, {
                $set: {
                    password: _user.password
                }
            });
        } else {
            throw new Error(`Usuário(${auth}) não está registrado.`);
        }

        return true;
    }

    /**
     * @description Registra a assinatura para que o usuário possa trocar a senha
     */
    public async forgotPasswordSignatureRegister(auth: string, signature: string): Promise<boolean> {
        const _user = await UsersSchema.findOne({ authorization: auth });

        if (_user) {
            if (!_user.authentication)
                _user.authentication = authenticationDefault;

            _user.authentication.forgotPassword = signature;

            await UsersSchema.updateOne({ authorization: auth }, {
                $set: {
                    authentication: _user.authentication
                }
            });
        } else {
            throw new Error(`Usuário(${auth}) não está registrado.`);
        }

        return true;
    }

    /**
     * @description Atualiza as informações do usuário para UI/UX.
     */
    public async updateData(auth: string, updateData: UpdateUserInfo): Promise<boolean> {
        const _user = await UsersSchema.findOne({ authorization: auth });

        if (_user) {
            // ? Verifica se o usuário alterou o e-mail
            if (_user.clearEmail !== updateData.email) {
                _user.email = {
                    status: false,
                    value: updateData.email
                }

                const
                    authorization = _user.authorization,
                    email = _user.clearEmail,
                    username = _user.username,
                    jwt: string = await JsonWebToken.sign({
                        payload: {
                            'econfirm': true,
                            'email': String(email).toLowerCase(),
                            'auth': String(authorization).toLowerCase()
                        },
                        options: {
                            expiresIn: '7d'
                        }
                    });

                // ? Cria um job para o envio de e-mail para confirmação da conta
                await Queue.addConfirmMail({
                    email,
                    username,
                    token: jwt,
                    temporarypass: null
                })
            }

            _user.username = updateData.username;
            _user.name = updateData.name;
            _user.surname = updateData.surname;
            _user.cnpj = updateData.cnpj;
            _user.location = updateData.location;

            await UsersSchema.updateOne({ authorization: auth }, {
                $set: {
                    email: _user.email,
                    username: _user.username,
                    name: _user.name,
                    surname: _user.surname,
                    cnpj: _user.cnpj,
                    location: _user.location
                }
            });
        } else {
            throw new Error(`Usuário(${auth}) não está registrado.`);
        }

        return true;
    }

    /**
     * @description Atualiza a foto de perfil para UI/UX.
     */
    public async updatePhotoProfile(auth: string, photo: string): Promise<boolean> {
        const _user = await UsersSchema.findOne({ authorization: auth });

        if (_user) {
            _user.photoProfile = photo;

            await UsersSchema.updateOne({ authorization: auth }, {
                $set: {
                    photoProfile: _user.photoProfile
                }
            });
        } else {
            throw new Error(`Usuário(${auth}) não está registrado.`);
        }

        return true;
    }

    /**
     * @description Recupera as informações do usuário para UI/UX.
     */
    public async getInfo(auth: string): Promise<Omit<IUserInfo, "token">> {
        const _user = await UsersSchema.findOne({ authorization: auth });

        if (!_user)
            throw new Error(`Usuário(${auth}) não está registrado.`);

        if (!_user.session)
            _user.session = sessionDefault;

        if (!_user.authentication)
            _user.authentication = authenticationDefault;

        return {
            authorization: _user.authorization,
            privileges: _user.privileges,
            privilege: _user.privilege,
            photoProfile: _user.photoProfile,
            username: _user.username,
            email: _user.clearEmail,
            name: _user.name,
            surname: _user.surname,
            cnpj: _user.cnpj,
            location: _user.location,
            session: {
                connected: _user.session.connected,
                limit: _user.session.limit,
                device: _user.session.device,
                alerts: _user.session.alerts,
                cache: _user.session.cache
            },
            signature: _user.signature,
            authentication: _user.authentication
        };
    }

    /**
     * @description Conecta o usuário
     */
    public async connected(auth: string, options: ConnectedOptions): Promise<boolean> {
        const _user = await UsersSchema.findOne({ authorization: auth });

        if (_user) {
            if (!_user.session)
                _user.session = sessionDefault;

            const clearIds: Array<number> = []; // ? Ids de sessões que serão removidas

            // ? Verifica se o e-mail do usuário foi confirmado
            if (!_user.email.status)
                throw new Error(`Usuário com a autorização(${auth}), não confirmou o email.`);

            // ? Verifica se o dispositivo está liberado para acesso
            if (_user.session.device.allowed.filter(_device => _device === options.device).length <= 0)
                throw new Error(`Usuário com a autorização(${auth}), está utilizando um dispositivo que não está permitido há estabelecer conexões.`);

            // ? Verifica se existe alguma sessão expirada
            _user.session.cache.history = _user.session.cache.history.filter((_history: History, i): History => {
                const
                    session = _user.session || sessionDefault,
                    // ? Verifica se existe algum refresh token válido
                    refreshTokenExpiry = session.cache.refreshToken.filter(refreshToken => new Date(refreshToken.expiry) >= new Date()).length > 0;

                if (
                    // ? Verifica se a sessão está expirada e se os refresh tokens estão expirados
                    new Date() >= new Date(_history.tmp) && !refreshTokenExpiry
                ) {
                    clearIds.push(i); // ? Adiciona o id da sessão a ser removida

                    if (_user.session) {
                        _user.session.device.connected.splice(_user.session.device.connected.indexOf(_history.device), 1);

                        if (_user.session.connected > 0)
                            _user.session.connected -= 1;

                        _user.session.cache.tokens = _user.session.cache.tokens.filter((_token: Token): Token => {
                            if (_token.value === _history.token)
                                _token.status = false;

                            return _token;
                        });
                    }
                }

                return _history;
            });

            clearIds.forEach(i => {
                if (_user.session)
                    _user.session.cache.history.splice(i, 1);
            });

            // ? Remove os tokens de sessão que expiraram
            if (_user.session.cache.tokens.length > 0)
                _user.session.cache.tokens = _user.session.cache.tokens.filter(_token => new Date() <= new Date(_token.expiry));

            // ? Verifica se o numero de conexões permitidas foi atingido
            if (_user.session.connected >= _user.session.limit) {
                throw new Error(`Usuário com a autorização(${auth}), excedeu o limite de sessões.`);
            } else {
                const
                    unit = _user.session.cache.unit,
                    tmp = _user.session.cache.tmp,
                    timeForExpirySession = getTime(unit, tmp);

                _user.session.connected += 1;

                _user.session.device.connected.push(options.device);

                _user.session.cache.tokens.push({ signature: options.signature, value: options.token, expiry: timeForExpirySession.toJSON(), status: true });

                _user.session.cache.history.push({
                    signature: options.signature,
                    device: options.device,
                    token: options.token,
                    tmp: timeForExpirySession.toJSON(),
                    internetAdress: options.location.internetAdress
                });

                // ? Verifica se o alerta para o endereço de IP do usuário ainda não foi disparado
                if (_user.session.alerts.filter((internetAdress: string) => internetAdress === options.location.internetAdress).length <= 0) {
                    _user.session.alerts.push(options.location.internetAdress);
                    const email = _user.clearEmail,
                        username = _user.username;

                    // ! Cria um job para o envio de email quando a conta é acessada de outro IP
                    await Queue.addSessionNewAccess({
                        email,
                        username,
                        navigator: {
                            browser: options.location.browser,
                            os: options.location.os,
                            locationIP: options.location.locationIP,
                            internetAdress: options.location.internetAdress
                        }
                    });
                }

                await UsersSchema.updateOne({ authorization: auth }, {
                    $set: {
                        session: _user.session
                    }
                });
            }
        } else {
            throw new Error(`Usuário(${auth}) não está registrado.`);
        }

        return true;
    }

    /**
     * @description Desconecta o usuário
     */
    public async disconnected(auth: string, signature: string): Promise<boolean> {
        const _user = await UsersSchema.findOne({ authorization: auth });

        if (_user) {
            const clearIds: Array<number> = []; // ? Ids de sessões que serão removidas

            if (!_user.session)
                _user.session = sessionDefault;

            let index = 0; // ? Índice da sessão que será removida

            for (const _history of _user.session.cache.history) {
                // ? Verifica se o token armazenado é o mesmo que será desconectado
                if (_history.signature === signature) {
                    clearIds.push(index); // ? Adiciona o índice da sessão a ser removida

                    _user.session.device.connected.splice(_user.session.device.connected.indexOf(_history.device), 1);

                    if (_user.session.connected > 0)
                        _user.session.connected -= 1;

                    _user.session.cache.tokens = _user.session.cache.tokens.map((_token: Token): Token => {
                        if (_token.signature === _history.signature)
                            _token.status = false;

                        return _token;
                    });
                }

                index++;
            }

            if (clearIds.length > 0)
                clearIds.forEach(i => {
                    if (_user.session)
                        _user.session.cache.history.splice(i, 1)
                });

            await UsersSchema.updateOne({ authorization: auth }, {
                $set: {
                    session: _user.session
                }
            });
        } else {
            throw new Error(`Usuário(${auth}) não está registrado.`);
        }

        return true;
    }

    /**
     * @description Registra a autenticação de duas etapas
     */
    public async signtwofactor(auth: string): Promise<QRCode> {
        const _user = await UsersSchema.findOne({ authorization: auth });

        if (_user) {
            const {
                secret,
                qrcode
            } = await generateQRCode(_user.username);

            if (!_user.authentication)
                _user.authentication = authenticationDefault;

            _user.authentication.twofactor = {
                secret,
                enabled: false
            };

            await UsersSchema.updateOne({ authorization: auth }, {
                $set: {
                    authentication: _user.authentication
                }
            });

            return {
                secret,
                qrcode
            };
        } else {
            throw new Error(`Usuário(${auth}) não está registrado.`);
        }
    }

    /**
     * @description Verifica se a autenticação de duas etapas está configurada
     */
    public async hasConfiguredTwoFactor(auth: string): Promise<boolean> {
        const _user = await UsersSchema.findOne({ authorization: auth });

        if (_user) {
            if (
                _user.authentication &&
                _user.authentication.twofactor.secret.length > 0 &&
                _user.authentication.twofactor.enabled
            ) {
                return true;
            } else {
                return false;
            }
        } else {
            throw new Error(`Usuário(${auth}) não está registrado.`);
        }
    }

    /**
     * @description Habilita a verificação de duas etapas
     */
    public async enabledtwofactor(auth: string): Promise<boolean> {
        const _user = await UsersSchema.findOne({ authorization: auth });

        if (_user) {
            if (!_user.authentication)
                _user.authentication = authenticationDefault;

            _user.authentication.twofactor.enabled = true;

            await UsersSchema.updateOne({ authorization: auth }, {
                $set: {
                    authentication: _user.authentication
                }
            });
        } else {
            throw new Error(`Usuário(${auth}) não está registrado.`);
        }

        return true;
    }

    /**
     * @description Desabilita a verificação de duas etapas
     */
    public async disabledtwofactor(auth: string): Promise<boolean> {
        const _user = await UsersSchema.findOne({ authorization: auth });

        if (_user) {
            if (!_user.authentication)
                _user.authentication = authenticationDefault;

            _user.authentication.twofactor.enabled = false;

            await UsersSchema.updateOne({ authorization: auth }, {
                $set: {
                    authentication: _user.authentication
                }
            });
        } else {
            throw new Error(`Usuário(${auth}) não está registrado.`);
        }

        return true;
    }

    /**
     * @description Verifica o código da verificação de duas etapas
     */
    public async verifytwofactor(auth: string, userToken: string): Promise<boolean> {
        const _user = await UsersSchema.findOne({ authorization: auth });

        if (_user) {
            if (!_user.authentication)
                _user.authentication = authenticationDefault;

            const twofactor = _user.authentication.twofactor;

            await twoFactorVerify(twofactor.secret, userToken);
        } else {
            throw new Error(`Usuário(${auth}) não está registrado.`);
        }

        return true;
    }

    /**
     * @description Atualiza o token de segurança da sessão armazenada
     */
    public async updateTokenHistory(auth: string, signature: string): Promise<string[]> {
        const
            _user = await UsersSchema.findOne({ authorization: auth });

        if (_user) {
            if (!_user.session)
                _user.session = sessionDefault;

            const
                newSignature = _user.signature,
                newToken = await _user.token;

            const
                unit = _user.session.cache.unit,
                tmp = _user.session.cache.tmp,
                time = getTime(unit, tmp);

            for (const _history of _user.session.cache.history) {
                if (_history.signature == signature) {
                    _history.signature = newSignature;
                    _history.token = newToken;
                    _history.tmp = time.toJSON();
                }
            }

            for (const _token of _user.session.cache.tokens) {
                if (_token.signature == signature) {
                    _token.signature = newSignature;
                    _token.value = newToken;
                    _token.expiry = time.toJSON();
                }
            }

            await UsersSchema.updateOne({ authorization: auth }, {
                $set: {
                    session: _user.session
                }
            });

            return [newSignature, newToken];
        } else {
            throw new Error(`Usuário(${auth}) não está registrado.`);
        }
    }

    /**
     * @description Verifica o token de sessão
     */
    public async verifytoken(auth: string, token: string, signature: string, internetAdress: string): Promise<boolean> {
        const _user = await UsersSchema.findOne({ authorization: auth });

        if (_user) {
            if (!_user.session)
                _user.session = sessionDefault;


            const
                _usrToken = _user.session.cache.tokens.filter(_token => _token.signature === signature && _token.value === token)[0];

            // ? Verifica se existem alguma conexão usando o token
            if (
                _usrToken
            ) {
                // ? Verifica se o token está valido.
                if (!_usrToken.status) {
                    throw new Error(`Token de sessão não está mais valido.`);
                } else {
                    // ? Verifica se o token está vinculado ao endereço de IP
                    if (
                        _user.session.cache.history.filter(_history => _history.internetAdress === internetAdress).length <= 0
                    ) {
                        throw new Error(`Token de sessão está registrado em outro endereço de internet.`);
                    }
                }
            } else {
                throw new Error(`Token de sessão não está registrado.`);
            }
        } else {
            throw new Error(`Usuário(${auth}) não está registrado.`);
        }

        return true;
    }

    /**
     * @description Registra um novo refresh token
     */
    public async addRefreshToken(auth: string): Promise<RefreshToken> {
        try {
            const _user = await UsersSchema.findOne({ authorization: auth });

            if (_user) {
                if (!_user.session)
                    _user.session = sessionDefault;

                const now = new Date();

                now.setDate(now.getDate() + 7); // ? 7 dias de validade

                const token: RefreshToken = {
                    signature: _user.signature,
                    value: _user.refreshToken,
                    expiry: now
                };

                if (!_user.session.cache.refreshToken)
                    _user.session.cache.refreshToken = [];

                if (_user.session.cache.refreshToken.length <= 0) {
                    _user.session.cache.refreshToken.push(token);

                    await UsersSchema.updateOne({ authorization: auth }, {
                        $set: {
                            session: _user.session
                        }
                    });

                    return token;
                } else {
                    // ? Retorna o primeiro refresh token válido ou o novo token gerado
                    return _user.session.cache.refreshToken.find(refreshToken => new Date(refreshToken.expiry) > new Date()) || token;
                }
            } else {
                throw new Error(`Usuário(${auth}) não está registrado.`);
            }
        } catch {
            throw new Error(`Não é possivel adicionar um novo refresh token para o usuário(${auth}).`);
        }
    }

    /**
     * @description Verifica um refresh token
     */
    public async verifyRefreshToken(auth: string, signature: string, refreshToken: string): Promise<void> {
        const _user = await UsersSchema.findOne({ authorization: auth });

        if (_user) {
            if (!_user.session)
                _user.session = sessionDefault;

            const tokens = _user.session.cache.refreshToken.filter(token => {
                if (new Date(token.expiry) >= new Date() && token.signature === signature && token.value === refreshToken)
                    return true;

                return false;
            }) || [];

            if (tokens.length <= 0)
                throw new Error(`Refresh Token(${refreshToken}) não está registrado ou está expirado.`);
        } else {
            throw new Error(`Usuário(${auth}) não está registrado.`);
        }
    }

    /**
     * @description Remove o refresh token
     */
    public async removeRefreshToken(auth: string, signature: string, refreshToken: string): Promise<void> {
        const _user = await UsersSchema.findOne({ authorization: auth });

        if (_user) {
            if (!_user.session)
                _user.session = sessionDefault;

            const tokens = _user.session.cache.refreshToken.filter(token => {
                if (token.signature === signature && token.value !== refreshToken)
                    return true;

                return false;
            }) || [];

            if (tokens.length > 0) {
                _user.session.cache.refreshToken = tokens;

                await UsersSchema.updateOne({ authorization: auth }, {
                    $set: {
                        session: _user.session
                    }
                });
            } else {
                throw new Error(`Usuário(${auth}) não possui refresh tokens.`);
            }
        } else {
            throw new Error(`Usuário(${auth}) não está registrado.`);
        }
    }

    /**
     * @description Remove os refresh tokens expirados
     */
    public async clearExpiredRefreshToken(auth: string): Promise<void> {
        const _user = await UsersSchema.findOne({ authorization: auth });

        if (_user) {
            if (!_user.session)
                _user.session = sessionDefault;

            if (
                _user.session.cache.refreshToken.length > 0
            ) {
                _user.session.cache.refreshToken = _user.session.cache.refreshToken.filter(token => {
                    if (new Date(token.expiry) > new Date())
                        return true;

                    return false;
                });

                await UsersSchema.updateOne({ authorization: auth }, {
                    $set: {
                        session: _user.session
                    }
                });
            }
        } else {
            throw new Error(`Usuário(${auth}) não está registrado.`);
        }
    }
}