const __twofactor = require('../twofactor');

module.exports = (mongoose, uri, schema_users) => {
    return {
        register: ( // Registro do usuário no banco de dados
            authorization,
            privilege,
            fotoPerfil,
            username,
            password,
            name,
            surname,
            email,
            cnpj,
            location,
        ) => {
            return new Promise((resolve, reject) => {
                mongoose.connect(uri, {
                    useUnifiedTopology: true,
                    useNewUrlParser: true,
                    useCreateIndex: true
                }, (err, db) => {
                    if (err) {
                        reject([
                            `Não foi possível conectar com o mongoDB (Database ${db}).`,
                            err
                        ])
                        return mongoose.connection.close();
                    }
                    mongooseConnected();
                });

                function mongooseConnected() {
                    var user = new schema_users({
                        authorization: String(authorization),
                        privilege: String(privilege),
                        fotoPerfil: String(fotoPerfil),
                        username: String(username),
                        password: String(password),
                        name: String(name),
                        surname: String(surname),
                        email: Object(email),
                        cnpj: String(cnpj),
                        location: Object(location)
                    });
                    user.validate((err) => {
                        if (err) {
                            reject([
                                `Não é possível registrar o usuário com a autorização(${authorization}).`,
                                err
                            ]);
                            return mongoose.connection.close();
                        }
                        schema_users.find({
                            authorization: String(authorization)
                        }, (err, list) => {
                            if (err) {
                                reject([
                                    `Não foi possível verificar se o usuário com a autorização(${authorization}) já foi registrado.`,
                                    err
                                ]);
                                return mongoose.connection.close();
                            }

                            if (list instanceof Array !== true) list = [];

                            let items = list.filter(item => item.authorization == authorization);

                            if (items.length <= 0) {
                                user.save(function (err) {
                                    if (err) {
                                        reject([
                                            `Erro na hora de registrar o usuário com a autorização(${authorization}).`,
                                            err
                                        ]);
                                        return mongoose.connection.close();
                                    }

                                    resolve({
                                        message: `Usuário com a autorização(${authorization}) registrado no banco de dados.`,
                                        user: {
                                            authorization: user['authorization'],
                                            email: user['email']['value'],
                                            username: user['username']
                                        }
                                    });
                                    return mongoose.connection.close();
                                });
                            } else {
                                reject(`Usuário com a autorização(${authorization}) já está registrado no banco de dados.`);
                                return mongoose.connection.close();
                            }
                        });
                    });
                }
            });
        },
        updateDoc: (authorization, data = {}, filter = '') => {
            return new Promise((resolve, reject) => {
                mongoose.connect(uri, {
                    useUnifiedTopology: true,
                    useNewUrlParser: true,
                    useCreateIndex: true
                }, (err, db) => {
                    if (err) {
                        reject([
                            `Não foi possível conectar com o mongoDB (Database ${db}).`,
                            err
                        ])
                        return mongoose.connection.close();
                    }
                    mongooseConnected();
                });

                function mongooseConnected() {
                    schema_users.findOne({
                        authorization: String(authorization)
                    }, (err, user) => {
                        if (err) {
                            reject([
                                `Não foi possível verificar se o usuário com a autorização(${authorization}) já foi registrado.`,
                                err
                            ]);
                            return mongoose.connection.close();
                        }

                        if (user) {
                            let updateDocs = user['docs'] || {};

                            updateDocs[filter] = Object.assign(updateDocs[filter] || {}, data);

                            schema_users.updateOne({
                                authorization: String(authorization)
                            }, {
                                docs: updateDocs
                            }, (err) => {
                                if (err) {
                                    reject([
                                        `Não é possível atualizar as informações do usuário com a autorização(${authorization}).`,
                                        err
                                    ]);
                                    return mongoose.connection.close();
                                }
                                resolve(
                                    `As informações do usuário com a autorização(${authorization}), foram atualizadas.`
                                );
                                return mongoose.connection.close();
                            });
                        } else {
                            reject(`Usuário com o email(${authorization}) não existe no banco de dados.`);
                            return mongoose.connection.close();
                        }
                    });
                }
            });
        },
        cemail: (email, authorization) => {
            return new Promise((resolve, reject) => {
                mongoose.connect(uri, {
                    useUnifiedTopology: true,
                    useNewUrlParser: true,
                    useCreateIndex: true
                }, (err, db) => {
                    if (err) {
                        reject([
                            `Não foi possível conectar com o mongoDB (Database ${db}).`,
                            err
                        ])
                        return mongoose.connection.close();
                    }
                    mongooseConnected();
                });

                function mongooseConnected() {
                    schema_users.updateOne({
                        authorization: String(authorization)
                    }, {
                        email: {
                            value: email,
                            status: true
                        }
                    }, (err) => {
                        if (err) {
                            reject([
                                `Não é possível confirmar a conta com a autorização(${authorization}).`,
                                err
                            ]);
                            return mongoose.connection.close();
                        }
                        resolve(
                            `A conta com a autorização(${authorization}) foi confirmada.`
                        );
                        return mongoose.connection.close();
                    });
                }
            });
        },
        cpassword: (authorization, password) => { // Liberação do usuário através da senha
            return new Promise((resolve, reject) => {
                mongoose.connect(uri, {
                    useUnifiedTopology: true,
                    useNewUrlParser: true,
                    useCreateIndex: true
                }, (err, db) => {
                    if (err) {
                        reject(`Não foi possível conectar com o mongoDB (Database ${db})`)
                        return mongoose.connection.close();
                    }
                    mongooseConnected();
                });

                function mongooseConnected() {
                    schema_users.findOne({
                        authorization: String(authorization)
                    }, (err, user) => {
                        if (err) {
                            reject(`Não foi possível verificar se o usuário com a autorização(${authorization}) já foi registrado.`);
                            return mongoose.connection.close();
                        }

                        if (user) {
                            let bcrypt = require('../bcrypt');

                            const encode_password = user['password'];
                            const valid = user['email']['status'];

                            bcrypt.compare(password, encode_password)
                                .then(result => {
                                    if (result && valid)
                                        return resolve({
                                            message: `Usuário com a autorização(${authorization}) liberado para acesso.`,
                                            user: {
                                                authorization: user['authorization'],
                                                privilege: user['privilege'],
                                                username: user['username'],
                                                name: user['name'],
                                                session: user['session'],
                                                authentication: user['authentication']
                                            }
                                        });
                                    else if (result && !valid)
                                        return reject(`Usuário com a autorização(${authorization}) não está liberado para acesso, a conta ainda não foi confirmada por e-mail.`);
                                    else
                                        return reject(`Usuário com a autorização(${authorization}) não está liberado para acesso.`);
                                })
                                .catch(err => reject(`Não foi possível verificar se o usuário com a autorização(${authorization}) está autorizado a acessar o sistema.`))
                            return mongoose.connection.close();
                        } else {
                            reject(`Usuário com o email(${authorization}) não existe no banco de dados.`);
                            return mongoose.connection.close();
                        }
                    });
                }
            });
        },
        retrieve: (authorization) => { // Recuperação da conta
            return new Promise((resolve, reject) => {
                mongoose.connect(uri, {
                    useUnifiedTopology: true,
                    useNewUrlParser: true,
                    useCreateIndex: true
                }, (err, db) => {
                    if (err) {
                        reject([
                            `Não foi possível conectar com o mongoDB (Database ${db}).`,
                            err
                        ])
                        return mongoose.connection.close();
                    }
                    mongooseConnected();
                });

                function mongooseConnected() {
                    schema_users.findOne({
                        authorization: String(authorization)
                    }, (err, user) => {
                        if (err) {
                            reject([
                                `Não foi possível verificar se o usuário com a autorização(${authorization}) já foi registrado.`,
                                err
                            ]);
                            return mongoose.connection.close();
                        }

                        if (user) {
                            user['authentication']['twofactor'] = false; // Desativa a autenticação de dois fatores

                            schema_users.updateOne({
                                authorization: String(authorization)
                            }, {
                                authentication: user['authentication']
                            }, (err) => {
                                if (err) {
                                    reject([
                                        `Não é possível recuperar a conta com a autorização(${authorization}).`,
                                        err
                                    ]);
                                    return mongoose.connection.close();
                                }
                                resolve(
                                    `A conta com a autorização(${authorization}) foi recuperada.`
                                );
                                return mongoose.connection.close();
                            });
                        } else {
                            reject(`Usuário com a autorização(${authorization}) não existe no banco de dados.`);
                            return mongoose.connection.close();
                        }
                    })
                }
            });
        },
        changepassword: (authorization, new_password) => { // Troca a senha da conta
            return new Promise((resolve, reject) => {
                mongoose.connect(uri, {
                    useUnifiedTopology: true,
                    useNewUrlParser: true,
                    useCreateIndex: true
                }, (err, db) => {
                    if (err) {
                        reject([
                            `Não foi possível conectar com o mongoDB (Database ${db}).`,
                            err
                        ])
                        return mongoose.connection.close();
                    }
                    mongooseConnected();
                });

                function mongooseConnected() {
                    schema_users.findOne({
                        authorization: String(authorization)
                    }, (err, user) => {
                        if (err) {
                            reject([
                                `Não foi possível verificar se o usuário com a autorização(${authorization}) já foi registrado.`,
                                err
                            ]);
                            return mongoose.connection.close();
                        }

                        if (user) {
                            schema_users.updateOne({
                                authorization: String(authorization)
                            }, {
                                password: new_password
                            }, (err) => {
                                if (err) {
                                    reject(`Não é possível trocar a senha da conta com a autorização(${authorization}).`);
                                    return mongoose.connection.close();
                                }
                                resolve(`A conta com a autorização(${authorization}) teve a senha alterada.`);
                                return mongoose.connection.close();
                            });
                        } else {
                            reject(`Usuário com a autorização(${authorization}) não existe no banco de dados.`);
                            return mongoose.connection.close();
                        }
                    })
                }
            });
        },
        connected: (authorization, options) => {
            return new Promise((resolve, reject) => {
                mongoose.connect(uri, {
                    useUnifiedTopology: true,
                    useNewUrlParser: true,
                    useCreateIndex: true
                }, (err, db) => {
                    if (err) {
                        reject([
                            `Não foi possível conectar com o mongoDB (Database ${db}).`,
                            err
                        ])
                        return mongoose.connection.close();
                    }
                    mongooseConnected();
                });

                function mongooseConnected() {
                    schema_users.findOne({
                        authorization: String(authorization)
                    }, async (err, user) => {
                        if (err) {
                            reject(`Não foi possível verificar se o usuário com a autorização(${authorization}) já foi registrado.`);
                            return mongoose.connection.close();
                        }

                        if (user) {
                            let connected = user['session']['connected'],
                                limit = user['session']['limit'],
                                devices = user['session']['devices'] || {},
                                cache = user['session']['cache'] || {},
                                alerts = user['session']['alerts'] || {}

                            // - Define valores, caso estejam em branco
                            if (!alerts) alerts = {};
                            if (!cache['tokens']) cache['tokens'] = {};
                            if (!cache['history']) cache['history'] = {};

                            if (devices['allowed'].filter(device => device === String(options['device'])).length <= 0) {
                                reject(`Usuário com a autorização(${authorization}), está utilizando um dispositivo não permitido há estabelecer sessões.`);
                                return mongoose.connection.close();
                            }

                            // - Verifica se existe alguma sessão expirada
                            Object
                                .keys(cache['history'])
                                .forEach(key => {
                                    if (
                                        new Date(cache['history'][key]['tmp']) <= new Date()
                                    ) {
                                        while (devices['connected'].filter(token => token === key).length > 0) {
                                            devices['connected'].splice(devices['connected'].indexOf(key), 1);

                                            if (connected > 0)
                                                --connected;
                                        }

                                        cache['tokens'][key] = false;

                                        delete cache['history'][key];
                                    }
                                });

                            if (connected >= limit) {
                                reject(`Usuário com a autorização(${authorization}), excedeu o limite de sessões.`);
                                return mongoose.connection.close();
                            } else {
                                ++connected;

                                devices['connected'].push(String(options['token']));
                                cache['tokens'][String(options['token'])] = true;

                                let time = new Date();
                                if (cache['unit'] === 'm') {
                                    time.setMinutes(time.getMinutes() + cache['tmp']);
                                } else if (cache['unit'] === 'h') {
                                    time.getHours(time.getHours() + cache['tmp']);
                                } else if (cache['unit'] === 'd') {
                                    time.setDate(time.getDate() + cache['tmp']);
                                }

                                cache['history'][String(options['token'])] = {
                                    tmp: time.toJSON(),
                                    internetAdress: String(options['location']['internetAdress'])
                                }

                                if (!alerts[String(options['location']['internetAdress'])]) {
                                    require('../nodemailer')
                                        .session_new_access(
                                            user['email']['value'],
                                            user['username'],
                                            String(options['location']['browser']),
                                            String(options['location']['os']),
                                            String(options['location']['locationIP']),
                                            String(options['location']['internetAdress']).replace('::ffff:', '')
                                        )
                                        .then(info => console.log(`Email de novo acesso da conta enviado para ${user['email']['value']}`, info))
                                        .catch(err => console.log(`Email de novo acesso da conta não pode ser enviado para ${user['email']['value']}`, err))

                                    alerts[String(options['location']['internetAdress'])] = true;
                                }
                            }

                            let updateSession = Object.assign(user['session'], {
                                connected,
                                devices,
                                cache,
                                alerts
                            }) || {};

                            schema_users.updateOne({
                                authorization: String(authorization)
                            }, {
                                session: updateSession
                            }, (err) => {
                                if (err) {
                                    reject(`Não é possível conectar a sessão do usuário com a autorização(${authorization}).`);
                                    return mongoose.connection.close();
                                }
                                resolve(`A sessão do usuário com a autorização(${authorization}), foi conectada.`);
                                return mongoose.connection.close();
                            });
                        } else {
                            reject(`Usuário com a autorização(${authorization}) não existe no banco de dados.`);
                            return mongoose.connection.close();
                        }
                    });
                }
            });
        },
        disconnected: (authorization, options) => {
            return new Promise((resolve, reject) => {
                mongoose.connect(uri, {
                    useUnifiedTopology: true,
                    useNewUrlParser: true,
                    useCreateIndex: true
                }, (err, db) => {
                    if (err) {
                        reject([
                            `Não foi possível conectar com o mongoDB (Database ${db}).`,
                            err
                        ])
                        return mongoose.connection.close();
                    }
                    mongooseConnected();
                });

                function mongooseConnected() {
                    schema_users.findOne({
                        authorization: String(authorization)
                    }, (err, user) => {
                        if (err) {
                            reject([
                                `Não foi possível verificar se o usuário com a autorização(${authorization}) já foi registrado.`,
                                err
                            ]);
                            return mongoose.connection.close();
                        }

                        if (user) {
                            let connected = user['session']['connected'],
                                devices = user['session']['devices'],
                                cache = user['session']['cache'];

                            while (devices['connected'].filter(token => token === String(options['token'])).length > 0) {
                                devices['connected'].splice(devices['connected'].indexOf(String(options['token'])), 1);

                                if (connected > 0)
                                    --connected;
                            }

                            cache['tokens'][String(options['token'])] = false;

                            if (cache['history'][String(options['token'])])
                                delete cache['history'][String(options['token'])]

                            let updateSession = Object.assign(user['session'], {
                                connected,
                                devices,
                                cache
                            }) || {};

                            schema_users.updateOne({
                                authorization: String(authorization)
                            }, {
                                session: updateSession
                            }, (err) => {
                                if (err) {
                                    reject([
                                        `Não é possível desconectar a sessão do usuário com a autorização(${authorization}).`,
                                        err
                                    ]);
                                    return mongoose.connection.close();
                                }
                                resolve(
                                    `A sessão do usuário com a autorização(${authorization}), foi desconectada.`
                                );
                                return mongoose.connection.close();
                            });
                        } else {
                            reject(`Usuário com a autorização(${authorization}) não existe no banco de dados.`);
                            return mongoose.connection.close();
                        }
                    });
                }
            });
        },
        verifytoken: (authorization, token, internetAdress, ip) => {
            return new Promise((resolve, reject) => {
                mongoose.connect(uri, {
                    useUnifiedTopology: true,
                    useNewUrlParser: true,
                    useCreateIndex: true
                }, (err, db) => {
                    if (err) {
                        reject([
                            `Não foi possível conectar com o mongoDB (Database ${db}).`,
                            err
                        ])
                        return mongoose.connection.close();
                    }
                    mongooseConnected();
                });

                function mongooseConnected() {
                    schema_users.findOne({
                        authorization: String(authorization)
                    }, (err, user) => {
                        if (err) {
                            reject([
                                `Não foi possível verificar se o usuário com a autorização(${authorization}) já foi registrado.`,
                                err
                            ]);
                            return mongoose.connection.close();
                        }

                        if (user) {
                            let cache = user['session']['cache'],
                                devices = user['session']['devices'];

                            if (
                                devices['connected'].filter(token => token === String(token)).length <= 0 || !cache['tokens'][String(token)]
                            ) {
                                reject({
                                    message: `O token da sessão do usuário com a autorização(${authorization}), não está mais valido.`,
                                    code: 1
                                });
                                return mongoose.connection.close();
                            }

                            if (
                                cache['history'][token] && cache['history'][token]['internetAdress'] !== internetAdress
                            ) {
                                reject({
                                    message: `O token da sessão do usuário com a autorização(${authorization}), está em outro endereço de internet.`,
                                    code: 2
                                });
                                return mongoose.connection.close();
                            }

                            if (
                                cache['history'][token] && cache['history'][token]['internetAdress'] !== ip
                            ) {
                                reject({
                                    message: `O token da sessão do usuário com a autorização(${authorization}), está em outro endereço de IP.`,
                                    code: 3
                                });
                                return mongoose.connection.close();
                            }

                            resolve(
                                `O token da sessão do usuário com a autorização(${authorization}), está valido.`
                            );
                            return mongoose.connection.close();
                        } else {
                            reject(`Usuário com a autorização(${authorization}) não existe no banco de dados.`);
                            return mongoose.connection.close();
                        }
                    });
                }
            });
        },
        signtwofactor: (authorization) => {
            return new Promise((resolve, reject) => {
                mongoose.connect(uri, {
                    useUnifiedTopology: true,
                    useNewUrlParser: true,
                    useCreateIndex: true
                }, (err, db) => {
                    if (err) {
                        reject([
                            `Não foi possível conectar com o mongoDB (Database ${db}).`,
                            err
                        ])
                        return mongoose.connection.close();
                    }
                    mongooseConnected();
                });

                function mongooseConnected() {
                    schema_users.findOne({
                        authorization: String(authorization)
                    }, async (err, user) => {
                        if (err) {
                            reject([
                                `Não foi possível verificar se o usuário com a autorização(${authorization}) já foi registrado.`,
                                err
                            ]);
                            return mongoose.connection.close();
                        }

                        if (user) {
                            let twofactor = user['authentication']['twofactor'];

                            const {
                                secret,
                                qrcode
                            } = await __twofactor.generateQRCode(user['username']);

                            twofactor = {
                                secret,
                                enabled: false
                            };

                            let updateAuthentication = Object.assign(user['authentication'], {
                                twofactor
                            }) || {};

                            schema_users.updateOne({
                                authorization: String(authorization)
                            }, {
                                authentication: updateAuthentication
                            }, (err) => {
                                if (err) {
                                    reject([
                                        `Não é possível registrar a autenticação de dois fatores do usuário com a autorização(${authorization}).`,
                                        err
                                    ]);
                                    return mongoose.connection.close();
                                }
                                resolve({
                                    message: `Autenticação de dois fatores do usuário com a autorização(${authorization}), foi registrada.`,
                                    qrcode
                                });
                                return mongoose.connection.close();
                            });
                        } else {
                            reject([`Usuário com a autorização(${authorization}) não existe no banco de dados.`]);
                            return mongoose.connection.close();
                        }
                    });
                }
            });
        },
        verifytwofactor: (authorization, userToken) => {
            return new Promise((resolve, reject) => {
                mongoose.connect(uri, {
                    useUnifiedTopology: true,
                    useNewUrlParser: true,
                    useCreateIndex: true
                }, (err, db) => {
                    if (err) {
                        reject([
                            `Não foi possível conectar com o mongoDB (Database ${db}).`,
                            err
                        ])
                        return mongoose.connection.close();
                    }
                    mongooseConnected();
                });

                function mongooseConnected() {
                    schema_users.findOne({
                        authorization: String(authorization)
                    }, async (err, user) => {
                        if (err) {
                            reject([
                                `Não foi possível verificar se o usuário com a autorização(${authorization}) já foi registrado.`,
                                err
                            ]);
                            return mongoose.connection.close();
                        }

                        if (user) {
                            try {
                                let twofactor = user['authentication']['twofactor'];

                                resolve(await __twofactor.verify(twofactor['secret'], userToken));
                                return mongoose.connection.close();
                            } catch (err) {
                                reject([`Nâo foi possível verificar a autenticação de dois fatores do usuário com a autorização(${authorization}), erro: ${err}.`]);
                                return mongoose.connection.close();
                            }
                        } else {
                            reject([`Usuário com a autorização(${authorization}) não existe no banco de dados.`]);
                            return mongoose.connection.close();
                        }
                    });
                }
            });
        },
        enabledtwofactor: (authorization) => {
            return new Promise((resolve, reject) => {
                mongoose.connect(uri, {
                    useUnifiedTopology: true,
                    useNewUrlParser: true,
                    useCreateIndex: true
                }, (err, db) => {
                    if (err) {
                        reject([
                            `Não foi possível conectar com o mongoDB (Database ${db}).`,
                            err
                        ])
                        return mongoose.connection.close();
                    }
                    mongooseConnected();
                });

                function mongooseConnected() {
                    schema_users.findOne({
                        authorization: String(authorization)
                    }, async (err, user) => {
                        if (err) {
                            reject([
                                `Não foi possível verificar se o usuário com a autorização(${authorization}) já foi registrado.`,
                                err
                            ]);
                            return mongoose.connection.close();
                        }

                        if (user) {
                            let twofactor = user['authentication']['twofactor'];

                            if (typeof twofactor === 'object') {
                                twofactor['enabled'] = true;

                                let updateAuthentication = Object.assign(user['authentication'], {
                                    twofactor
                                }) || {};

                                schema_users.updateOne({
                                    authorization: String(authorization)
                                }, {
                                    authentication: updateAuthentication
                                }, (err) => {
                                    if (err) {
                                        reject([
                                            `Não é possível habilitar a autenticação de dois fatores do usuário com a autorização(${authorization}).`,
                                            err
                                        ]);
                                        return mongoose.connection.close();
                                    }
                                    resolve(`Autenticação de dois fatores do usuário com a autorização(${authorization}), foi habilitada.`);
                                    return mongoose.connection.close();
                                });
                            } else {
                                reject([`Usuário com a autorização(${authorization}) não possui uma autenticação de dois fatores registrada.`]);
                                return mongoose.connection.close();
                            }
                        } else {
                            reject([`Usuário com a autorização(${authorization}) não existe no banco de dados.`]);
                            return mongoose.connection.close();
                        }
                    });
                }
            });
        },
        disabledtwofactor: (authorization) => {
            return new Promise((resolve, reject) => {
                mongoose.connect(uri, {
                    useUnifiedTopology: true,
                    useNewUrlParser: true,
                    useCreateIndex: true
                }, (err, db) => {
                    if (err) {
                        reject([
                            `Não foi possível conectar com o mongoDB (Database ${db}).`,
                            err
                        ])
                        return mongoose.connection.close();
                    }
                    mongooseConnected();
                });

                function mongooseConnected() {
                    schema_users.findOne({
                        authorization: String(authorization)
                    }, async (err, user) => {
                        if (err) {
                            reject([
                                `Não foi possível verificar se o usuário com a autorização(${authorization}) já foi registrado.`,
                                err
                            ]);
                            return mongoose.connection.close();
                        }

                        if (user) {
                            let twofactor = user['authentication']['twofactor'];

                            if (typeof twofactor === 'object') {
                                twofactor['secret'] = '';
                                twofactor['enabled'] = false;

                                let updateAuthentication = Object.assign(user['authentication'], {
                                    twofactor
                                }) || {};

                                schema_users.updateOne({
                                    authorization: String(authorization)
                                }, {
                                    authentication: updateAuthentication
                                }, (err) => {
                                    if (err) {
                                        reject([
                                            `Não é possível desabilitar a autenticação de dois fatores do usuário com a autorização(${authorization}).`,
                                            err
                                        ]);
                                        return mongoose.connection.close();
                                    }
                                    resolve(`Autenticação de dois fatores do usuário com a autorização(${authorization}), foi desabilitada.`);
                                    return mongoose.connection.close();
                                });
                            } else {
                                reject([`Usuário com a autorização(${authorization}) não possui uma autenticação de dois fatores registrada.`]);
                                return mongoose.connection.close();
                            }
                        } else {
                            reject([`Usuário com a autorização(${authorization}) não existe no banco de dados.`]);
                            return mongoose.connection.close();
                        }
                    });
                }
            });
        },
        notificationCreate: (
            authorization,
            title,
            subtitle,
            body,
            background,
            expires
        ) => {
            return new Promise((resolve, reject) => {
                mongoose.connect(uri, {
                    useUnifiedTopology: true,
                    useNewUrlParser: true,
                    useCreateIndex: true
                }, (err, db) => {
                    if (err) {
                        reject([
                            `Não foi possível conectar com o mongoDB (Database ${db}).`,
                            err
                        ])
                        return mongoose.connection.close();
                    }
                    mongooseConnected();
                });

                function mongooseConnected() {
                    schema_users.findOne({
                        authorization: String(authorization)
                    }, (err, user) => {
                        if (err) {
                            reject([
                                `Não foi possível verificar se o usuário com a autorização(${authorization}) já foi registrado.`,
                                err
                            ]);
                            return mongoose.connection.close();
                        }

                        if (user) {
                            let updateNotification = user['notifications'] || [],
                                notification = {
                                    title: String(title),
                                    subtitle: String(subtitle),
                                    body: String(body),
                                    background: String(background),
                                    expires: require('expires').after(expires)
                                };

                            updateNotification.splice(0, 0, notification);

                            schema_users.updateOne({
                                authorization: String(authorization)
                            }, {
                                notifications: updateNotification
                            }, (err) => {
                                if (err) {
                                    reject([
                                        `Não é possível criar a notificação do usuário com a autorização(${authorization}).`,
                                        err
                                    ]);
                                    return mongoose.connection.close();
                                }
                                resolve(
                                    `A notificação do usuário com a autorização(${authorization}), foi criada.`,
                                    notification
                                );
                                return mongoose.connection.close();
                            });
                        } else {
                            reject(`Usuário com a autorização(${authorization}) não existe no banco de dados.`);
                            return mongoose.connection.close();
                        }
                    });
                }
            });
        },
        notificationRemove: (authorization, indexOf) => {
            return new Promise((resolve, reject) => {
                mongoose.connect(uri, {
                    useUnifiedTopology: true,
                    useNewUrlParser: true,
                    useCreateIndex: true
                }, (err, db) => {
                    if (err) {
                        reject([
                            `Não foi possível conectar com o mongoDB (Database ${db}).`,
                            err
                        ])
                        return mongoose.connection.close();
                    }
                    mongooseConnected();
                });

                function mongooseConnected() {
                    schema_users.findOne({
                        authorization: String(authorization)
                    }, (err, user) => {
                        if (err) {
                            reject([
                                `Não foi possível verificar se o usuário com a autorização(${authorization}) já foi registrado.`,
                                err
                            ]);
                            return mongoose.connection.close();
                        }

                        if (user) {
                            let updateNotification = user['notifications'] || [],
                                notification = updateNotification[indexOf];

                            if (notification) {
                                if (require('expires').expired(notification['expires'])) {
                                    updateNotification.splice(indexOf, 1);

                                    schema_users.updateOne({
                                        authorization: String(authorization)
                                    }, {
                                        notifications: updateNotification
                                    }, (err) => {
                                        if (err) {
                                            reject([
                                                `Não é possível remover a notificação(${indexOf}) do usuário com a autorização(${authorization}).`,
                                                err
                                            ]);
                                            return mongoose.connection.close();
                                        }
                                        resolve(
                                            `A notificação(${indexOf}) do usuário com a autorização(${authorization}), foi removida.`
                                        );
                                        return mongoose.connection.close();
                                    });
                                } else {
                                    reject([
                                        `Não é possível remover a notificação(${indexOf}) do usuário com a autorização(${authorization}).`,
                                        `O tempo de expiração da notificação ainda está em vigor.`
                                    ]);
                                    return mongoose.connection.close();
                                }
                            } else {
                                reject([
                                    `Não é possível remover a notificação(${indexOf}) do usuário com a autorização(${authorization}).`,
                                    `O indexOf(${indexOf}) não faz referência a nenhuma notificação.`
                                ]);
                                return mongoose.connection.close();
                            }
                        } else {
                            reject(`Usuário com a autorização(${authorization}) não existe no banco de dados.`);
                            return mongoose.connection.close();
                        }
                    });
                }
            });
        },
        get: (field = '', value = '') => { // Busca o usuário de forma customizada
            return new Promise((resolve, reject) => {
                mongoose.connect(uri, {
                    useUnifiedTopology: true,
                    useNewUrlParser: true,
                    useCreateIndex: true
                }, (err, db) => {
                    if (err) {
                        reject([
                            `Não foi possível conectar com o mongoDB (Database ${db})`,
                            err
                        ])
                        return mongoose.connection.close();
                    }
                    mongooseConnected();
                });

                function mongooseConnected() {
                    const filter = {};

                    if (field != '') filter[field] = value;

                    schema_users.find(filter, (err, users) => {
                        if (err) {
                            reject([
                                `Não foi possível encontrar o usuário pelo campo(${field}) com o valor: ${value}.`,
                                err
                            ]);
                            return mongoose.connection.close();
                        }

                        if (users) {
                            resolve({
                                message: `Informações dos usuários pelo campo(${field}) com o valor: ${value}. Retornadas com sucesso!`,
                                users: users.map(user => {
                                    return {
                                        auth: user['authorization'],
                                        email: user['email']['value'],
                                        fotoPerfil: user['fotoPerfil'],
                                        username: user['username'],
                                        name: user['name'],
                                        surname: user['surname'],
                                        cnpj: user['cnpj'],
                                        location: {
                                            street: user['location']['street'],
                                            number: user['location']['number'],
                                            complement: user['location']['complement'],
                                            district: user['location']['district'],
                                            state: user['location']['state'],
                                            city: user['location']['city'],
                                            zipcode: user['location']['zipcode']
                                        },
                                        docs: user['docs'],
                                        notifications: user['notifications'],
                                        session: user['session'],
                                        authentication: user['authentication']
                                    }
                                })
                            });
                            return mongoose.connection.close();
                        } else {
                            reject(`Usuário com o campo(${field}) com o valor: ${value}. não existe no banco de dados.`);
                            return mongoose.connection.close();
                        }
                    });
                }
            });
        }
    }
}
// /**
//  * @description Confirma a conta do usuário
//  * @author GuilhermeSantos
//  * @param {string} email Endereço de email do usuário
//  * @version 1.0.0
//  */
// function db_users_confirm_account(email) {
//     return new Promise((resolve, reject) => {
//         mongoose.connect(uri, {
//             useUnifiedTopology: true,
//             useNewUrlParser: true,
//             useCreateIndex: true
//         }, (err, db) => {
//             if (err) {
//                 reject([
//                     `Não foi possível conectar com o mongoDB (Database ${db}).`,
//                     err
//                 ])
//                 return mongoose.connection.close();
//             }
//             mongooseConnected();
//         });

