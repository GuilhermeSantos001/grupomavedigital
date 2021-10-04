/**
 * @description Gerenciador de informações com o banco de dados
 * @author @GuilhermeSantos001
 * @update 01/09/2021
 * @version 1.1.9
 */

import userDB, { UserInterface, UserModelInterface, PrivilegesSystem, Location, Authentication, Session, Devices, History, Token, RefreshToken, authenticationDefault, sessionDefault } from '@/mongo/user-manager-mongo';
import { Encrypt, Decrypt } from '@/utils/bcrypt';
import { verify as twoFactorVerify, generateQRCode, QRCode } from '@/utils/twoFactor';
import Jobs from '@/app/core/jobs';
import JsonWebToken from '@/core/jsonWebToken';
import Moment from '@/utils/moment';

declare interface FindUserByAuth {
    authorization: string;
}

export interface UserInfo {
    authorization: string;
    privileges: PrivilegesSystem[];
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

class userManagerDB {
    /**
     * @description Registra o usuário
     */
    public register(user: UserInterface) {
        return new Promise<boolean>(async (resolve, reject) => {
            try {
                const filter: FindUserByAuth = { authorization: user.authorization };

                const _user = await userDB.findOne(filter).exec();

                if (_user) {
                    return reject(`Usuário(${user.authorization}) já está registrado`);
                }

                user.password = await Encrypt(user.password);

                const model = await userDB.create({
                    ...user,
                    createdAt: Moment.format()
                });

                await model.validate();
                await model.save();

                return resolve(true);
            } catch (error) {
                return reject(error);
            }
        });
    }

    /**
     * @description Retorna o total de usuários ativos e inativos
     */
    public getUsersEnabledAndDisabled() {
        return new Promise<number[]>(async (resolve, reject) => {
            try {
                const totals: number[] = [];

                const _user = await userDB.find({}).exec();

                if (_user) {
                    totals.push(_user.filter((user: UserModelInterface) => user.isEnabled).length);
                    totals.push(_user.filter((user: UserModelInterface) => !user.isEnabled).length);
                } else {
                    return reject(`Nenhum usuário está registrado.`);
                }

                return resolve(totals);
            } catch (error) {
                return reject(error);
            }
        });
    }

    /**
     * @description Recupera a conta de usuário
     */
    public retrieve(auth: string) {
        return new Promise<boolean>(async (resolve, reject) => {
            try {
                const filter: FindUserByAuth = { authorization: auth };

                const _user = await userDB.findOne(filter).exec();

                if (_user) {
                    if (!_user.authentication)
                        _user.authentication = authenticationDefault;

                    _user.authentication.twofactor = { secret: '', enabled: false };

                    await _user.save();
                } else {
                    return reject(`Usuário(${auth}) não está registrado.`);
                }

                return resolve(true);
            } catch (error) {
                return reject(error);
            }
        });
    }

    /**
     * @description Confirma a conta de usuário
     */
    public confirmEmail(auth: string) {
        return new Promise<boolean>(async (resolve, reject) => {
            try {
                const filter: FindUserByAuth = { authorization: auth };

                const _user = await userDB.findOne(filter).exec();

                if (_user) {
                    _user.email.status = true;

                    await _user.save();
                } else {
                    return reject(`Usuário(${auth}) não está registrado.`);
                }

                return resolve(true);
            } catch (error) {
                return reject(error);
            }
        });
    }

    /**
     * @description Verifica a senha de usuário
     */
    public cpassword(auth: string, pwd: string) {
        return new Promise<UserInfo>(async (resolve, reject) => {
            try {
                const filter: FindUserByAuth = { authorization: auth };

                const _user = await userDB.findOne(filter).exec();

                if (_user) {
                    try {
                        if (!await Decrypt(pwd, _user.password)) {
                            return reject(`Senha está invalida, tente novamente!`);
                        }
                    } catch (error) {
                        return reject(error);
                    }
                } else {
                    return reject(`Usuário(${auth}) não está registrado.`);
                }

                if (!_user.session)
                    _user.session = sessionDefault;

                if (!_user.authentication)
                    _user.authentication = authenticationDefault;

                return resolve({
                    authorization: _user.authorization,
                    privileges: _user.privileges,
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
                });
            } catch (error) {
                return reject(error);
            }
        });
    }

