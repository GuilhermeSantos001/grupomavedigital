/**
 * @description Rotas dos usuários
 * @author GuilhermeSantos001
 * @update 14/01/2022
 */

import getReqProps from '@/utils/getReqProps';
import activityManagerDB from '@/db/activities-db';
import userManagerDB from '@/db/user-db';
import JsonWebToken from '@/core/jsonWebToken';
import { Encrypt } from '@/utils/bcrypt';
import Jobs from '@/core/jobs';
import Debug from '@/core/log4';
import generatePassword from '@/utils/generatePassword';
import { PrivilegesSystem } from '@/mongo/user-manager-mongo';
import geoIP, {clearIPAddress} from '@/utils/geoIP';
import { ExpressContext } from 'apollo-server-express';
import { compressToBase64, decompressFromBase64 } from 'lz-string';

export type UpdatedToken = { signature: string, token: string }

export default {
    Query: {
        authLogin: async (parent: unknown, args: { auth: string, pwd: string, twofactortoken: string }, context: { express: ExpressContext }) => {
            try {
                const {
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
                } = await userManagerDB.confirmPassword(args.auth, args.pwd);

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
                    if (!await userManagerDB.verifytwofactor(args.auth, args.twofactortoken)) {
                        userInfo['token'] = 'twofactorDenied';

                        return userInfo;
                    }
                }

                await userManagerDB.connected(args.auth, {
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

                await userManagerDB.clearExpiredRefreshToken(args.auth);

                userInfo['refreshToken'] = await userManagerDB.addRefreshToken(args.auth);

                await activityManagerDB.register({
                    ipremote: clearIPAddress(String(clientIP.ip).replace('::1', '127.0.0.1')),
                    auth: userInfo['authorization'],
                    privileges: userInfo['privileges'],
                    roadmap: 'Se conectou ao sistema'
                });

                return userInfo;
            } catch (error) {
                const
                    req: any = context.express.req,
                    clientIP = geoIP(req);

                Debug.fatal('user', `Erro ocorrido na hora de conectar o usuário(${args.auth})`, String(error), `IP-Request: ${clearIPAddress(String(clientIP.ip).replace('::1', '127.0.0.1'))}`, `GraphQL - Query`, `Method: authLogin`);

                throw new TypeError(String(error));
            }
        },
        authLogout: async (parent: unknown, args: { auth: string, token: string, signature: string }, context: { express: ExpressContext }) => {
            try {
                const
                    { ip } = geoIP(context.express.req),
                    internetadress = ip,
                    { privileges } = await userManagerDB.getInfo(args.auth);

                await userManagerDB.verifytoken(args.auth, args.token, args.signature, clearIPAddress(String(internetadress).replace('::1', '127.0.0.1')));
                await userManagerDB.disconnected(args.auth, args.token);
                await userManagerDB.clearExpiredRefreshToken(args.auth);

                await JsonWebToken.cancel(args.token);
                await activityManagerDB.register({
                    ipremote: ip,
                    auth: args.auth,
                    privileges,
                    roadmap: 'Se desconectou do sistema'
                });

                return true;
            } catch (error) {
                const
                    req: any = context.express.req,
                    clientIP = geoIP(req);

                Debug.fatal('user', `Erro ocorrido na hora de desconectar o usuário(${args.auth}) desconectado`, String(error), `IP-Request: ${clearIPAddress(String(clientIP.ip).replace('::1', '127.0.0.1'))}`, `GraphQL - Query`, `Method: authLogout`);

                throw new TypeError(String(error));
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
                    { ip } = geoIP(context.express.req),
                    internetadress = ip;

                try {
                    await JsonWebToken.verify(args.token);
                    await userManagerDB.verifytoken(args.auth, args.token, args.signature, clearIPAddress(String(internetadress).replace('::1', '127.0.0.1')));

                    return { success: true };
                } catch {
                    if (args.refreshToken) {
                        try {
                            await userManagerDB.verifyRefreshToken(args.auth, args.refreshToken.signature, args.refreshToken.value);
                            const updateHistory = await userManagerDB.updateTokenHistory(args.auth, args.token);

                            return { success: true, signature: updateHistory[0], token: updateHistory[1] };
                        } catch {
                            return { success: false };
                        }
                    }

                    return { success: false };
                }
            } catch (error) {
                const
                    req: any = context.express.req,
                    clientIP = geoIP(req);

                Debug.fatal('user', `Erro ocorrido na hora de verificar se a sessão(${args.token}) está autorizada`, String(error), `IP-Request: ${clearIPAddress(String(clientIP.ip).replace('::1', '127.0.0.1'))}`, `GraphQL - Query`, `Method: authValidate`);

                throw new TypeError(String(error));
            }
        },
        authForgotPassword: async (parent: unknown, args: { auth: string }, context: { express: ExpressContext }) => {
            try {
                const {
                    username,
                    email,
                    signature,
                } = await userManagerDB.getInfo(args.auth),
                    req: any = context.express.req,
                    clientIP = geoIP(req);

                await userManagerDB.forgotPasswordSignatureRegister(args.auth, signature);

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
                    // Cria um job para o envio de e-mail para alteração de senha da conta
                    await Jobs.append({
                        name: 'Send mail to change account password',
                        type: 'mailsend',
                        priority: 'High',
                        args: {
                            email,
                            username,
                            signature,
                            token: jwt,
                            forgotPassword: true,
                            clientAddress: clearIPAddress(String(clientIP.ip).replace('::1', '127.0.0.1'))
                        },
                        status: 'Available'
                    });

                    return true;
                }

                return false;
            } catch (error) {
                const
                    req: any = context.express.req,
                    clientIP = geoIP(req);

                Debug.fatal('user', `Erro ocorrido na hora de enviar o e-mail de alteração de senha da conta do usuário(${args.auth})`, String(error), `IP-Request: ${clearIPAddress(String(clientIP.ip).replace('::1', '127.0.0.1'))}`, `GraphQL - Query`, `Method: authForgotPassword`);

                throw new TypeError(String(error));
            }
        },
        emailResendConfirm: async (parent: unknown, args: { auth: string }, context: { express: ExpressContext }) => {
            try {
                const
                    req: any = context.express.req,
                    clientIP = geoIP(req);

                let { temporarypass } = getReqProps(req, ['temporarypass']);

                temporarypass = String(temporarypass).toLowerCase() === 'true' ? true : false;

                const
                    userInfo = await userManagerDB.getInfo(args.auth),
                    email = userInfo['email'],
                    username = userInfo['username'];

                let newpassword;

                if (temporarypass) {
                    newpassword = generatePassword.unique();
                    await userManagerDB.changePassword(args.auth, newpassword);
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
                    // Cria um job para o envio de e-mail para confirmação da conta
                    await Jobs.append({
                        name: 'Send the account confirmation mail again',
                        type: 'mailsend',
                        priority: 'High',
                        args: {
                            email,
                            username,
                            auth: args.auth,
                            token: jwt,
                            temporarypass: temporarypass ? newpassword || '' : null,
                            clientAddress: clearIPAddress(String(clientIP.ip).replace('::1', '127.0.0.1'))
                        },
                        status: 'Available'
                    });

                    return true;
                }

                return false;
            } catch (error) {
                const
                    req: any = context.express.req,
                    clientIP = geoIP(req);

                Debug.fatal('user', `Erro ocorrido na hora de enviar o e-mail de confirmação da conta do usuário(${args.auth})`, String(error), `IP-Request: ${clearIPAddress(String(clientIP.ip).replace('::1', '127.0.0.1'))}`, `GraphQL - Query`, `Method: emailResendConfirm`);

                throw new TypeError(String(error));
            }
        },
        mailConfirm: async (parent: unknown, args: { token: string }, context: { express: ExpressContext }) => {
            try {
                const { auth } = await JsonWebToken.verify(args.token)

                if (await userManagerDB.confirmAccount(decompressFromBase64(auth) || "")) {
                    return true;
                } else {
                    return false;
                }
            } catch (error) {
                const
                    req: any = context.express.req,
                    clientIP = geoIP(req);

                Debug.fatal('user', `Erro ocorrido na hora de confirmar a conta do usuário.`, String(error), `IP-Request: ${clearIPAddress(String(clientIP.ip).replace('::1', '127.0.0.1'))}`, `GraphQL - Query`, `Method: mailConfirm`);

                throw new TypeError(String(error));
            }
        },
        processOrderForgotPassword: async (parent: unknown, args: { signature: string, token: string, pwd: string }, context: { express: ExpressContext }) => {
            try {
                const decoded = await JsonWebToken.verify(args.token)

                if (
                    !decoded ||
                    decompressFromBase64(decoded['signature']) !== args.signature
                )
                    return false;

                const auth = decompressFromBase64(decoded['auth']) || "";

                const {
                    authentication,
                } = await userManagerDB.getInfo(auth);

                if (authentication.forgotPassword !== args.signature)
                    return false;

                if (await userManagerDB.changePassword(auth, args.pwd)) {
                    return true;
                } else {
                    return false;
                }
            } catch (error) {
                const
                    req: any = context.express.req,
                    clientIP = geoIP(req);

                Debug.fatal('user', `Erro ocorrido na hora de alterar a senha da conta do usuário.`, String(error), `IP-Request: ${clearIPAddress(String(clientIP.ip).replace('::1', '127.0.0.1'))}`, `GraphQL - Query`, `Method: processOrderForgotPassword`);

                throw new TypeError(String(error));
            }
        },
        getUserInfo: async (parent: unknown, args: { auth: string, updatedToken?: UpdatedToken }, context: { express: ExpressContext }) => {
            try {
                const {
                    privileges,
                    privilege,
                    photoProfile,
                    username,
                    email,
                    name,
                    surname,
                    cnpj,
                    location
                } = await userManagerDB.getInfo(args.auth);

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
                    req: any = context.express.req,
                    clientIP = geoIP(req);

                Debug.fatal('user', `Erro ocorrido na hora de retornar as informações do usuário(${args.auth})`, String(error), `IP-Request: ${clearIPAddress(String(clientIP.ip).replace('::1', '127.0.0.1'))}`, `GraphQL - Query`, `Method: getUserInfo`);

                throw new TypeError(String(error));
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
            const req: any = context.express.req;

            let { temporarypass } = getReqProps(req, ['temporarypass']);

            temporarypass = String(temporarypass).toLowerCase() === 'true' ? true : false;

            if (temporarypass)
                args.password = generatePassword.unique();

            try {
                await userManagerDB.register({
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
                        }),
                        clientIP = geoIP(req);

                    // Envia o email de confirmação da conta
                    if (typeof jwt === 'string') {
                        // Cria um job para o envio de e-mail para confirmação da conta
                        await Jobs.append({
                            name: 'Sends the account confirmation mail after user registration',
                            type: 'mailsend',
                            priority: 'High',
                            args: {
                                email: args.email,
                                username: args.username,
                                auth: args.authorization,
                                token: jwt,
                                temporarypass: temporarypass ? args.password : null,
                                clientAddress: clearIPAddress(String(clientIP.ip).replace('::1', '127.0.0.1'))
                            },
                            status: 'Available'
                        });

                        return `Usuário foi criado com sucesso!`;
                    } else {
                        return `Não foi possível enviar o e-mail de confirmação da conta ${args.authorization}`;
                    }
                } catch (error) {
                    const
                        req: any = context.express.req,
                        clientIP = geoIP(req);

                    Debug.fatal('user', `Erro ocorrido na hora de enviar o e-mail de confirmação da conta do usuário(${args.authorization})`, String(error), `IP-Request: ${clearIPAddress(String(clientIP.ip).replace('::1', '127.0.0.1'))}`, `GraphQL - Mutation`, `Method: registerUser`);

                    throw new TypeError(String(error));
                }
            } catch (error) {
                const
                    req: any = context.express.req,
                    clientIP = geoIP(req);

                Debug.fatal('user', `Erro ocorrido na hora de registrar a conta do usuário(${args.authorization})`, String(error), `IP-Request: ${clearIPAddress(String(clientIP.ip).replace('::1', '127.0.0.1'))}`, `GraphQL - Mutation`, `Method: registerUser`);

                throw new TypeError(String(error));
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
                return {
                    success: await userManagerDB.updateData(args.auth, {
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
                    req: any = context.express.req,
                    clientIP = geoIP(req);

                Debug.fatal('user', `Erro na hora de atualizar as informações da conta(${args.auth})`, String(error), `IP-Request: ${clearIPAddress(String(clientIP.ip).replace('::1', '127.0.0.1'))}`, `GraphQL - Mutation`, `Method: updateData`);

                throw new TypeError(String(error));
            }
        },
        updatePhotoProfile: async (parent: unknown, args: {
            auth: string,
            photo: string,
            updatedToken?: UpdatedToken
        }, context: { express: ExpressContext }) => {
            try {
                return {
                    success: await userManagerDB.updatePhotoProfile(args.auth, args.photo),
                    updatedToken: args.updatedToken
                };
            } catch (error) {
                const
                    req: any = context.express.req,
                    clientIP = geoIP(req);

                Debug.fatal('user', `Erro na hora de atualizar a foto de perfil da conta(${args.auth})`, String(error), `IP-Request: ${clearIPAddress(String(clientIP.ip).replace('::1', '127.0.0.1'))}`, `GraphQL - Mutation`, `Method: updatephotoProfile`);

                throw new TypeError(String(error));
            }
        },
        changePassword: async (parent: unknown, args: { auth: string, pwd: string, new_pwd: string }, context: { express: ExpressContext }) => {
            try {
                const password_encode = await Encrypt(args.new_pwd);

                await userManagerDB.confirmPassword(args.auth, args.pwd);
                await userManagerDB.changePassword(args.auth, password_encode);

                return true;
            } catch (error) {
                const
                    req: any = context.express.req,
                    clientIP = geoIP(req);

                Debug.fatal('user', `Erro na hora de alterar a senha para a conta(${args.auth})`, String(error), `IP-Request: ${clearIPAddress(String(clientIP.ip).replace('::1', '127.0.0.1'))}`, `GraphQL - Mutation`, `Method: changePassword`);

                throw new TypeError(String(error));
            }
        },
        authSignTwofactor: async (parent: unknown, args: { auth: string, updatedToken?: UpdatedToken }, context: { express: ExpressContext }) => {
            try {
                const
                    { qrcode } = await userManagerDB.signtwofactor(args.auth);

                return { qrcode, updatedToken: args.updatedToken };
            } catch (error) {
                const
                    req: any = context.express.req,
                    clientIP = geoIP(req);

                Debug.fatal('user', `Erro na hora de gerar o QRCode para a conta(${args.auth})`, String(error), `IP-Request: ${clearIPAddress(String(clientIP.ip).replace('::1', '127.0.0.1'))}`, `GraphQL - Mutation`, `Method: authSignTwofactor`);

                throw new TypeError(String(error));
            }
        },
        hasConfiguredTwoFactor: async (parent: unknown, args: { auth: string, updatedToken?: UpdatedToken }, context: { express: ExpressContext }) => {
            try {
                return {
                    success: await userManagerDB.hasConfiguredTwoFactor(args.auth),
                    updatedToken: args.updatedToken
                };
            } catch (error) {
                const
                    req: any = context.express.req,
                    clientIP = geoIP(req);

                Debug.fatal('user', `Erro na hora de gerar o QRCode para a conta(${args.auth})`, String(error), `IP-Request: ${clearIPAddress(String(clientIP.ip).replace('::1', '127.0.0.1'))}`, `GraphQL - Mutation`, `Method: authSignTwofactor`);

                throw new TypeError(String(error));
            }
        },
        authVerifyTwofactor: async (parent: unknown, args: { auth: string, qrcode: string, updatedToken?: UpdatedToken }, context: { express: ExpressContext }) => {
            try {
                return {
                    success: await userManagerDB.verifytwofactor(args.auth, args.qrcode),
                    updatedToken: args.updatedToken
                }
            } catch (error) {
                const
                    req: any = context.express.req,
                    clientIP = geoIP(req);

                Debug.fatal('user', `Erro na hora de verificar a autenticação de duas etapas para a conta(${args.auth})`, String(error), `IP-Request: ${clearIPAddress(String(clientIP.ip).replace('::1', '127.0.0.1'))}`, `GraphQL - Mutation`, `Method: authVerifyTwofactor`);

                throw new TypeError(String(error));
            }
        },
        authEnabledTwofactor: async (parent: unknown, args: { auth: string, updatedToken?: UpdatedToken }, context: { express: ExpressContext }) => {
            try {
                return {
                    success: await userManagerDB.enabledtwofactor(args.auth),
                    updatedToken: args.updatedToken
                };
            } catch (error) {
                const
                    req: any = context.express.req,
                    clientIP = geoIP(req);

                Debug.fatal('user', `Erro na hora de ativar a autenticação de duas etapas para a conta(${args.auth})`, String(error), `IP-Request: ${clearIPAddress(String(clientIP.ip).replace('::1', '127.0.0.1'))}`, `GraphQL - Mutation`, `Method: authEnabledTwofactor`);

                throw new TypeError(String(error));
            }
        },
        authDisableTwofactor: async (parent: unknown, args: { auth: string, updatedToken?: UpdatedToken }, context: { express: ExpressContext }) => {
            try {
                return {
                    success: await userManagerDB.disabledtwofactor(args.auth),
                    updatedToken: args.updatedToken
                }
            } catch (error) {
                const
                    req: any = context.express.req,
                    clientIP = geoIP(req);

                Debug.fatal('user', `Erro na hora de desativar a autenticação de duas etapas para a conta(${args.auth})`, String(error), `IP-Request: ${clearIPAddress(String(clientIP.ip).replace('::1', '127.0.0.1'))}`, `GraphQL - Mutation`, `Method: authDisableTwofactor`);

                throw new TypeError(String(error));
            }
        },
        authRetrieveTwofactor: async (parent: unknown, args: { auth: string }, context: { express: ExpressContext }) => {
            try {
                const
                    userInfo = await userManagerDB.getInfo(args.auth),
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
                    }),
                    req: any = context.express.req,
                    clientIP = geoIP(req);

                if (typeof jwt === 'string') {
                    // Cria um job para o envio de e-mail para recuperação da conta
                    await Jobs.append({
                        name: 'Send the account recovery mail',
                        type: 'mailsend',
                        priority: 'High',
                        args: {
                            email,
                            username,
                            token: jwt,
                            twofactor: true,
                            clientAddress: clearIPAddress(String(clientIP.ip).replace('::1', '127.0.0.1'))
                        },
                        status: 'Available'
                    });

                    return `${args.auth}, você irá receber um e-mail com as instruções para recuperar sua conta.`;
                } else {
                    return `${args.auth}, não foi possível enviar um e-mail de recuperação para sua conta. Desculpe, tente mais tarde!`;
                }
            } catch (error) {
                const
                    req: any = context.express.req,
                    clientIP = geoIP(req);

                Debug.fatal('user', `Erro na hora de recuperar a conta(${args.auth})`, String(error), `IP-Request: ${clearIPAddress(String(clientIP.ip).replace('::1', '127.0.0.1'))}`, `GraphQL - Mutation`, `Method: authRetrieveTwofactor`);

                throw new TypeError(String(error));
            }
        }
    }
};