/**
 * @description Rotas dos usuários
 * @author @GuilhermeSantos001
 * @update 21/09/2021
 * @version 3.0.0
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
import geoIP from '@/utils/geoIP';
import { ExpressContext } from 'apollo-server-express';

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
                    authentication
                } = await userManagerDB.cpassword(args.auth, args.pwd);

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
                        token: ""
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

                userInfo['token'] = await JsonWebToken.sign({
                    payload: {},
                    options: {
                        expiresIn: `${userInfo['session']['cache']['tmp']}${userInfo['session']['cache']['unit']}`
                    }
                });

                await userManagerDB.connected(args.auth, {
                    ip: clientIP.ip,
                    token: userInfo['token'],
                    device: device['type'],
                    location: {
                        locationIP: clientIP.location,
                        internetAdress: clientIP.ip,
                        browser: device.parser.useragent['family'],
                        os: device.parser.useragent['os']['family']
                    },
                    signature: userInfo['signature']
                });

                await activityManagerDB.register({
                    ipremote: clientIP.ip,
                    auth: userInfo['authorization'],
                    privileges: userInfo['privileges'],
                    roadmap: 'Se conectou ao sistema'
                });

                return userInfo;
            } catch (error) {
                const
                    req: any = context.express.req,
                    clientIP = geoIP(req);

                Debug.fatal('user', `Erro ocorrido na hora de conectar o usuário(${args.auth})`, String(error), `IP-Request: ${clientIP.ip}`, `GraphQL - Query`, `Method: authLogin`);

                throw new Error(String(error));
            }
        },
        authLogout: async (parent: unknown, args: { auth: string, token: string }, context: { express: ExpressContext }) => {
            try {
                await userManagerDB.disconnected(args.auth, args.token);

                const
                    userToken = await JsonWebToken.verify(args.token),
                    req: any = context.express.req,
                    clientIP = geoIP(req);

                await activityManagerDB.register({
                    ipremote: clientIP.ip,
                    auth: userToken['auth'],
                    privileges: userToken['privileges'],
                    roadmap: 'Se desconectou do sistema'
                });

                return true;
            } catch (error) {
                const
                    req: any = context.express.req,
                    clientIP = geoIP(req);

                Debug.fatal('user', `Erro ocorrido na hora de desconectar o usuário(${args.auth}) desconectado`, String(error), `IP-Request: ${clientIP.ip}`, `GraphQL - Query`, `Method: authLogout`);

                throw new Error(String(error));
            }
        },
        authExpired: async (parent: unknown, args: { auth: string, token: string }, context: { express: ExpressContext }) => {
            try {
                await userManagerDB.disconnected(args.auth, args.token);

                return true;
            } catch (error) {
                const
                    req: any = context.express.req,
                    clientIP = geoIP(req);

                Debug.fatal('user', `Erro ocorrido na hora de verificar se a sessão do usuário(${args.auth}) está expirada`, String(error), `IP-Request: ${clientIP.ip}`, `GraphQL - Query`, `Method: authExpired`);

                throw new Error(String(error));
            }
        },
        authValidate: async (parent: unknown, args: { auth: string, token: string, signature: string }, context: { express: ExpressContext }) => {
            try {
                const
                    { ip } = geoIP(context.express.req),
                    internetadress = ip;

                await JsonWebToken.verify(args.token);
                await userManagerDB.verifytoken(args.auth, args.token, args.signature, internetadress);

                return true;
            } catch (error) {
                const
                    req: any = context.express.req,
                    clientIP = geoIP(req);

                Debug.fatal('user', `Erro ocorrido na hora de verificar se a sessão(${args.token}) está autorizada`, String(error), `IP-Request: ${clientIP.ip}`, `GraphQL - Query`, `Method: authValidate`);

                throw new Error(String(error));
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
                    await userManagerDB.changepassword(args.auth, newpassword);
                }

                const jwt = await JsonWebToken.sign({
                    payload: {
                        'econfirm': true,
                        'email': String(email).toLowerCase(),
                        'auth': String(args.auth).toLowerCase()
                    },
                    options: {
                        expiresIn: '7d'
                    }
                });

                if (typeof jwt === 'string') {
                    // Cria um job para o envio de email para confirmação da conta
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
                            clientAddress: clientIP.ip
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

                Debug.fatal('user', `Erro ocorrido na hora de enviar o e-mail de confirmação da conta do usuário(${args.auth})`, String(error), `IP-Request: ${clientIP.ip}`, `GraphQL - Query`, `Method: emailResendConfirm`);

                throw new Error(String(error));
            }
        },
        getUserInfo: async (parent: unknown, args: { auth: string }, context: { express: ExpressContext }) => {
            try {
                const {
                    authorization,
                    privileges,
                    photoProfile,
                    username,
                    email,
                    name,
                    surname,
                    cnpj,
                    location
                } = await userManagerDB.getInfo(args.auth);

                return {
                    authorization,
                    privileges,
                    photoProfile,
                    username,
                    email,
                    name,
                    surname,
                    cnpj,
                    location
                };
            } catch (error) {
                const
                    req: any = context.express.req,
                    clientIP = geoIP(req);

                Debug.fatal('user', `Erro ocorrido na hora de retornar as informações do usuário(${args.auth})`, String(error), `IP-Request: ${clientIP.ip}`, `GraphQL - Query`, `Method: getUserInfo`);

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
                                'econfirm': true,
                                'email': String(args.email).toLowerCase(),
                                'auth': String(args.authorization).toLowerCase()
                            },
                            options: {
                                expiresIn: '7d'
                            }
                        }),
                        clientIP = geoIP(req);

                    // Envia o email de confirmação da conta
                    if (typeof jwt === 'string') {
                        // Cria um job para o envio de email para confirmação da conta
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
                                clientAddress: clientIP.ip
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

                    Debug.fatal('user', `Erro ocorrido na hora de enviar o e-mail de confirmação da conta do usuário(${args.authorization})`, String(error), `IP-Request: ${clientIP.ip}`, `GraphQL - Mutation`, `Method: registerUser`);

                    throw new Error(String(error));
                }
            } catch (error) {
                const
                    req: any = context.express.req,
                    clientIP = geoIP(req);

                Debug.fatal('user', `Erro ocorrido na hora de registrar a conta do usuário(${args.authorization})`, String(error), `IP-Request: ${clientIP.ip}`, `GraphQL - Mutation`, `Method: registerUser`);

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
        }, context: { express: ExpressContext }) => {
            try {
                await userManagerDB.updateData(args.auth, {
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
                });

                const req: any = context.express.req;

                return true;
            } catch (error) {
                const
                    req: any = context.express.req,
                    clientIP = geoIP(req);

                Debug.fatal('user', `Erro na hora de atualizar as informações da conta(${args.auth})`, String(error), `IP-Request: ${clientIP.ip}`, `GraphQL - Mutation`, `Method: updateData`);

                throw new Error(String(error));
            }
        },
        updatePhotoProfile: async (parent: unknown, args: {
            auth: string,
            photo: string
        }, context: { express: ExpressContext }) => {
            try {
                await userManagerDB.updatePhotoProfile(args.auth, args.photo);

                return true;
            } catch (error) {
                const
                    req: any = context.express.req,
                    clientIP = geoIP(req);

                Debug.fatal('user', `Erro na hora de atualizar a foto de perfil da conta(${args.auth})`, String(error), `IP-Request: ${clientIP.ip}`, `GraphQL - Mutation`, `Method: updatephotoProfile`);

                throw new Error(String(error));
            }
        },
        changePassword: async (parent: unknown, args: { auth: string, pwd: string, new_pwd: string }, context: { express: ExpressContext }) => {
            try {
                const password_encode = await Encrypt(args.new_pwd);

                await userManagerDB.cpassword(args.auth, args.pwd);

                await userManagerDB.changepassword(args.auth, password_encode);

                const msg = `${args.auth}, sua senha foi alterada com sucesso`;

                return msg;
            } catch (error) {
                const
                    req: any = context.express.req,
                    clientIP = geoIP(req);

                Debug.fatal('user', `Erro na hora de alterar a senha para a conta(${args.auth})`, String(error), `IP-Request: ${clientIP.ip}`, `GraphQL - Mutation`, `Method: changePassword`);

                throw new Error(String(error));
            }
        },
        authSignTwofactor: async (parent: unknown, args: { auth: string }, context: { express: ExpressContext }) => {
            try {
                const
                    { qrcode } = await userManagerDB.signtwofactor(args.auth);

                return qrcode;
            } catch (error) {
                const
                    req: any = context.express.req,
                    clientIP = geoIP(req);

                Debug.fatal('user', `Erro na hora de gerar o QRCode para a conta(${args.auth})`, String(error), `IP-Request: ${clientIP.ip}`, `GraphQL - Mutation`, `Method: authSignTwofactor`);

                throw new Error(String(error));
            }
        },
        authVerifyTwofactor: async (parent: unknown, args: { auth: string, qrcode: string }, context: { express: ExpressContext }) => {
            try {
                return await userManagerDB.verifytwofactor(args.auth, args.qrcode);
            } catch (error) {
                const
                    req: any = context.express.req,
                    clientIP = geoIP(req);

                Debug.fatal('user', `Erro na hora de verificar a autenticação de duas etapas para a conta(${args.auth})`, String(error), `IP-Request: ${clientIP.ip}`, `GraphQL - Mutation`, `Method: authVerifyTwofactor`);

                throw new Error(String(error));
            }
        },
        authEnabledTwofactor: async (parent: unknown, args: { auth: string }, context: { express: ExpressContext }) => {
            try {
                return await userManagerDB.enabledtwofactor(args.auth);
            } catch (error) {
                const
                    req: any = context.express.req,
                    clientIP = geoIP(req);

                Debug.fatal('user', `Erro na hora de ativar a autenticação de duas etapas para a conta(${args.auth})`, String(error), `IP-Request: ${clientIP.ip}`, `GraphQL - Mutation`, `Method: authEnabledTwofactor`);

                throw new Error(String(error));
            }
        },
        authDisableTwofactor: async (parent: unknown, args: { auth: string }, context: { express: ExpressContext }) => {
            try {
                return await userManagerDB.disabledtwofactor(args.auth);
            } catch (error) {
                const
                    req: any = context.express.req,
                    clientIP = geoIP(req);

                Debug.fatal('user', `Erro na hora de desativar a autenticação de duas etapas para a conta(${args.auth})`, String(error), `IP-Request: ${clientIP.ip}`, `GraphQL - Mutation`, `Method: authDisableTwofactor`);

                throw new Error(String(error));
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
                            'econfirm': true,
                            'authorization': args.auth
                        },
                        options: {
                            expiresIn: '7d'
                        }
                    }),
                    req: any = context.express.req,
                    clientIP = geoIP(req);

                if (typeof jwt === 'string') {
                    // Cria um job para o envio de email para recuperação da conta
                    await Jobs.append({
                        name: 'Send the account recovery mail',
                        type: 'mailsend',
                        priority: 'High',
                        args: {
                            email,
                            username,
                            token: jwt,
                            twofactor: true,
                            clientAddress: clientIP.ip
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

                Debug.fatal('user', `Erro na hora de recuperar a conta(${args.auth})`, String(error), `IP-Request: ${clientIP.ip}`, `GraphQL - Mutation`, `Method: authRetrieveTwofactor`);

                throw new Error(String(error));
            }
        }
    }
};