    /**
     * @description Troca a senha do usuário
     */
    public changePassword(auth: string, newpass: string) {
        return new Promise<boolean>(async (resolve, reject) => {
            try {
                const filter: FindUserByAuth = { authorization: auth };

                const _user = await userDB.findOne(filter).exec();

                if (_user) {
                    _user.password = await Encrypt(newpass);

                    await _user.save();
                } else {
                    return reject(`Usuário(${auth}) não está registrado.`);
                }

                return resolve(true);
            } catch (error) {
                return reject(error);
            }
        });
    }

    /**
     * @description Registra a assinatura para que o usuario possa
     * trocar a senha
     */
    public forgotPasswordSignatureRegister(auth: string, signature: string) {
        return new Promise<boolean>(async (resolve, reject) => {
            try {
                const filter: FindUserByAuth = { authorization: auth };

                const _user = await userDB.findOne(filter).exec();

                if (_user) {
                    if (!_user.authentication)
                        _user.authentication = authenticationDefault;

                    _user.authentication.forgotPassword = signature;

                    await _user.save();
                } else {
                    return reject(`Usuário(${auth}) não está registrado.`);
                }

                return resolve(true);
            } catch (error) {
                return reject(error);
            }
        });
    }

    /**
     * @description Atualiza as informações para UX/UI.
     */
    public updateData(auth: string, updateData: UpdateUserInfo) {
        return new Promise<boolean>(async (resolve, reject) => {
            try {
                const filter: FindUserByAuth = { authorization: auth };

                const _user = await userDB.findOne(filter).exec();

                if (_user) {
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

                        // Cria um job para o envio de email para confirmação da conta
                        await Jobs.append({
                            name: 'Sends account confirmation after change in account email',
                            type: 'mailsend',
                            priority: 'High',
                            args: {
                                email,
                                username,
                                auth: authorization,
                                token: jwt,
                                temporarypass: null,
                                clientAddress: 'System'
                            },
                            status: 'Available'
                        });
                    }

                    _user.username = updateData.username;
                    _user.name = updateData.name;
                    _user.surname = updateData.surname;
                    _user.cnpj = updateData.cnpj;
                    _user.location = updateData.location;

                    await _user.save();
                } else {
                    return reject(`Usuário(${auth}) não está registrado.`);
                }

                return resolve(true);
            } catch (error) {
                return reject(error);
            }
        });
    }

    /**
     * @description Atualiza a foto de perfil para UX/UI.
     */
    public updatePhotoProfile(auth: string, photo: string) {
        return new Promise<boolean>(async (resolve, reject) => {
            try {
                const filter: FindUserByAuth = { authorization: auth };

                const _user = await userDB.findOne(filter).exec();

                if (_user) {
                    _user.photoProfile = photo;

                    await _user.save();
                } else {
                    return reject(`Usuário(${auth}) não está registrado.`);
                }

                return resolve(true);
            } catch (error) {
                return reject(error);
            }
        });
    }

    /**
     * @description Recupera as informações para UX/UI.
     */
    public getInfo(auth: string): Promise<Omit<UserInfo, "token">> {
        return new Promise(async (resolve, reject) => {
            try {
                const filter: FindUserByAuth = { authorization: auth };

                const _user = await userDB.findOne(filter).exec();

                if (!_user) {
                    return reject(`Usuário(${auth}) não está registrado.`);
                }

                if (!_user.session)
                    _user.session = sessionDefault;

                if (!_user.authentication)
                    _user.authentication = authenticationDefault;

                return resolve({
                    authorization: _user.authorization,
                    privileges: _user.privileges,
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
                });
            } catch (error) {
                return reject(error);
            }
        });
    }