//         function mongooseConnected() {
//             schema_users.updateOne({
//                 email: String(email)
//             }, {
//                 verifyAccount: Boolean(true)
//             }, (err) => {
//                 if (err) {
//                     reject([
//                         `Não é possível confirmar a conta com o endereço de email(${email}).`,
//                         err
//                     ]);
//                     return mongoose.connection.close();
//                 }
//                 resolve(
//                     `A conta com o endereço de email(${email}) foi confirmada.`
//                 );
//                 return mongoose.connection.close();
//             });
//         }
//     });
// };

// /**
//  * @description Retorna um usuário especifico ou todos
//  * @param {string} email Endereço de email do usuário
//  * @author GuilhermeSantos
//  * @version 1.0.0
//  */
// function db_users_all(email = '') {
//     return new Promise((resolve, reject) => {
//         mongoose.connect(uri, {
//             useUnifiedTopology: true,
//             useNewUrlParser: true,
//             useCreateIndex: true
//         }, (err, db) => {
//             if (err) {
//                 reject([
//                     `Não foi possível conectar com o mongoDB (Database ${db})`,
//                     err
//                 ])
//                 return mongoose.connection.close();
//             }
//             mongooseConnected();
//         });

//         function mongooseConnected() {
//             schema_users.find(email.length <= 0 ? {} : {
//                 email: String(email)
//             }, (err, list) => {
//                 if (err) {
//                     if (email != '') {
//                         reject([
//                             `Não foi possível verificar se o usuário com o email(${email}) já foi salvo.`,
//                             err
//                         ]);
//                     } else {
//                         reject([
//                             `Não foi possível verificar se existem usuários salvos.`,
//                             err
//                         ]);
//                     }
//                     return mongoose.connection.close();
//                 }

