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

export default {
    Query: {
        authLogin: async (source: any, args: { auth: string, pwd: string, twofactortoken: string }, context: { req: any }) => {
            try {
                let {
                    authorization,
                    privileges,
                    username,
                    email,
                    name,
                    surname,
                    session,
                    authentication
                } = await userManagerDB.cpassword(args.auth, args.pwd),
                    userInfo = {
                        authorization,
                        privileges,
                        username,
                        email,
                        name,
                        surname,
                        session,
                        authentication,
                        token: ""
                    };

                const clientIP = geoIP(context.req);

                if (userInfo['authentication']['twofactor']['enabled'] && args.twofactortoken.length <= 0) {
                    userInfo['token'] = 'twofactorVerify';

                    Debug.info('user', `Verificação de duas etapas solicitadas para ${args.auth}`, `IP-Request: ${clientIP.ip}`, `GraphQL - Query`, `Method: authLogin`);

                    return userInfo;
                } else if (userInfo['authentication']['twofactor']['enabled'] && args.twofactortoken.length > 0) {
                    if (!await userManagerDB.verifytwofactor(args.auth, args.twofactortoken)) {
                        userInfo['token'] = 'twofactorDenied';

                        Debug.info('user', `Código de verificação de duas etapas invalido para ${args.auth}`, `IP-Request: ${clientIP.ip}`, `GraphQL - Query`, `Method: authLogin`);

                        return userInfo;
                    }
                }

                userInfo['token'] = await JsonWebToken.sign({
                    payload: {
                        "privileges": userInfo['privileges'],
                        "auth": args.auth,
                        "email": userInfo['email']
                    },
                    options: {
                        expiresIn: `${userInfo['session']['cache']['tmp']}${userInfo['session']['cache']['unit']}`
                    }
                });

                await userManagerDB.connected(args.auth, {
                    ip: clientIP.ip,
                    token: userInfo['token'],
                    device: context.req.device['type'],
                    location: {
                        locationIP: clientIP.location,
                        internetAdress: clientIP.ip,
                        browser: context.req.device.parser.useragent['family'],
                        os: context.req.device.parser.useragent['os']['family']
                    }
                });

                await activityManagerDB.register({
                    ipremote: clientIP.ip,
                    auth: userInfo['authorization'],
                    privileges: userInfo['privileges'],
                    roadmap: 'Se conectou ao sistema'
                });

                Debug.info('user', `Usuário(${args.auth}) conectado`, `IP-Request: ${clientIP.ip}`, `GraphQL - Query`, `Method: authLogin`);

                return userInfo;
            } catch (error: any) {
                const clientIP = geoIP(context.req);

                Debug.fatal('user', `Erro ocorrido na hora de conectar o usuário(${args.auth})`, String(error), `IP-Request: ${clientIP.ip}`, `GraphQL - Query`, `Method: authLogin`);

                throw new Error(error);
            }
        },
        authLogout: async (source: any, args: { auth: string, token: string }, context: { req: any }) => {
            try {
                await userManagerDB.disconnected(args.auth, args.token);

                const
                    userToken = await JsonWebToken.verify(args.token),
                    clientIP = geoIP(context.req);

                await activityManagerDB.register({
                    ipremote: clientIP.ip,
                    auth: userToken['auth'],
                    privileges: userToken['privileges'],
                    roadmap: 'Se desconectou do sistema'
                });

                Debug.info('user', `Usuário(${args.auth}) desconectado`, `IP-Request: ${clientIP.ip}`, `GraphQL - Query`, `Method: authLogout`);

                return true;
            } catch (error: any) {
                const clientIP = geoIP(context.req);

                Debug.fatal('user', `Erro ocorrido na hora de desconectar o usuário(${args.auth}) desconectado`, String(error), `IP-Request: ${clientIP.ip}`, `GraphQL - Query`, `Method: authLogout`);

                throw new Error(error);
            }
        },
        authExpired: async (source: any, args: { auth: string, token: string }, context: { req: any }) => {
            try {
                await userManagerDB.disconnected(args.auth, args.token);

                const clientIP = geoIP(context.req);

                Debug.info('user', `Sessão do usuário(${args.auth}) expirada`, `IP-Request: ${clientIP.ip}`, `GraphQL - Query`, `Method: authExpired`);

                return true;
            } catch (error: any) {
                const clientIP = geoIP(context.req);

                Debug.fatal('user', `Erro ocorrido na hora de verificar se a sessão do usuário(${args.auth}) está expirada`, String(error), `IP-Request: ${clientIP.ip}`, `GraphQL - Query`, `Method: authExpired`);

                throw new Error(error);
            }
        },
        emailResendConfirm: async (source: any, args: { auth: string }, context: { req: any }) => {
            try {
                let { temporarypass } = getReqProps(context.req, ['temporarypass']);

                temporarypass = String(temporarypass).toLowerCase() === 'true' ? true : false;

                const
                    userInfo = await userManagerDB.getInfo(args.auth),
                    clientIP = geoIP(context.req),
                    email = userInfo['email'],
                    username = userInfo['username'];

                let newpassword;

                if (temporarypass) {
                    newpassword = generatePassword.unique();
                    await userManagerDB.changepassword(args.auth, newpassword);
                };

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
                };

                return false;
            } catch (error: any) {
                const clientIP = geoIP(context.req);

                Debug.fatal('user', `Erro ocorrido na hora de enviar o e-mail de confirmação da conta do usuário(${args.auth})`, String(error), `IP-Request: ${clientIP.ip}`, `GraphQL - Query`, `Method: emailResendConfirm`);

                throw new Error(error);
            }
        },
        getUserInfo: async (source: any, args: { auth: string }, context: { req: any }) => {
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
            } catch (error: any) {
                const clientIP = geoIP(context.req);

                Debug.fatal('user', `Erro ocorrido na hora de retornar as informações do usuário(${args.auth})`, String(error), `IP-Request: ${clientIP.ip}`, `GraphQL - Query`, `Method: getUserInfo`);

                throw new Error(error);
            }
        }
    },
    Mutation: {
        registerUser: async (parent: any, args: {
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
        }, context: { req: any }) => {
            let { temporarypass } = getReqProps(context.req, ['temporarypass']);

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
                        clientIP = geoIP(context.req);

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
                } catch (err: any) {
                    const clientIP = geoIP(context.req);

                    Debug.fatal('user', `Erro ocorrido na hora de enviar o e-mail de confirmação da conta do usuário(${args.authorization})`, String(err), `IP-Request: ${clientIP.ip}`, `GraphQL - Mutation`, `Method: registerUser`);

                    throw new Error(err);
                }
            } catch (err: any) {
                const clientIP = geoIP(context.req);

                Debug.fatal('user', `Erro ocorrido na hora de registrar a conta do usuário(${args.authorization})`, String(err), `IP-Request: ${clientIP.ip}`, `GraphQL - Mutation`, `Method: registerUser`);

                throw new Error(err);
            }
        },
        updateData: async (parent: any, args: {
            auth: string,
            email: string,
            username: string,
            name: string,
            surname: string,
            cnpj: string,
            location: string[]
        }, context: { req: any }) => {
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

                const clientIP = geoIP(context.req);

                Debug.info('user', `As informações da conta(${args.auth}) foram atualizadas`, `IP-Request: ${clientIP.ip}`, `GraphQL - Mutation`, `Method: updateData`);

                return true;
            } catch (error: any) {
                const clientIP = geoIP(context.req);

                Debug.fatal('user', `Erro na hora de atualizar as informações da conta(${args.auth})`, String(error), `IP-Request: ${clientIP.ip}`, `GraphQL - Mutation`, `Method: updateData`);

                throw new Error(error);
            }
        },
        updatePhotoProfile: async (parent: any, args: {
            auth: string,
            photo: string
        }, context: { req: any }) => {
            try {
                await userManagerDB.updatePhotoProfile(args.auth, args.photo);

                const clientIP = geoIP(context.req);

                Debug.info('user', `A foto de perfil da conta(${args.auth}) foi atualizada!`, `IP-Request: ${clientIP.ip}`, `GraphQL - Mutation`, `Method: updatephotoProfile`);

                return true;
            } catch (error: any) {
                const clientIP = geoIP(context.req);

                Debug.fatal('user', `Erro na hora de atualizar a foto de perfil da conta(${args.auth})`, String(error), `IP-Request: ${clientIP.ip}`, `GraphQL - Mutation`, `Method: updatephotoProfile`);

                throw new Error(error);
            }
        },
        changePassword: async (parent: any, args: { auth: string, pwd: string, new_pwd: string }, context: { req: any }) => {
            try {
                const password_encode = await Encrypt(args.new_pwd);

                await userManagerDB.cpassword(args.auth, args.pwd);

                await userManagerDB.changepassword(args.auth, password_encode);

                let msg = `${args.auth}, sua senha foi alterada com sucesso`;

                const clientIP = geoIP(context.req);

                Debug.info('user', msg, `IP-Request: ${clientIP.ip}`, `GraphQL - Mutation`, `Method: changePassword`);

                return msg;
            } catch (error: any) {
                const clientIP = geoIP(context.req);

                Debug.fatal('user', `Erro na hora de alterar a senha para a conta(${args.auth})`, String(error), `IP-Request: ${clientIP.ip}`, `GraphQL - Mutation`, `Method: changePassword`);

                throw new Error(error);
            }
        },
        authSignTwofactor: async (parent: any, args: { auth: string }, context: { req: any }) => {
            try {
                const
                    { qrcode } = await userManagerDB.signtwofactor(args.auth),
                    clientIP = geoIP(context.req);

                Debug.info('user', `QRCode gerado para a conta(${args.auth})`, `IP-Request: ${clientIP.ip}`, `GraphQL - Mutation`, `Method: authSignTwofactor`);

                return qrcode;
            } catch (error: any) {
                const clientIP = geoIP(context.req);

                Debug.fatal('user', `Erro na hora de gerar o QRCode para a conta(${args.auth})`, String(error), `IP-Request: ${clientIP.ip}`, `GraphQL - Mutation`, `Method: authSignTwofactor`);

                throw new Error(error);
            }
        },
        authVerifyTwofactor: async (parent: any, args: { auth: string, qrcode: string }, context: { req: any }) => {
            try {
                return await userManagerDB.verifytwofactor(args.auth, args.qrcode);
            } catch (error: any) {
                const clientIP = geoIP(context.req);

                Debug.fatal('user', `Erro na hora de verificar a autenticação de duas etapas para a conta(${args.auth})`, String(error), `IP-Request: ${clientIP.ip}`, `GraphQL - Mutation`, `Method: authVerifyTwofactor`);

                throw new Error(error);
            }
        },
        authEnabledTwofactor: async (parent: any, args: { auth: string }, context: { req: any }) => {
            try {
                return await userManagerDB.enabledtwofactor(args.auth);
            } catch (error: any) {
                const clientIP = geoIP(context.req);

                Debug.fatal('user', `Erro na hora de ativar a autenticação de duas etapas para a conta(${args.auth})`, String(error), `IP-Request: ${clientIP.ip}`, `GraphQL - Mutation`, `Method: authEnabledTwofactor`);

                throw new Error(error);
            }
        },
        authDisableTwofactor: async (parent: any, args: { auth: string }, context: { req: any }) => {
            try {
                return await userManagerDB.disabledtwofactor(args.auth);
            } catch (error: any) {
                const clientIP = geoIP(context.req);

                Debug.fatal('user', `Erro na hora de desativar a autenticação de duas etapas para a conta(${args.auth})`, String(error), `IP-Request: ${clientIP.ip}`, `GraphQL - Mutation`, `Method: authDisableTwofactor`);

                throw new Error(error);
            }
        },
        authRetrieveTwofactor: async (parent: any, args: { auth: string }, context: { req: any }) => {
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
                    clientIP = geoIP(context.req);

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
            } catch (error: any) {
                const clientIP = geoIP(context.req);

                Debug.fatal('user', `Erro na hora de recuperar a conta(${args.auth})`, String(error), `IP-Request: ${clientIP.ip}`, `GraphQL - Mutation`, `Method: authRetrieveTwofactor`);

                throw new Error(error);
            }
        }
    }
};