    /**
     * @description Conecta o usuário
     */
    public connected(auth: string, options: ConnectedOptions) {
        return new Promise<boolean>(async (resolve, reject) => {
            try {
                const filter: FindUserByAuth = { authorization: auth };

                const _user = await userDB.findOne(filter).exec();

                if (_user) {
                    if (!_user.session)
                        _user.session = sessionDefault;

                    try {
                        const clearIds: Array<number> = [];

                        // - Verifica se o email do usuário foi confirmado
                        if (!_user.email.status) {
                            return reject(`Usuário com a autorização(${auth}), não confirmou o email.`);
                        }

                        // - Verifica se o dispositivo está liberado para acesso
                        if (_user.session.device.allowed.filter(_device => _device === options.device).length <= 0) {
                            return reject(`Usuário com a autorização(${auth}), está utilizando um dispositivo não permitido há estabelecer sessões.`);
                        }

                        // - Verifica se existe alguma sessão expirada
                        _user.session.cache.history = _user.session.cache.history.filter((_history: History, i): History => {
                            if (
                                new Date(_history.tmp) <= new Date()
                            ) {
                                clearIds.push(i);

                                if (_user.session)
                                    _user.session.device.connected.splice(_user.session.device.connected.indexOf(_history.device), 1);

                                if (_user.session && _user.session.connected > 0)
                                    _user.session.connected -= 1;

                                if (_user.session)
                                    _user.session.cache.tokens = _user.session.cache.tokens.filter((_token: Token): Token => {
                                        if (_token.value === _history.token)
                                            _token.status = false;

                                        return _token;
                                    });
                            }

                            return _history;
                        });

                        clearIds.forEach(i => {
                            if (_user.session)
                                _user.session.cache.history.splice(i, 1);
                        });

                        if (_user.session.connected >= _user.session.limit) {
                            return reject(`Usuário com a autorização(${auth}), excedeu o limite de sessões.`);
                        } else {
                            _user.session.connected += 1;

                            _user.session.device.connected.push(options.device);

                            _user.session.cache.tokens.push({ signature: options.signature, value: options.token, status: true });

                            const time = new Date();

                            if (_user.session.cache.unit === 'm') {
                                time.setMinutes(time.getMinutes() + _user.session.cache.tmp);
                            } else if (_user.session.cache.unit === 'h') {
                                time.setHours(time.getHours() + _user.session.cache.tmp);
                            } else if (_user.session.cache.unit === 'd') {
                                time.setDate(time.getDate() + _user.session.cache.tmp);
                            }

                            _user.session.cache.history.push({
                                device: options.device,
                                token: options.token,
                                tmp: time.toJSON(),
                                internetAdress: options.location.internetAdress
                            });

                            if (_user.session.alerts.filter((internetAdress: string) => internetAdress === options.location.internetAdress).length <= 0) {
                                _user.session.alerts.push(options.location.internetAdress);
                                const email = _user.clearEmail,
                                    username = _user.username;

                                // Cria um job para o envio de email quando a conta é acessada de outro IP
                                await Jobs.append({
                                    name: 'mail sent when the user accesses the account from another IP',
                                    type: 'mailsend',
                                    priority: 'High',
                                    args: {
                                        email,
                                        username,
                                        navigator: {
                                            browser: options.location.browser,
                                            os: options.location.os,
                                            locationIP: options.location.locationIP,
                                            internetAdress: options.location.internetAdress
                                        },
                                        clientAddress: 'System'
                                    },
                                    status: 'Available'
                                });
                            }

                            await _user.save();
                        }
                    } catch (error) {
                        return reject(error);
                    }
                } else {
                    return reject(`Usuário(${auth}) não está registrado.`);
                }

                return resolve(true);
            } catch (error) {
                return reject(error);
            }
        });
    }

