const users = [
    { id: 1, name: 'guilherme', email: 'suporte@grupomave.com.br', website: 'https://grupomavedigital.com.br' },
    { id: 2, name: 'jefferson', email: 'ti@grupomave.com.br' },
    { id: 3, name: 'lucas', email: 'lucas@grupomave.com.br' },
    { id: 4, name: 'jose', email: 'jose@grupomave.com.br' },
    { id: 5, name: 'rodrigo', email: 'rreis@grupomave.com.br' },
    { id: 6, name: 'adriano', email: 'adm@grupomave.com.br' },
    { id: 7, name: 'carlins', email: 'cf@grupomave.com.br' },
]

const getClientAddress = req => (req.headers['x-forwarded-for'] || '').split(',')[0] || req.connection.remoteAddress;
const mongoDB = require('../../modules/mongodb');
const jwt = require('../../modules/jwt');
const bcrypt = require('../../modules/bcrypt');
const LZString = require('lz-string');

module.exports = {
    Query: {
        users: (source, { limit }, { req }) => {
            return users.slice(0, limit);
        },
        user: async (source, { id }) => {
            try {
                const filter = users.filter(user => String(user.id) === String(id));

                if (filter.length <= 0)
                    throw new Error(`User with ID(${id}) not found!`);

                return filter[0];
            } catch (error) {
                throw new Error(error);
            }
        },
        authLogin: async (source, { usr_auth, pwd, twofactortoken, locationIP, internetAdress }, { request }) => {
            try {
                usr_auth = LZString.decompressFromEncodedURIComponent(usr_auth) || usr_auth;
                pwd = LZString.decompressFromEncodedURIComponent(pwd) || pwd;
                twofactortoken = LZString.decompressFromEncodedURIComponent(twofactortoken) || twofactortoken;
                locationIP = LZString.decompressFromEncodedURIComponent(locationIP) || locationIP;
                internetAdress = LZString.decompressFromEncodedURIComponent(internetAdress) || internetAdress;

                let { user } = await mongoDB.users.cpassword(usr_auth, pwd);

                if (user['authentication']['twofactor']['enabled'] && twofactortoken.length <= 0) {
                    return 'twofactorVerify';
                } else if (user['authentication']['twofactor']['enabled'] && twofactortoken.length > 0) {
                    console.log('Adicionar a verificação de duas etapas. Aqui!');
                } else {
                    user['token'] = jwt.sign({
                        "privilege": user['privilege'],
                        "auth": usr_auth,
                        "pass": pwd
                    }, `${user['session']['cache']['tmp']}${user['session']['cache']['unit']}`);

                    await mongoDB.users.connected(usr_auth, {
                        ip: getClientAddress(request),
                        token: user['token'],
                        device: request.device['type'],
                        location: {
                            locationIP,
                            internetAdress,
                            browser: request.device.parser.useragent['family'],
                            os: request.device.parser.useragent['os']['family']
                        }
                    });

                    return {
                        authorization: user['authorization'],
                        username: user['username'],
                        token: user['token'],
                        name: user['name']
                    }
                }

                /**
                 * Ainda Precisa adicionar a verificação de duas etapas.
                 */
                // .then(response => {
                //     let user = response['user'],
                //         data = response;

                //     if (user['authentication']['twofactor']['enabled'] && usr_twofactortoken.length <= 0) {
                //         return 'twofactorVerify';
                //     } else if (user['authentication']['twofactor']['enabled'] && usr_twofactortoken.length > 0) {
                //         mongoDB.users.verifytwofactor(usr_authorization, usr_twofactortoken)
                //             .then(response => {
                //                 if (!response)
                //                     return res.status(200).send({
                //                         message: 'Grupo Mave Digital - Success!!!',
                //                         data: 'twofactorDenied'
                //                     })
                //                 else
                //                     __next();
                //             })
                //             .catch(err => res.status(400).send({
                //                 message: 'Grupo Mave Digital - Error!!!',
                //                 error: err
                //             }))
                //     } else {
                //         __next();
                //     }
                // })
            } catch (error) {
                throw new Error(error);
            }
        }
    },
    Mutation: {
        createUser: async (parent, { name, email }, { req }) => {
            try {
                const filter = users.filter(user => String(user.name) === String(name));

                if (filter.length > 0)
                    throw new Error(`User with NAME(${name}) already exists!`);

                const id = users.push(
                    { id, name, email, website: 'https://grupomavedigital.com.br' }
                );

                return users[id]
            } catch (error) {
                throw new Error(error);
            }
        },
        changePassword: async (parent, { usr_auth, pwd, new_pwd }, { req }) => {
            try {
                usr_auth = LZString.decompressFromEncodedURIComponent(usr_auth) || usr_auth;
                pwd = LZString.decompressFromEncodedURIComponent(pwd) || pwd;
                new_pwd = LZString.decompressFromEncodedURIComponent(new_pwd) || new_pwd;

                return bcrypt.crypt(new_pwd)
                    .then(async password_encode => {
                        try {
                            await mongoDB.users.cpassword(usr_auth, pwd);

                            return mongoDB.users.changepassword(usr_auth, password_encode)
                                .then(() => { return `Senha alterada com sucesso!` })
                                .catch(err => { throw new Error(err) })
                        } catch {
                            throw new Error('Não foi possível alterar a senha. Verifique as informações e tente novamente!');
                        }
                    })
                    .catch(err => { throw new Error(err) })
            } catch (error) {
                throw new Error(error);
            }
        }
    }
}