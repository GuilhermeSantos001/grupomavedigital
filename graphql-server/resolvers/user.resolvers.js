const
    getClientAddress = req => (req.headers['x-forwarded-for'] || '').split(',')[0] || req.connection.remoteAddress,
    getReqProps = require('../../modules/getReqProps'),
    mongoDB = require('../../modules/mongodb'),
    jwt = require('../../modules/jwt'),
    bcrypt = require('../../modules/bcrypt'),
    nodemailer = require('../../modules/nodemailer'),
    LZString = require('lz-string');

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
                    return userInfo;
                } else if (user['authentication']['twofactor']['enabled'] && twofactortoken.length > 0) {
                    if (!await mongoDB.users.verifytwofactor(usr_auth, twofactortoken)) {
                        userInfo['token'] = 'twofactorDenied';
                        return userInfo;
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

                return userInfo;
            } catch (error) {
                throw new Error(error);
            }
        },
        authLogout: async (source, { usr_auth, usr_token }, { request }) => {
            try {
                usr_auth = LZString.decompressFromEncodedURIComponent(usr_auth) || usr_auth;
                usr_token = LZString.decompressFromEncodedURIComponent(usr_token) || usr_token;

                await mongoDB.users.disconnected(usr_auth, { ip: getClientAddress(request), token: usr_token });

                return true;
            } catch (error) {
                throw new Error(error);
            }
        },
        authExpired: async (source, { usr_auth, usr_token }, { request }) => {
            try {
                usr_auth = LZString.decompressFromEncodedURIComponent(usr_auth) || usr_auth;
                usr_token = LZString.decompressFromEncodedURIComponent(usr_token) || usr_token;

                await mongoDB.users.disconnected(usr_auth, { ip: getClientAddress(request), token: usr_token });

                return true;
            } catch (error) {
                throw new Error(error);
            }
        },
        emailResendConfirm: async (source, { usr_auth }, { request }) => {
            try {
                let { users } = await mongoDB.users.get('authorization', usr_auth);

                if (users.length >= 1) users = users[0];

                const email = users['email'],
                    username = users['username'];

                // Envia o email de confirmação da conta
                return nodemailer.usr_econfirm(String(email).toLowerCase(), String(username), jwt.sign({
                    'econfirm': true,
                    'email': String(email).toLowerCase(),
                    'authorization': String(usr_auth).toLowerCase()
                }, '7d'))
                    .then(info => { return true; })
                    .catch(err => { return false; })
            } catch (error) {
                throw new Error(error);
            }
        }
    },
    Mutation: {
        registerUser: async (parent, {
            usr_authorization,
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
            try {
                const { encodeuri } = getReqProps(request, ['encodeuri']);

                if (eval(String(encodeuri))) {
                    usr_authorization = LZString.decompressFromEncodedURIComponent(usr_authorization);
                    privilege = LZString.decompressFromEncodedURIComponent(privilege);
                    fotoPerfil = LZString.decompressFromEncodedURIComponent(fotoPerfil);
                    username = LZString.decompressFromEncodedURIComponent(username);
                    password = LZString.decompressFromEncodedURIComponent(password);
                    name = LZString.decompressFromEncodedURIComponent(name);
                    surname = LZString.decompressFromEncodedURIComponent(surname);
                    email = LZString.decompressFromEncodedURIComponent(email);
                    cpfcnpj = LZString.decompressFromEncodedURIComponent(cpfcnpj);
                    location = JSON.parse(LZString.decompressFromEncodedURIComponent(location));
                }

                location = {
                    street: String(location[0]),
                    number: Number(location[1]),
                    complement: String(location[2]),
                    district: String(location[3]),
                    state: String(location[4]),
                    city: String(location[5]),
                    zipcode: String(location[6])
                }

                return bcrypt.crypt(password)
                    .then(password_encode => {
                        return mongoDB.users.register(
                            usr_authorization,
                            privilege,
                            fotoPerfil || 'avatar.png',
                            username,
                            password_encode,
                            name,
                            surname, {
                            value: email
                        },
                            cpfcnpj,
                            location
                        )
                            .then(() => {
                                // Envia o email de confirmação da conta
                                return nodemailer.usr_econfirm(String(email).toLowerCase(), String(username), jwt.sign({
                                    'econfirm': true,
                                    'email': String(email).toLowerCase(),
                                    'authorization': String(usr_authorization).toLowerCase()
                                }, '7d'))
                                    .then(info => { return `Email de confirmação da conta ${usr_authorization} enviado para ${email}` })
                                    .catch(err => { throw new Error(`Email de confirmação da conta ${usr_authorization} não pode ser enviado para ${email}`) })
                            })
                            .catch(err => { throw new Error(err) })
                    })
                    .catch(err => { throw new Error(err) })
            } catch (error) {
                throw new Error(error);
            }
        },
        changePassword: async (parent, { usr_auth, pwd, new_pwd }, { request }) => {
            try {
                usr_auth = LZString.decompressFromEncodedURIComponent(usr_auth) || usr_auth;
                pwd = LZString.decompressFromEncodedURIComponent(pwd) || pwd;
                new_pwd = LZString.decompressFromEncodedURIComponent(new_pwd) || new_pwd;

                const password_encode = await bcrypt.crypt(new_pwd);
                await mongoDB.users.cpassword(usr_auth, pwd);
                await mongoDB.users.changepassword(usr_auth, password_encode);

                return `Senha alterada com sucesso!`;
            } catch (error) {
                throw new Error(error);
            }
        },
        authSignTwofactor: async (parent, { usr_auth }, { request }) => {
            try {
                usr_auth = LZString.decompressFromEncodedURIComponent(usr_auth) || usr_auth;

                const { qrcode } = await mongoDB.users.signtwofactor(usr_auth);

                return qrcode;
            } catch (error) {
                throw new Error(error);
            }
        },
        authVerifyTwofactor: async (parent, { usr_auth, usr_qrcode }, { request }) => {
            try {
                usr_auth = LZString.decompressFromEncodedURIComponent(usr_auth) || usr_auth;
                usr_qrcode = LZString.decompressFromEncodedURIComponent(usr_qrcode) || usr_qrcode;

                return await mongoDB.users.verifytwofactor(usr_auth, usr_qrcode);
            } catch (error) {
                throw new Error(error);
            }
        },
        authEnabledTwofactor: async (parent, { usr_auth }, { request }) => {
            try {
                usr_auth = LZString.decompressFromEncodedURIComponent(usr_auth) || usr_auth;

                return await mongoDB.users.enabledtwofactor(usr_auth);
            } catch (error) {
                throw new Error(error);
            }
        },
        authDisableTwofactor: async (parent, { usr_auth }, { request }) => {
            try {
                usr_auth = LZString.decompressFromEncodedURIComponent(usr_auth) || usr_auth;

                return await mongoDB.users.disabledtwofactor(usr_auth);
            } catch (error) {
                throw new Error(error);
            }
        },
        authRetrieveTwofactor: async (parent, { usr_auth }, { request }) => {
            try {
                usr_auth = LZString.decompressFromEncodedURIComponent(usr_auth) || usr_auth;

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
                            .then(info => { return true })
                            .catch(err => { return false })
                    })
                    .catch(err => { return false })
            } catch (error) {
                throw new Error(error);
            }
        }
    }
}