    /**
     * @description Desconecta o usuário
     */
    public disconnected(auth: string, token: string) {
        return new Promise<boolean>(async (resolve, reject) => {
            try {
                const filter: FindUserByAuth = { authorization: auth };

                const _user = await userDB.findOne(filter).exec();

                if (_user) {
                    const clearIds: Array<number> = [];

                    if (!_user.session)
                        _user.session = sessionDefault;

                    for (const [index, _history] of _user.session.cache.history.entries()) {
                        if (_history.token === token) {
                            clearIds.push(index);

                            _user.session.device.connected.splice(_user.session.device.connected.indexOf(_history.device), 1);

                            if (_user.session.connected > 0)
                                _user.session.connected -= 1;

                            if (!_user.session)
                                _user.session = sessionDefault;

                            _user.session.cache.tokens = _user.session.cache.tokens.map((_token: Token): Token => {
                                if (_token.value === _history.token)
                                    _token.status = false;

                                return _token;
                            });
                        }
                    }

                    if (clearIds.length > 0)
                        clearIds.forEach(i => {
                            if (_user.session)
                                _user.session.cache.history.splice(i, 1)
                        });


                    await _user.save();
                } else {
                    return reject(`Usuário(${auth}) não está registrado.`);
                }

                return resolve(true);
            } catch (error) {
                return reject(error);
            }
        });
    }

    /**
     * @description Registra a autenticação de duas etapas
     */
    public signtwofactor(auth: string) {
        return new Promise<QRCode>(async (resolve, reject) => {
            try {
                const filter: FindUserByAuth = { authorization: auth };

                const _user = await userDB.findOne(filter).exec();

                if (_user) {
                    try {
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

                        await _user.save();

                        return resolve({
                            secret,
                            qrcode
                        });
                    } catch (error) {
                        return reject(error);
                    }
                } else {
                    return reject(`Usuário(${auth}) não está registrado.`);
                }
            } catch (error) {
                return reject(error);
            }
        });
    }

    /**
     * @description Verifica se a autenticação de duas etapas está configurada
     */
    public hasConfiguredTwoFactor(auth: string) {
        return new Promise<boolean>(async (resolve, reject) => {
            try {
                const filter: FindUserByAuth = { authorization: auth };

                const _user = await userDB.findOne(filter).exec();

                if (_user) {
                    try {
                        if (
                            _user.authentication &&
                            _user.authentication.twofactor.secret.length > 0 &&
                            _user.authentication.twofactor.enabled
                        ) {
                            return resolve(true);
                        } else {
                            return resolve(false);
                        }
                    } catch (error) {
                        return reject(error);
                    }
                } else {
                    return reject(`Usuário(${auth}) não está registrado.`);
                }
            } catch (error) {
                return reject(error);
            }
        });
    }

    /**
     * @description Habilita a verificação de duas etapas
     */
    public enabledtwofactor(auth: string) {
        return new Promise<boolean>(async (resolve, reject) => {
            try {
                const filter: FindUserByAuth = { authorization: auth };

                const _user = await userDB.findOne(filter).exec();

                if (_user) {
                    try {
                        if (!_user.authentication)
                            _user.authentication = authenticationDefault;

                        _user.authentication.twofactor.enabled = true;

                        await _user.save();
                    } catch (error) {
                        return reject(error);
                    }

                } else {
                    return reject(`Usuário(${auth}) não está registrado.`);
                }

                return resolve(true);
            } catch (error) {
                return reject(error);
            }
        });
    }

    /**
     * @description Desabilita a verificação de duas etapas
     */
    public disabledtwofactor(auth: string) {
        return new Promise<boolean>(async (resolve, reject) => {
            try {
                const filter: FindUserByAuth = { authorization: auth };

                const _user = await userDB.findOne(filter).exec();

                if (_user) {
                    try {
                        if (!_user.authentication)
                            _user.authentication = authenticationDefault;

                        _user.authentication.twofactor.enabled = false;

                        await _user.save();
                    } catch (error) {
                        return reject(error);
                    }
                } else {
                    return reject(`Usuário(${auth}) não está registrado.`);
                }

                return resolve(true);
            } catch (error) {
                return reject(error);
            }
        });
    }