//                 if (list instanceof Array !== true) list = [];

//                 let items = email != '' ? list.filter(item => {
//                     if (item.email == email)
//                         return {
//                             status: item.status,
//                             privilege: item.privilege,
//                             email: item.email,
//                             username: item.username,
//                             lastLogin: item.lastLogin,
//                             dateCreated: item.dateCreated,
//                             verifyAccount: item.verifyAccount
//                         }
//                 }) : list.map(item => {
//                     return {
//                         status: item.status,
//                         privilege: item.privilege,
//                         email: item.email,
//                         username: item.username,
//                         lastLogin: item.lastLogin,
//                         dateCreated: item.dateCreated,
//                         verifyAccount: item.verifyAccount
//                     }
//                 });

//                 if (items.length <= 0) {
//                     if (email != '') {
//                         resolve(`Usuário com o email(${email}) não existe no banco de dados.`);
//                     } else {
//                         reject(`Não existem usuários no banco de dados.`);
//                     }
//                     return mongoose.connection.close();
//                 } else {
//                     resolve(items);
//                     return mongoose.connection.close();
//                 }
//             });
//         }
//     });
// };

// /**
//  * @description Atualiza as informações do usuário
//  * @author GuilhermeSantos
//  * @param {string} email Endereço de email do usuário
//  * @param {Object} update Objeto contendo as propriedades atualizadas
//  * @version 1.0.0
//  */
// function db_users_update(email, update) {
//     return new Promise((resolve, reject) => {
//         mongoose.connect(uri, {
//             useUnifiedTopology: true,
//             useNewUrlParser: true,
//             useCreateIndex: true
//         }, (err, db) => {
//             if (err) {
//                 reject([
//                     `Não foi possível conectar com o mongoDB (Database ${db}).`,
//                     err
//                 ])
//                 return mongoose.connection.close();
//             }
//             mongooseConnected();
//         });

