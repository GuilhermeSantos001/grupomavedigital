const
    getClientAddress = require('../../modules/getClientAddress'),
    getReqProps = require('../../modules/getReqProps'),
    mongoDB = require('../../modules/mongodb'),
    jwt = require('../../modules/jwt'),
    bcrypt = require('../../modules/bcrypt'),
    nodemailer = require('../../modules/nodemailer'),
    debug = require('../../modules/log4'),
    randomId = require('../../modules/randomId'),
    generatePassword = require('../../modules/generatePassword'),
    moment = require('../../modules/moment');

module.exports = {
    Query: {
        authLogin: async (source, { usr_auth, pwd, twofactortoken, locationIP, internetAdress }, { request }) => {
            try {
                let { user } = await mongoDB.users.cpassword(usr_auth, pwd),
                    userInfo = {
                        authorization: user['authorization'],
                        username: user['username'],
                        token: user['token'],
                        name: user['name']
                    }

                if (user['authentication']['twofactor']['enabled'] && twofactortoken.length <= 0) {
                    userInfo['token'] = 'twofactorVerify';

                    let error = `Verificação de duas etapas solicitadas para ${usr_auth}`;
                    debug.info('user', error, [`IP-Request: ${getClientAddress(request)}`, `GraphQL - Query`, `Method: authLogin`]);

                    throw new Error(error);
                } else if (user['authentication']['twofactor']['enabled'] && twofactortoken.length > 0) {
                    if (!await mongoDB.users.verifytwofactor(usr_auth, twofactortoken)) {
                        userInfo['token'] = 'twofactorDenied';

                        let error = `Código de verificação de duas etapas invalido para ${usr_auth}`;

                        debug.info('user', error, [`IP-Request: ${getClientAddress(request)}`, `GraphQL - Query`, `Method: authLogin`]);

                        throw new Error(error);
                    }
                }

                userInfo['token'] = jwt.sign({
                    "privilege": user['privilege'],
                    "auth": usr_auth,
                    "pass": pwd
                }, `${user['session']['cache']['tmp']}${user['session']['cache']['unit']}`);

                await mongoDB.users.connected(usr_auth, {
                    ip: getClientAddress(request),
                    token: userInfo['token'],
                    device: request.device['type'],
                    location: {
                        locationIP,
                        internetAdress,
                        browser: request.device.parser.useragent['family'],
                        os: request.device.parser.useragent['os']['family']
                    }
                });

                await mongoDB.activities.register(randomId(undefined, 12), moment.format(), getClientAddress(request), user['authorization'], user['privilege'], 'Se conectou ao sistema');

                debug.info('user', `Usuário(${usr_auth}) conectado`, [`IP-Request: ${getClientAddress(request)}`, `GraphQL - Query`, `Method: authLogin`]);

                return userInfo;
            } catch (error) {
                debug.fatal('user', `Erro ocorrido na hora de conectar o usuário(${usr_auth})`, error, [`IP-Request: ${getClientAddress(request)}`, `GraphQL - Query`, `Method: authLogin`]);

                throw new Error(error);
            }
        },
        authLogout: async (source, { usr_auth, usr_token }, { request }) => {
            try {
                await mongoDB.users.disconnected(usr_auth, { ip: getClientAddress(request), token: usr_token });

                debug.info('user', `Usuário(${usr_auth}) desconectado`, [`IP-Request: ${getClientAddress(request)}`, `GraphQL - Query`, `Method: authLogout`]);

                return true;
            } catch (error) {
                debug.fatal('user', `Erro ocorrido na hora de desconectar o usuário(${usr_auth}) desconectado`, error, [`IP-Request: ${getClientAddress(request)}`, `GraphQL - Query`, `Method: authLogout`]);

                throw new Error(error);
            }
        },
        authExpired: async (source, { usr_auth, usr_token }, { request }) => {
            try {
                await mongoDB.users.disconnected(usr_auth, { ip: getClientAddress(request), token: usr_token });

                debug.info('user', `Sessão do usuário(${usr_auth}) expirada`, [`IP-Request: ${getClientAddress(request)}`, `GraphQL - Query`, `Method: authExpired`]);

                return true;
            } catch (error) {
                debug.fatal('user', `Erro ocorrido na hora de verificar se a sessão do usuário(${usr_auth}) está expirada`, error, [`IP-Request: ${getClientAddress(request)}`, `GraphQL - Query`, `Method: authExpired`]);

                throw new Error(error);
            }
        },
        emailResendConfirm: async (source, { usr_auth }, { request }) => {
            try {
                let { users } = await mongoDB.users.get('authorization', usr_auth);

                if (users.length >= 1) users = users[0];

                let { temporarypass } = getReqProps(request, ['temporarypass']);

                temporarypass = Boolean(temporarypass);

                const email = users['email'],
                    username = users['username'],
                    auth = users['auth'];

                let password;

                if (temporarypass) {
                    password = generatePassword.unique();
                    await mongoDB.users.changepassword(auth, password);
                }

                // Envia o email de confirmação da conta
                return nodemailer.usr_econfirm(String(email).toLowerCase(), String(username), temporarypass ? String(password) : false, jwt.sign({
                    'econfirm': true,
                    'email': String(email).toLowerCase(),
                    'authorization': String(usr_auth).toLowerCase()
                }, '7d'))
                    .then(info => {
                        debug.info('user', `Email de confirmação da conta enviado para o usuário(${usr_auth})`, info, [`IP-Request: ${getClientAddress(request)}`, `GraphQL - Query`, `Method: emailResendConfirm`]);
                        return true;
                    })
                    .catch(err => {
                        debug.fatal('user', `Erro ocorrido na hora de enviar o email de confirmação da conta do usuário(${usr_auth})`, err, [`IP-Request: ${getClientAddress(request)}`, `GraphQL - Query`, `Method: emailResendConfirm`]);
                        return false;
                    })
            } catch (error) {
                debug.fatal('user', `Erro ocorrido na hora de enviar o email de confirmação da conta do usuário(${usr_auth})`, error, [`IP-Request: ${getClientAddress(request)}`, `GraphQL - Query`, `Method: emailResendConfirm`]);

                throw new Error(error);
            }
        }
    },
    Mutation: {
        registerUser: async (parent, {
            authorization,
            privilege,
            fotoPerfil,
            username,
            password,
            name,
            surname,
            email,
            cpfcnpj,
            location
        }, { request }) => {
            let { temporarypass } = getReqProps(request, ['temporarypass']);

            temporarypass = Boolean(temporarypass);

            if (temporarypass)
                password = generatePassword.unique();

            try {
                return bcrypt.crypt(password)
                    .then(password_encode => {
                        return mongoDB.users.register(
                            authorization,
                            privilege,
                            fotoPerfil || 'avatar.png',
                            username,
                            password_encode,
                            name,
                            surname, {
                            value: email
                        },
                            cpfcnpj,
                            {
                                street: String(location[0]),
                                number: Number(location[1]),
                                complement: String(location[2]),
                                district: String(location[3]),
                                state: String(location[4]),
                                city: String(location[5]),
                                zipcode: String(location[6])
                            }
                        )
                            .then(() => {
                                // Envia o email de confirmação da conta
                                return nodemailer.usr_econfirm(String(email).toLowerCase(), String(username), temporarypass ? String(password) : false, jwt.sign({
                                    'econfirm': true,
                                    'email': String(email).toLowerCase(),
                                    'authorization': String(authorization).toLowerCase()
                                }, '7d'))
                                    .then(info => {
                                        let msg = `Email de confirmação da conta ${authorization} enviado para ${email}`;

                                        debug.info('user', msg, info, [`IP-Request: ${getClientAddress(request)}`, `GraphQL - Mutation`, `Method: registerUser`]);

                                        return msg;
                                    })
                                    .catch(err => {
                                        let msg = `Email de confirmação da conta ${authorization} não pode ser enviado para ${email}`;

                                        debug.fatal('user', msg, err, [`IP-Request: ${getClientAddress(request)}`, `GraphQL - Mutation`, `Method: registerUser`]);

                                        throw new Error(err);
                                    })
                            })
                            .catch(err => {
                                debug.fatal('user', `Erro ocorrido na hora de enviar o email de confirmação da conta do usuário(${authorization})`, err, [`IP-Request: ${getClientAddress(request)}`, `GraphQL - Mutation`, `Method: registerUser`]);

                                throw new Error(err);
                            })
                    })
                    .catch(err => {
                        debug.fatal('user', `Erro ocorrido na hora de encriptar a senha da conta do usuário(${authorization})`, err, [`IP-Request: ${getClientAddress(request)}`, `GraphQL - Mutation`, `Method: registerUser`]);

                        throw new Error(err);
                    })
            } catch (error) {
                debug.fatal('user', `Erro ocorrido na hora de registrar a conta do usuário(${authorization})`, error, [`IP-Request: ${getClientAddress(request)}`, `GraphQL - Mutation`, `Method: registerUser`]);

                throw new Error(error);
            }
        },
        updateData: async (parent, {
            usr_auth,
            usr_email,
            usr_username,
            usr_name,
            usr_surname,
            usr_cnpj,
            usr_location
        }, { request }) => {
            try {
                await mongoDB.users.updateData(usr_auth, {
                    usr_email,
                    usr_username,
                    usr_name,
                    usr_surname,
                    usr_cnpj,
                    usr_location: JSON.parse(usr_location)
                });

                debug.info('user', `As informações da conta(${usr_auth}) foram atualizadas`, [`IP-Request: ${getClientAddress(request)}`, `GraphQL - Mutation`, `Method: updateData`]);

                return true;
            } catch (error) {
                debug.fatal('user', `Erro na hora de atualizar as informações da conta(${usr_auth})`, error, [`IP-Request: ${getClientAddress(request)}`, `GraphQL - Mutation`, `Method: updateData`]);

                throw new Error(error);
            }
        },
        changePassword: async (parent, { usr_auth, pwd, new_pwd }, { request }) => {
            try {
                const password_encode = await bcrypt.crypt(new_pwd);

                await mongoDB.users.cpassword(usr_auth, pwd);

                await mongoDB.users.changepassword(usr_auth, password_encode);

                let msg = `Senha da conta(${usr_auth}) alterada com sucesso`;

                debug.info('user', msg, [`IP-Request: ${getClientAddress(request)}`, `GraphQL - Mutation`, `Method: changePassword`]);

                return msg;
            } catch (error) {
                debug.fatal('user', `Erro na hora de alterar a senha para a conta(${usr_auth})`, error, [`IP-Request: ${getClientAddress(request)}`, `GraphQL - Mutation`, `Method: changePassword`]);

                throw new Error(error);
            }
        },
        authSignTwofactor: async (parent, { usr_auth }, { request }) => {
            try {
                const { qrcode } = await mongoDB.users.signtwofactor(usr_auth);

                debug.info('user', `QRCode gerado para a conta(${usr_auth})`, [`IP-Request: ${getClientAddress(request)}`, `GraphQL - Mutation`, `Method: authSignTwofactor`]);

                return qrcode;
            } catch (error) {
                debug.fatal('user', `Erro na hora de gerar o QRCode para a conta(${usr_auth})`, error, [`IP-Request: ${getClientAddress(request)}`, `GraphQL - Mutation`, `Method: authSignTwofactor`]);

                throw new Error(error);
            }
        },
        authVerifyTwofactor: async (parent, { usr_auth, usr_qrcode }, { request }) => {
            try {
                return await mongoDB.users.verifytwofactor(usr_auth, usr_qrcode);
            } catch (error) {
                debug.fatal('user', `Erro na hora de verificar a autenticação de duas etapas para a conta(${usr_auth})`, error, [`IP-Request: ${getClientAddress(request)}`, `GraphQL - Mutation`, `Method: authVerifyTwofactor`]);

                throw new Error(error);
            }
        },
        authEnabledTwofactor: async (parent, { usr_auth }, { request }) => {
            try {
                return await mongoDB.users.enabledtwofactor(usr_auth);
            } catch (error) {
                debug.fatal('user', `Erro na hora de ativar a autenticação de duas etapas para a conta(${usr_auth})`, error, [`IP-Request: ${getClientAddress(request)}`, `GraphQL - Mutation`, `Method: authEnabledTwofactor`]);

                throw new Error(error);
            }
        },
        authDisableTwofactor: async (parent, { usr_auth }, { request }) => {
            try {
                return await mongoDB.users.disabledtwofactor(usr_auth);
            } catch (error) {
                debug.fatal('user', `Erro na hora de desativar a autenticação de duas etapas para a conta(${usr_auth})`, error, [`IP-Request: ${getClientAddress(request)}`, `GraphQL - Mutation`, `Method: authDisableTwofactor`]);

                throw new Error(error);
            }
        },
        authRetrieveTwofactor: async (parent, { usr_auth }, { request }) => {
            try {
                return mongoDB.users.get('authorization', usr_auth)
                    .then(response => {
                        let users = response['users'] || [];

                        if (users.length >= 1) users = users[0];
                        else throw new Error(`Nenhum usuário encontrado.`);

                        const {
                            email,
                            username
                        } = users;

                        return nodemailer.usr_account_retrieve_twofactor(email, username, jwt.sign({
                            'econfirm': true,
                            'authorization': usr_auth
                        }, '7d'))
                            .then(info => {
                                debug.info('user', `Email de recuperação da conta(${usr_auth}) enviado`, info, [`IP-Request: ${getClientAddress(request)}`, `GraphQL - Mutation`, `Method: authRetrieveTwofactor`]);
                                return true;
                            })
                            .catch(err => {
                                debug.fatal('user', `Erro na hora de enviar o email de recuperação da conta(${usr_auth})`, err, [`IP-Request: ${getClientAddress(request)}`, `GraphQL - Mutation`, `Method: authRetrieveTwofactor`]);
                                return false;
                            })
                    })
                    .catch(err => {
                        debug.fatal('user', `Erro na hora de recuperar a conta(${usr_auth})`, err, [`IP-Request: ${getClientAddress(request)}`, `GraphQL - Mutation`, `Method: authRetrieveTwofactor`]);
                        return false;
                    })
            } catch (error) {
                debug.fatal('user', `Erro na hora de recuperar a conta(${usr_auth})`, error, [`IP-Request: ${getClientAddress(request)}`, `GraphQL - Mutation`, `Method: authRetrieveTwofactor`]);

                throw new Error(error);
            }
        }
    }
}