    /**
     * @description Verifica o código da verificação de duas etapas
     */
    public verifytwofactor(auth: string, userToken: string) {
        return new Promise<boolean>(async (resolve, reject) => {
            try {
                const filter: FindUserByAuth = { authorization: auth };

                const _user = await userDB.findOne(filter).exec();

                if (_user) {
                    try {
                        if (!_user.authentication)
                            _user.authentication = authenticationDefault;

                        const twofactor = _user.authentication.twofactor;

                        await twoFactorVerify(twofactor.secret, userToken);
                    } catch (error) {
                        return reject(error);
                    }
                } else {
                    return reject(`Usuário(${auth}) não está registrado.`);
                }

                return resolve(true);
            } catch (error) {
                return reject(error);
            }
        });
    }

    /**
     * @description Atualiza o token de segurança da sessão armazenada
     */
    public updateTokenHistory(auth: string, token: string): Promise<string[]> {
        return new Promise(async (resolve, reject) => {
            try {
                const filter: FindUserByAuth = { authorization: auth };

                const
                    _user = await userDB.findOne(filter).exec();

                if (_user) {
                    try {
                        if (!_user.session)
                            _user.session = sessionDefault;

                        const
                            newSignature = _user.signature,
                            newToken = await _user.token;

                        if (_user.session.cache.history.length > 0)
                            for (const _history of _user.session.cache.history) {
                                if (_history.token === token)
                                    _history.token = newToken;
                            }

                        if (_user.session.cache.tokens.length > 0)
                            for (const _token of _user.session.cache.tokens) {
                                if (_token.value === token) {
                                    _token.signature = newSignature;
                                    _token.value = newToken;
                                }
                            }

                        await _user.save();

                        return resolve([newSignature, newToken]);
                    } catch (error) {
                        return reject(error);
                    }
                } else {
                    return reject(`Usuário(${auth}) não está registrado.`);
                }
            } catch (error) {
                return reject(error);
            }
        });
    }

    /**
     * @description Verifica o token de sessão
     */
    public verifytoken(auth: string, token: string, signature: string, internetAdress: string) {
        return new Promise<boolean>(async (resolve, reject) => {
            try {
                const filter: FindUserByAuth = { authorization: auth };

                const _user = await userDB.findOne(filter).exec();

                if (_user) {
                    try {
                        if (!_user.session)
                            _user.session = sessionDefault;

                        const _usrToken = _user.session.cache.tokens.filter(_token => _token.signature === signature && _token.value === token)[0];

                        // - Verifica se existem alguma conexão usando o token
                        if (
                            _usrToken
                        ) {
                            // - Verifica se o token está valido.
                            if (!_usrToken.status) {
                                return reject(`Token de sessão não está mais valido.`);
                            } else {
                                // - Verifica se o token está vinculado ao endereço de IP
                                if (
                                    _user.session.cache.history.filter(_history => _history.internetAdress === internetAdress).length <= 0
                                ) {
                                    return reject(`Token de sessão está registrado em outro endereço de internet.`);
                                }
                            }
                        } else {
                            return reject(`Token de sessão não está registrado.`);
                        }
                    } catch (error) {
                        return reject(error);
                    }
                } else {
                    return reject(`Usuário(${auth}) não está registrado.`);
                }

                return resolve(true);
            } catch (error) {
                return reject(error);
            }
        });
    }