//         function mongooseConnected() {
//             schema_users.updateOne({
//                 email: String(email)
//             }, update, (err) => {
//                 if (err) {
//                     reject([
//                         `Não é possível atualizar as informações da conta com o endereço de email(${email}).`,
//                         err
//                     ]);
//                     return mongoose.connection.close();
//                 }
//                 resolve(
//                     `As informações da conta com o endereço de email(${email}) foram atualizadas.`
//                 );
//                 return mongoose.connection.close();
//             });
//         }
//     });
// };

// /**
//  * @description Retorna informações do usuário
//  * @author GuilhermeSantos
//  * @param {string} email Endereço de email do usuário
//  * @param {Array} keys Objeto contendo as propriedades a serem retornadas
//  * @version 1.0.0
//  */
// function db_users_get_keys(email, keys = []) {
//     return new Promise((resolve, reject) => {
//         mongoose.connect(uri, {
//             useUnifiedTopology: true,
//             useNewUrlParser: true,
//             useCreateIndex: true
//         }, (err, db) => {
//             if (err) {
//                 reject([
//                     `Não foi possível conectar com o mongoDB (Database ${db}).`,
//                     err
//                 ])
//                 return mongoose.connection.close();
//             }
//             mongooseConnected();
//         });

//         function mongooseConnected() {
//             schema_users.findOne({
//                 email: String(email)
//             }, (err, user) => {
//                 if (err) {
//                     reject([
//                         `Não é possível retornar as informações da conta com o endereço de email(${email}).`,
//                         err
//                     ]);
//                     return mongoose.connection.close();
//                 }

