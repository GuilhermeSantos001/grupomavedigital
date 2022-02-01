/**
 * @description Rotas dos usuários
 * @author GuilhermeSantos001
 * @update 31/01/2022
 */

import getReqProps from '@/utils/getReqProps';
import { ActivitiesManagerDB } from '@/database/ActivitiesManagerDB';
import { UsersManagerDB } from '@/database/UsersManagerDB';
import { JsonWebToken } from '@/lib/JsonWebToken';
import { Encrypt } from '@/utils/bcrypt';
import Queue from '@/lib/Queue';
import { Debug } from '@/lib/Log4';
import generatePassword from '@/utils/generatePassword';
import { PrivilegesSystem } from '@/schemas/UsersSchema';
import geoIP, { clearIPAddress } from '@/utils/geoIP';
import { ExpressContext } from 'apollo-server-express';
import { compressToBase64, decompressFromBase64 } from 'lz-string';

export type UpdatedToken = { signature: string, token: string }

export default {
    Query: {
        authLogin: async (parent: unknown, args: { auth: string, pwd: string, twofactortoken: string }, context: { express: ExpressContext }) => {
            try {
                const
                    usersManagerDB = new UsersManagerDB(),
                    activitiesManagerDB = new ActivitiesManagerDB(),
                    {
                        authorization,
                        privileges,
                        username,
                        email,
                        name,
                        surname,
                        session,
                        signature,
                        token,
                        authentication
                    } = await usersManagerDB.confirmPassword(args.auth, args.pwd);

                let
                    userInfo = {
                        authorization,
                        privileges,
                        username,
                        email,
                        name,
                        surname,
                        session,
                        authentication,
                        signature,
                        token,
                        refreshToken: {},
                    };

                const
                    req: any = context.express.req,
                    device: any = req.device,
                    clientIP = geoIP(req);

                if (userInfo['authentication']['twofactor']['enabled'] && args.twofactortoken.length <= 0) {
                    userInfo['token'] = 'twofactorVerify';

                    return userInfo;
                } else if (userInfo['authentication']['twofactor']['enabled'] && args.twofactortoken.length > 0) {
                    if (!await usersManagerDB.verifytwofactor(args.auth, args.twofactortoken)) {
                        userInfo['token'] = 'twofactorDenied';

                        return userInfo;
                    }
                }

                await usersManagerDB.connected(args.auth, {
                    ip: clearIPAddress(String(clientIP.ip).replace('::1', '127.0.0.1')),
                    token: userInfo['token'],
                    device: device['type'],
                    location: {
                        locationIP: clientIP.location,
                        internetAdress: clearIPAddress(String(clientIP.ip).replace('::1', '127.0.0.1')),
                        browser: device.parser.useragent['family'],
                        os: device.parser.useragent['os']['family']
                    },
                    signature: userInfo['signature']
                });

                await usersManagerDB.clearExpiredRefreshToken(args.auth);

                userInfo['refreshToken'] = await usersManagerDB.addRefreshToken(args.auth);

                await activitiesManagerDB.register({
                    ipremote: clearIPAddress(String(clientIP.ip).replace('::1', '127.0.0.1')),
                    auth: userInfo['authorization'],
                    privileges: userInfo['privileges'],
                    roadmap: 'Se conectou ao sistema'
                });

                return userInfo;
            } catch (error) {
                const
                    req = context.express.req,
                    clientIP = geoIP(req);

                Debug.fatal('user', `Erro ocorrido na hora de conectar o usuário(${args.auth})`, String(error), `IP-Request: ${clearIPAddress(String(clientIP.ip).replace('::1', '127.0.0.1'))}`, `GraphQL - Query`, `Method: authLogin`);

                throw new Error(String(error));
            }
        },
        authLogout: async (parent: unknown, args: { auth: string, token: string, signature: string }, context: { express: ExpressContext }) => {
            try {
                const
                    usersManagerDB = new UsersManagerDB(),
                    activitiesManagerDB = new ActivitiesManagerDB(),
                    { ip } = geoIP(context.express.req),
                    internetadress = ip,
                    { privileges } = await usersManagerDB.getInfo(args.auth);

                await usersManagerDB.verifytoken(args.auth, args.token, args.signature, clearIPAddress(String(internetadress).replace('::1', '127.0.0.1')));
                await usersManagerDB.disconnected(args.auth, args.token);
                await usersManagerDB.clearExpiredRefreshToken(args.auth);

                await JsonWebToken.cancel(args.token);
                await activitiesManagerDB.register({
                    ipremote: ip,
                    auth: args.auth,
                    privileges,
                    roadmap: 'Se desconectou do sistema'
                });

                return true;
            } catch (error) {
                const
                    req = context.express.req,
                    clientIP = geoIP(req);

                Debug.fatal('user', `Erro ocorrido na hora de desconectar o usuário(${args.auth}) desconectado`, String(error), `IP-Request: ${clearIPAddress(String(clientIP.ip).replace('::1', '127.0.0.1'))}`, `GraphQL - Query`, `Method: authLogout`);

                throw new Error(String(error));
            }
        },
        authValidate: async (parent: unknown, args: {
            auth: string,
            token: string,
            signature: string,
            refreshToken: {
                signature: string,
                value: string
            }
        }, context: { express: ExpressContext }) => {
            try {
                const
                    usersManagerDB = new UsersManagerDB(),
                    { ip } = geoIP(context.express.req),
                    internetadress = ip;

                try {
                    await JsonWebToken.verify(args.token);
                    await usersManagerDB.verifytoken(args.auth, args.token, args.signature, clearIPAddress(String(internetadress).replace('::1', '127.0.0.1')));

                    return { success: true };
                } catch {
                    if (args.refreshToken) {
                        try {
                            await usersManagerDB.verifyRefreshToken(args.auth, args.refreshToken.signature, args.refreshToken.value);
                            const updateHistory = await usersManagerDB.updateTokenHistory(args.auth, args.token);

                            return { success: true, signature: updateHistory[0], token: updateHistory[1] };
                        } catch {
                            return { success: false };
                        }
                    }

                    return { success: false };
                }
            } catch (error) {
                const
                    req = context.express.req,
                    clientIP = geoIP(req);

                Debug.fatal('user', `Erro ocorrido na hora de verificar se a sessão(${args.token}) está autorizada`, String(error), `IP-Request: ${clearIPAddress(String(clientIP.ip).replace('::1', '127.0.0.1'))}`, `GraphQL - Query`, `Method: authValidate`);

                throw new Error(String(error));
            }
        },
        authForgotPassword: async (parent: unknown, args: { auth: string }, context: { express: ExpressContext }) => {
            try {
                const
                    usersManagerDB = new UsersManagerDB(),
                    {
                        username,
                        email,
                        signature,
                    } = await usersManagerDB.getInfo(args.auth);

                await usersManagerDB.forgotPasswordSignatureRegister(args.auth, signature);

                const jwt = await JsonWebToken.sign({
                    payload: {
                        'auth': compressToBase64(String(args.auth).toLowerCase()),
                        'signature': compressToBase64(String(signature))
                    },
                    options: {
                        expiresIn: '1h'
                    }
                });

                if (typeof jwt === 'string') {
                    // ! Cria um job para o envio de e-mail para alteração de senha da conta
                    await Queue.addAccountForgotPassword({
                        email,
                        username,
                        signature,
                        token: jwt
                    });

                    return true;
                }

                return false;
            } catch (error) {
                const
                    req = context.express.req,
                    clientIP = geoIP(req);

                Debug.fatal('user', `Erro ocorrido na hora de enviar o e-mail de alteração de senha da conta do usuário(${args.auth})`, String(error), `IP-Request: ${clearIPAddress(String(clientIP.ip).replace('::1', '127.0.0.1'))}`, `GraphQL - Query`, `Method: authForgotPassword`);

                throw new Error(String(error));
            }
        },
        emailResendConfirm: async (parent: unknown, args: { auth: string }, context: { express: ExpressContext }) => {
            try {
                const
                    usersManagerDB = new UsersManagerDB(),
                    req = context.express.req;

                let { temporarypass } = getReqProps(req, ['temporarypass']);

                temporarypass = String(temporarypass).toLowerCase() === 'true' ? true : false;

                const
                    userInfo = await usersManagerDB.getInfo(args.auth),
                    email = userInfo['email'],
                    username = userInfo['username'];

                let newpassword;

                if (temporarypass) {
                    newpassword = generatePassword.unique();
                    await usersManagerDB.changePassword(args.auth, newpassword);
                }

                const jwt = await JsonWebToken.sign({
                    payload: {
                        'auth': compressToBase64(String(args.auth).toLowerCase()),
                    },
                    options: {
                        expiresIn: '7d'
                    }
                });

                if (typeof jwt === 'string') {
                    // ! Cria um job para o envio de e-mail para confirmação da conta
                    await Queue.addConfirmMail({
                        email,
                        username,
                        token: jwt,
                        temporarypass: temporarypass ? newpassword || '' : null,
                    });

                    return true;
                }

                return false;
            } catch (error) {
                const
                    req = context.express.req,
                    clientIP = geoIP(req);

                Debug.fatal('user', `Erro ocorrido na hora de enviar o e-mail de confirmação da conta do usuário(${args.auth})`, String(error), `IP-Request: ${clearIPAddress(String(clientIP.ip).replace('::1', '127.0.0.1'))}`, `GraphQL - Query`, `Method: emailResendConfirm`);

                throw new Error(String(error));
            }
        },
        mailConfirm: async (parent: unknown, args: { token: string }, context: { express: ExpressContext }) => {
            try {
                const
                    usersManagerDB = new UsersManagerDB(),
                    { auth } = await JsonWebToken.verify(args.token)

                if (await usersManagerDB.confirmAccount(decompressFromBase64(auth) || "")) {
                    return true;
                } else {
                    return false;
                }
            } catch (error) {
                const
                    req = context.express.req,
                    clientIP = geoIP(req);

                Debug.fatal('user', `Erro ocorrido na hora de confirmar a conta do usuário.`, String(error), `IP-Request: ${clearIPAddress(String(clientIP.ip).replace('::1', '127.0.0.1'))}`, `GraphQL - Query`, `Method: mailConfirm`);

                throw new Error(String(error));
            }
        },
        processOrderForgotPassword: async (parent: unknown, args: { signature: string, token: string, pwd: string }, context: { express: ExpressContext }) => {
            try {
                const
                    usersManagerDB = new UsersManagerDB(),
                    decoded = await JsonWebToken.verify(args.token)

                if (
                    !decoded ||
                    decompressFromBase64(decoded['signature']) !== args.signature
                )
                    return false;

                const auth = decompressFromBase64(decoded['auth']) || "";

                const {
                    authentication,
                } = await usersManagerDB.getInfo(auth);

                if (authentication.forgotPassword !== args.signature)
                    return false;

                if (await usersManagerDB.changePassword(auth, args.pwd)) {
                    return true;
                } else {
                    return false;
                }
            } catch (error) {
                const
                    req = context.express.req,
                    clientIP = geoIP(req);

                Debug.fatal('user', `Erro ocorrido na hora de alterar a senha da conta do usuário.`, String(error), `IP-Request: ${clearIPAddress(String(clientIP.ip).replace('::1', '127.0.0.1'))}`, `GraphQL - Query`, `Method: processOrderForgotPassword`);

                throw new Error(String(error));
            }
        },
        getUserInfo: async (parent: unknown, args: { auth: string, updatedToken?: UpdatedToken }, context: { express: ExpressContext }) => {
            try {
                const
                    usersManagerDB = new UsersManagerDB(),
                    {
                        privileges,
                        privilege,
                        photoProfile,
                        username,
                        email,
                        name,
                        surname,
                        cnpj,
                        location
                    } = await usersManagerDB.getInfo(args.auth);

                return {
                    privileges,
                    privilege,
                    photoProfile,
                    username,
                    email,
                    name,
                    surname,
                    cnpj,
                    location,
                    updatedToken: args.updatedToken,
                };
            } catch (error) {
                const
                    req = context.express.req,
                    clientIP = geoIP(req);

                Debug.fatal('user', `Erro ocorrido na hora de retornar as informações do usuário(${args.auth})`, String(error), `IP-Request: ${clearIPAddress(String(clientIP.ip).replace('::1', '127.0.0.1'))}`, `GraphQL - Query`, `Method: getUserInfo`);

                throw new Error(String(error));
            }
        }
    },
    Mutation: {
        registerUser: async (parent: unknown, args: {
            authorization: string,
            privileges: PrivilegesSystem[],
            photoProfile?: string,
            username: string,
            password: string,
            name: string,
            surname: string,
            email: string,
            cnpj: string,
            location: string[]
        }, context: { express: ExpressContext }) => {
            const
                usersManagerDB = new UsersManagerDB(),
                req = context.express.req;

            let { temporarypass } = getReqProps(req, ['temporarypass']);

            temporarypass = String(temporarypass).toLowerCase() === 'true' ? true : false;

            if (temporarypass)
                args.password = generatePassword.unique();

            try {
                await usersManagerDB.register({
                    authorization: args.authorization,
                    privileges: args.privileges,
                    photoProfile: args.photoProfile || 'avatar.png',
                    username: args.username,
                    password: args.password,
                    name: args.name,
                    surname: args.surname,
                    email: {
                        value: args.email,
                        status: false
                    },
                    cnpj: args.cnpj,
                    location: {
                        street: String(args.location[0]),
                        number: Number(args.location[1]),
                        complement: String(args.location[2]),
                        district: String(args.location[3]),
                        state: String(args.location[4]),
                        city: String(args.location[5]),
                        zipcode: String(args.location[6])
                    }
                });

                try {
                    const
                        jwt = await JsonWebToken.sign({
                            payload: {
                                'auth': compressToBase64(String(args.authorization).toLowerCase()),
                            },
                            options: {
                                expiresIn: '7d'
                            }
                        });

                    // Envia o email de confirmação da conta
                    if (typeof jwt === 'string') {
                        // ! Cria um job para o envio de e-mail para confirmação da conta
                        await Queue.addConfirmMail({
                            email: args.email,
                            username: args.username,
                            token: jwt,
                            temporarypass: temporarypass ? args.password : null
                        });

                        return `Usuário foi criado com sucesso!`;
                    } else {
                        return `Não foi possível enviar o e-mail de confirmação da conta ${args.authorization}`;
                    }
                } catch (error) {
                    const
                        req = context.express.req,
                        clientIP = geoIP(req);

                    Debug.fatal('user', `Erro ocorrido na hora de enviar o e-mail de confirmação da conta do usuário(${args.authorization})`, String(error), `IP-Request: ${clearIPAddress(String(clientIP.ip).replace('::1', '127.0.0.1'))}`, `GraphQL - Mutation`, `Method: registerUser`);

                    throw new Error(String(error));
                }
            } catch (error) {
                const
                    req = context.express.req,
                    clientIP = geoIP(req);

                Debug.fatal('user', `Erro ocorrido na hora de registrar a conta do usuário(${args.authorization})`, String(error), `IP-Request: ${clearIPAddress(String(clientIP.ip).replace('::1', '127.0.0.1'))}`, `GraphQL - Mutation`, `Method: registerUser`);

                throw new Error(String(error));
            }
        },
        updateData: async (parent: unknown, args: {
            auth: string,
            email: string,
            username: string,
            name: string,
            surname: string,
            cnpj: string,
            location: string[]
            updatedToken?: UpdatedToken
        }, context: { express: ExpressContext }) => {
            try {
                const usersManagerDB = new UsersManagerDB();

                return {
                    success: await usersManagerDB.updateData(args.auth, {
                        email: args.email,
                        username: args.username,
                        name: args.name,
                        surname: args.surname,
                        cnpj: args.cnpj,
                        location: {
                            street: args.location[0],
                            number: Number(args.location[1]),
                            complement: args.location[2],
                            district: args.location[3],
                            state: args.location[4],
                            city: args.location[5],
                            zipcode: args.location[6]
                        }
                    }),
                    updatedToken: args.updatedToken
                };
            } catch (error) {
                const
                    req = context.express.req,
                    clientIP = geoIP(req);

                Debug.fatal('user', `Erro na hora de atualizar as informações da conta(${args.auth})`, String(error), `IP-Request: ${clearIPAddress(String(clientIP.ip).replace('::1', '127.0.0.1'))}`, `GraphQL - Mutation`, `Method: updateData`);

                throw new Error(String(error));
            }
        },
        updatePhotoProfile: async (parent: unknown, args: {
            auth: string,
            photo: string,
            updatedToken?: UpdatedToken
        }, context: { express: ExpressContext }) => {
            try {
                const usersManagerDB = new UsersManagerDB();

                return {
                    success: await usersManagerDB.updatePhotoProfile(args.auth, args.photo),
                    updatedToken: args.updatedToken
                };
            } catch (error) {
                const
                    req = context.express.req,
                    clientIP = geoIP(req);

                Debug.fatal('user', `Erro na hora de atualizar a foto de perfil da conta(${args.auth})`, String(error), `IP-Request: ${clearIPAddress(String(clientIP.ip).replace('::1', '127.0.0.1'))}`, `GraphQL - Mutation`, `Method: updatephotoProfile`);

                throw new Error(String(error));
            }
        },
        changePassword: async (parent: unknown, args: { auth: string, pwd: string, new_pwd: string }, context: { express: ExpressContext }) => {
            try {
                const
                    usersManagerDB = new UsersManagerDB(),
                    password_encode = await Encrypt(args.new_pwd);

                await usersManagerDB.confirmPassword(args.auth, args.pwd);
                await usersManagerDB.changePassword(args.auth, password_encode);

                return true;
            } catch (error) {
                const
                    req = context.express.req,
                    clientIP = geoIP(req);

                Debug.fatal('user', `Erro na hora de alterar a senha para a conta(${args.auth})`, String(error), `IP-Request: ${clearIPAddress(String(clientIP.ip).replace('::1', '127.0.0.1'))}`, `GraphQL - Mutation`, `Method: changePassword`);

                throw new Error(String(error));
            }
        },
        authSignTwofactor: async (parent: unknown, args: { auth: string, updatedToken?: UpdatedToken }, context: { express: ExpressContext }) => {
            try {
                const
                    usersManagerDB = new UsersManagerDB(),
                    { qrcode } = await usersManagerDB.signtwofactor(args.auth);

                return { qrcode, updatedToken: args.updatedToken };
            } catch (error) {
                const
                    req = context.express.req,
                    clientIP = geoIP(req);

                Debug.fatal('user', `Erro na hora de gerar o QRCode para a conta(${args.auth})`, String(error), `IP-Request: ${clearIPAddress(String(clientIP.ip).replace('::1', '127.0.0.1'))}`, `GraphQL - Mutation`, `Method: authSignTwofactor`);

                throw new Error(String(error));
            }
        },
        hasConfiguredTwoFactor: async (parent: unknown, args: { auth: string, updatedToken?: UpdatedToken }, context: { express: ExpressContext }) => {
            try {
                const usersManagerDB = new UsersManagerDB();

                return {
                    success: await usersManagerDB.hasConfiguredTwoFactor(args.auth),
                    updatedToken: args.updatedToken
                };
            } catch (error) {
                const
                    req = context.express.req,
                    clientIP = geoIP(req);

                Debug.fatal('user', `Erro na hora de gerar o QRCode para a conta(${args.auth})`, String(error), `IP-Request: ${clearIPAddress(String(clientIP.ip).replace('::1', '127.0.0.1'))}`, `GraphQL - Mutation`, `Method: authSignTwofactor`);

                throw new Error(String(error));
            }
        },
        authVerifyTwofactor: async (parent: unknown, args: { auth: string, qrcode: string, updatedToken?: UpdatedToken }, context: { express: ExpressContext }) => {
            try {
                const usersManagerDB = new UsersManagerDB();

                return {
                    success: await usersManagerDB.verifytwofactor(args.auth, args.qrcode),
                    updatedToken: args.updatedToken
                }
            } catch (error) {
                const
                    req = context.express.req,
                    clientIP = geoIP(req);

                Debug.fatal('user', `Erro na hora de verificar a autenticação de duas etapas para a conta(${args.auth})`, String(error), `IP-Request: ${clearIPAddress(String(clientIP.ip).replace('::1', '127.0.0.1'))}`, `GraphQL - Mutation`, `Method: authVerifyTwofactor`);

                throw new Error(String(error));
            }
        },
        authEnabledTwofactor: async (parent: unknown, args: { auth: string, updatedToken?: UpdatedToken }, context: { express: ExpressContext }) => {
            try {
                const usersManagerDB = new UsersManagerDB();

                return {
                    success: await usersManagerDB.enabledtwofactor(args.auth),
                    updatedToken: args.updatedToken
                };
            } catch (error) {
                const
                    req = context.express.req,
                    clientIP = geoIP(req);

                Debug.fatal('user', `Erro na hora de ativar a autenticação de duas etapas para a conta(${args.auth})`, String(error), `IP-Request: ${clearIPAddress(String(clientIP.ip).replace('::1', '127.0.0.1'))}`, `GraphQL - Mutation`, `Method: authEnabledTwofactor`);

                throw new Error(String(error));
            }
        },
        authDisableTwofactor: async (parent: unknown, args: { auth: string, updatedToken?: UpdatedToken }, context: { express: ExpressContext }) => {
            try {
                const usersManagerDB = new UsersManagerDB();

                return {
                    success: await usersManagerDB.disabledtwofactor(args.auth),
                    updatedToken: args.updatedToken
                }
            } catch (error) {
                const
                    req = context.express.req,
                    clientIP = geoIP(req);

                Debug.fatal('user', `Erro na hora de desativar a autenticação de duas etapas para a conta(${args.auth})`, String(error), `IP-Request: ${clearIPAddress(String(clientIP.ip).replace('::1', '127.0.0.1'))}`, `GraphQL - Mutation`, `Method: authDisableTwofactor`);

                throw new Error(String(error));
            }
        },
        authRetrieveTwofactor: async (parent: unknown, args: { auth: string }, context: { express: ExpressContext }) => {
            try {
                const
                    usersManagerDB = new UsersManagerDB(),
                    userInfo = await usersManagerDB.getInfo(args.auth),
                    {
                        email,
                        username
                    } = userInfo,
                    jwt = await JsonWebToken.sign({
                        payload: {
                            'auth': compressToBase64(String(args.auth).toLowerCase()),
                        },
                        options: {
                            expiresIn: '7d'
                        }
                    });

                if (typeof jwt === 'string') {
                    // ! Cria um job para o envio de e-mail para recuperação da conta
                    await Queue.addAccountRetrieveTwofactor({
                        email,
                        username,
                        token: jwt
                    })

                    return `${args.auth}, você irá receber um e-mail com as instruções para recuperar sua conta.`;
                } else {
                    return `${args.auth}, não foi possível enviar um e-mail de recuperação para sua conta. Desculpe, tente mais tarde!`;
                }
            } catch (error) {
                const
                    req = context.express.req,
                    clientIP = geoIP(req);

                Debug.fatal('user', `Erro na hora de recuperar a conta(${args.auth})`, String(error), `IP-Request: ${clearIPAddress(String(clientIP.ip).replace('::1', '127.0.0.1'))}`, `GraphQL - Mutation`, `Method: authRetrieveTwofactor`);

                throw new Error(String(error));
            }
        }
    }
};