    /**
     * @description Registra um novo refresh token
     */
    public addRefreshToken(auth: string): Promise<RefreshToken> {
        return new Promise(async (resolve, reject) => {
            try {
                const filter: FindUserByAuth = { authorization: auth };

                const _user = await userDB.findOne(filter).exec();

                if (_user) {
                    let now = new Date();

                    now.setDate(now.getDate() + 7);

                    const token: RefreshToken = {
                        signature: _user.signature,
                        value: _user.refreshToken,
                        expiry: now
                    };

                    if (
                        _user.session &&
                        _user.session.cache &&
                        !_user.session.cache.refreshToken
                    )
                        _user.session.cache.refreshToken = [];

                    if (
                        _user.session &&
                        _user.session.cache &&
                        _user.session.cache.refreshToken
                    ) {
                        if (_user.session.cache.refreshToken.length <= 0) {
                            _user.session.cache.refreshToken.push(token);

                            await _user.save();

                            return resolve(token);
                        } else {
                            return resolve(_user.session.cache.refreshToken[0] || token);
                        }
                    }

                    return reject(`Não é possivel adicionar um novo refresh token para o usuário(${auth}).`);
                } else {
                    return reject(`Usuário(${auth}) não está registrado.`);
                }
            } catch (error) {
                return reject(error);
            }
        });
    }

    /**
     * @description Verifica um refresh token
     */
    public verifyRefreshToken(auth: string, signature: string, refreshToken: string): Promise<void> {
        return new Promise(async (resolve, reject) => {
            try {
                const filter: FindUserByAuth = { authorization: auth };

                const _user = await userDB.findOne(filter).exec();

                if (_user) {
                    let now = new Date();

                    const tokens = _user.session?.cache.refreshToken.filter(token => {
                        if (token.expiry >= now && token.signature === signature && token.value === refreshToken)
                            return true;

                        return false;
                    }) || [];

                    if (tokens.length > 0) {
                        return resolve();
                    } else {
                        return reject(`Refresh Token(${refreshToken}) não está registrado.`);
                    }
                } else {
                    return reject(`Usuário(${auth}) não está registrado.`);
                }
            } catch (error) {
                return reject(error);
            }
        });
    }

    /**
     * @description Remove o refresh token
     */
    public removeRefreshToken(auth: string, signature: string, refreshToken: string): Promise<void> {
        return new Promise(async (resolve, reject) => {
            try {
                const filter: FindUserByAuth = { authorization: auth };

                const _user = await userDB.findOne(filter).exec();

                if (_user) {
                    const tokens = _user.session?.cache.refreshToken.filter(token => {
                        if (token.signature === signature && token.value !== refreshToken)
                            return true;

                        return false;
                    }) || [];

                    if (tokens.length > 0) {
                        if (_user.session && _user.session.cache) {
                            _user.session.cache.refreshToken = tokens;
                            await _user.save();
                        }

                        return resolve();
                    } else {
                        return reject(`Usuário(${auth}) não possui refresh tokens.`);
                    }
                } else {
                    return reject(`Usuário(${auth}) não está registrado.`);
                }
            } catch (error) {
                return reject(error);
            }
        });
    }

    /**
     * @description Remove os refresh tokens expirados
     */
    public clearExpiredRefreshToken(auth: string): Promise<void> {
        return new Promise(async (resolve, reject) => {
            try {
                const filter: FindUserByAuth = { authorization: auth };

                const _user = await userDB.findOne(filter).exec();

                if (_user) {
                    let now = new Date();

                    if (
                        _user.session &&
                        _user.session.cache &&
                        _user.session.cache.refreshToken instanceof Array &&
                        _user.session.cache.refreshToken.length > 0
                    ) {
                        _user.session.cache.refreshToken = _user.session.cache.refreshToken.filter(token => {
                            if (token.expiry >= now)
                                return true;

                            return false;
                        });

                        await _user.save();
                    }

                    return resolve();
                } else {
                    return reject(`Usuário(${auth}) não está registrado.`);
                }
            } catch (error) {
                return reject(error);
            }
        });
    }
}

export default new userManagerDB();