//                 if (user) {
//                     let items = {};

//                     keys.map(key => {
//                         if (user[key] != undefined) {
//                             items[key] = user[key];
//                         }
//                     });

//                     resolve(items);
//                     return mongoose.connection.close();
//                 } else {
//                     reject(`Usuário com o email(${email}) não existe no banco de dados.`);
//                     return mongoose.connection.close();
//                 }
//             });
//         }
//     });
// };

// /**
//  * @description Faz a validação da senha do usuário
//  * @param {string} email Endereço de email do usuário
//  * @author GuilhermeSantos
//  * @version 1.0.0
//  */
// function db_users_password_validate(email, password) {
//     return new Promise((resolve, reject) => {
//         mongoose.connect(uri, {
//             useUnifiedTopology: true,
//             useNewUrlParser: true,
//             useCreateIndex: true
//         }, (err, db) => {
//             if (err) {
//                 reject([
//                     `Não foi possível conectar com o mongoDB (Database ${db})`,
//                     err
//                 ])
//                 return mongoose.connection.close();
//             }
//             mongooseConnected();
//         });

//         function mongooseConnected() {
//             schema_users.findOne({
//                 email: String(email)
//             }, (err, user) => {
//                 if (err) {
//                     reject([
//                         `Não foi possível verificar se o usuário com o email(${email}) já foi salvo.`,
//                         err
//                     ]);
//                     return mongoose.connection.close();
//                 }

//                 if (user) {
//                     let bcrypt = require('bcrypt');

//                     const encode_password = user['password'];

//                     if (bcrypt.compareSync(password, encode_password)) {
//                         resolve(`Usuário com o email(${email}) liberado para acesso.`);
//                     } else {
//                         reject(`Usuário com o email(${email}) não está liberado para acesso.`);
//                     }
//                     return mongoose.connection.close();
//                 } else {
//                     reject(`Usuário com o email(${email}) não existe no banco de dados.`);
//                     return mongoose.connection.close();
//                 }
//             });
//         }
//     });
// };

// /**
//  * @description Limpa os comandos
//  * @author GuilhermeSantos
//  * @param {string} id Identificador do comando
//  * @param {function} callback Função a ser retornada com uma array de resposta
//  * @version 1.1.0
//  */
// function clearCommands(id, callback) {
//     mongoose.connect(uri, {
//         useUnifiedTopology: true,
//         useNewUrlParser: true,
//         useCreateIndex: true
//     }, (err, db) => {
//         if (err) {
//             callback([
//                 `Não foi possível conectar com o mongoDB (Database ${db})`,
//                 err
//             ])
//             return mongoose.connection.close();
//         }
//         mongooseConnected();
//     });

//     function mongooseConnected() {
// Schema_Commands.remove(id.length <= 0 ? {} : {
//     id: String(id)
// }, (err) => {
//     if (err) {
//         callback([
//             id.length <= 0 ? `Não foi possível remover os comandos` :
//             `Não é possível remover o comando com o ID(${id}) do banco de dados`,
//             err
//         ]);
//         return mongoose.connection.close();
//     }
//     callback(
//         id.length <= 0 ? `Comandos removidos do banco de dados` :
//         `Comando com o ID(${id}) removido do banco de dados`
//     );
//     return mongoose.connection.close();
// });
// }
// };