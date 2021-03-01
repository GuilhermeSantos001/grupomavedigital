module.exports = (mongoose, uri, schema_clients) => {
    return {
        register: ( // Registro do cliente no banco de dados
            id,
            person,
            name,
            costcenter,
            cpfcnpj,
            location,
            phone,
            phone2,
            contact,
            email
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
                    var client = new schema_clients({
                        id: String(id),
                        person: String(person),
                        name: String(name),
                        costcenter: String(costcenter),
                        cpfcnpj: String(cpfcnpj),
                        location: Object(location),
                        phone: String(phone),
                        phone2: String(phone2),
                        contact: String(contact),
                        email: String(email)
                    });
                    client.validate((err) => {
                        if (err) {
                            reject([
                                `Não é possível registrar o cliente com o id(${id}).`,
                                err
                            ]);
                            return mongoose.connection.close();
                        }
                        schema_clients.find({
                            id: String(id)
                        }, (err, list) => {
                            if (err) {
                                reject([
                                    `Não foi possível verificar se o cliente com o id(${id}) já foi registrado.`,
                                    err
                                ]);
                                return mongoose.connection.close();
                            }

                            if (list instanceof Array !== true) list = [];

                            let items = list.filter(item => item.id == id);

                            if (items.length <= 0) {
                                client.save(function (err) {
                                    if (err) {
                                        reject([
                                            `Erro na hora de registrar o cliente com o id(${id}).`,
                                            err
                                        ]);
                                        return mongoose.connection.close();
                                    }

                                    resolve({
                                        message: `Cliente com o id(${id}) registrado no banco de dados.`,
                                        client: {
                                            id: client['id'],
                                            name: client['name']
                                        }
                                    });
                                    return mongoose.connection.close();
                                });
                            } else {
                                reject(`Cliente com o id(${id}) já está registrado no banco de dados.`);
                                return mongoose.connection.close();
                            }
                        });
                    });
                }
            });
        },
        update: (id, data) => { // Atualiza as informações do cliente especifico
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
                    schema_clients.updateOne({
                        id: String(id)
                    }, {
                        person: String(data['person']),
                        name: String(data['name']),
                        costcenter: String(data['costcenter']),
                        cpfcnpj: String(data['cpfcnpj']),
                        location: Object(data['location']),
                        phone: String(data['phone']),
                        phone2: String(data['phone2']),
                        contact: String(data['contact']),
                        email: String(data['email'])
                    }, (err) => {
                        if (err) {
                            reject([
                                `Não é possível atualizar as informações do cliente com o id(${id}).`,
                                err
                            ]);
                            return mongoose.connection.close();
                        }
                        resolve(
                            `As informações do cliente com o id(${id}), foram atualizadas.`
                        );
                        return mongoose.connection.close();
                    });
                }
            });
        },
        inactive: (id, reason, measure) => { // Inativa o cliente especifico
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
                    schema_clients.find({
                        id: String(id)
                    }, (err, clients) => {
                        if (err) {
                            reject([
                                `Não foi possível encontrar os clientes pelo campo(${field}) com o valor: ${value}.`,
                                err
                            ]);
                            return mongoose.connection.close();
                        }

                        if (clients) {
                            schema_clients.updateOne({
                                id: String(id)
                            }, {
                                status: false,
                                inactive: Object({
                                    reason: String(reason),
                                    measure: String(measure),
                                    resolution: []
                                })
                            }, (err) => {
                                if (err) {
                                    reject([
                                        `Não é possível inativar o cliente com o id(${id}).`,
                                        err
                                    ]);
                                    return mongoose.connection.close();
                                }
                                resolve(
                                    `O cliente com o id(${id}) está inativo.`
                                );
                                return mongoose.connection.close();
                            });
                        } else {
                            reject(`Clientes com o campo(${field}) com o valor: ${value}. não existem no banco de dados.`);
                            return mongoose.connection.close();
                        }
                    });
                }
            });
        },
        reactivate: (id) => { // Reativa o cliente especifico
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
                    schema_clients.find({
                        id: String(id)
                    }, (err, clients) => {
                        if (err) {
                            reject([
                                `Não foi possível encontrar os clientes pelo campo(${field}) com o valor: ${value}.`,
                                err
                            ]);
                            return mongoose.connection.close();
                        }

                        if (clients) {
                            schema_clients.updateOne({
                                id: String(id)
                            }, {
                                status: true
                            }, (err) => {
                                if (err) {
                                    reject([
                                        `Não é possível reativar o cliente com o id(${id}).`,
                                        err
                                    ]);
                                    return mongoose.connection.close();
                                }
                                resolve(
                                    `O cliente com o id(${id}) foi reativado.`
                                );
                                return mongoose.connection.close();
                            });
                        } else {
                            reject(`Clientes com o campo(${field}) com o valor: ${value}. não existem no banco de dados.`);
                            return mongoose.connection.close();
                        }
                    });
                }
            });
        },
        sendResolution: (id, resolution) => { // Posta uma resolução da inatividade do cliente
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
                    schema_clients.find({
                        id: String(id)
                    }, (err, clients) => {
                        if (err) {
                            reject([
                                `Não foi possível encontrar os clientes pelo campo(${field}) com o valor: ${value}.`,
                                err
                            ]);
                            return mongoose.connection.close();
                        }

                        if (clients) {
                            let client = clients[0],
                                inactive = client['inactive'],
                                resolutions = inactive['resolution'],
                                dateEx = require('../dateEx');

                            resolutions.splice(0, 0, {
                                'message': String(resolution),
                                'dateposting': dateEx.now()
                            })

                            inactive['resolution'] = resolutions;

                            schema_clients.updateOne({
                                id: String(id)
                            }, {
                                inactive
                            }, (err) => {
                                if (err) {
                                    reject([
                                        `Não é possível postar a resolução da inatividade do cliente com o id(${id}).`,
                                        err
                                    ]);
                                    return mongoose.connection.close();
                                }
                                resolve(
                                    [
                                        `A resolução da inatividade do cliente com o id(${id}) foi postada.`,
                                        dateEx.now()
                                    ]
                                );
                                return mongoose.connection.close();
                            });
                        } else {
                            reject(`Clientes com o campo(${field}) com o valor: ${value}. não existem no banco de dados.`);
                            return mongoose.connection.close();
                        }
                    });
                }
            });
        },
        removeResolution: (id, resolutionIndexOf) => { // Remove uma resolução da inatividade do cliente
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
                    schema_clients.find({
                        id: String(id)
                    }, (err, clients) => {
                        if (err) {
                            reject([
                                `Não foi possível encontrar os clientes pelo campo(${field}) com o valor: ${value}.`,
                                err
                            ]);
                            return mongoose.connection.close();
                        }

                        if (clients) {
                            let client = clients[0],
                                inactive = client['inactive'],
                                resolutions = inactive['resolution'];

                            resolutions.splice(resolutionIndexOf, 1);

                            inactive['resolution'] = resolutions;

                            schema_clients.updateOne({
                                id: String(id)
                            }, {
                                inactive
                            }, (err) => {
                                if (err) {
                                    reject([
                                        `Não é possível remover a resolução da inatividade do cliente com o indexOf(${resolutionIndexOf}).`,
                                        err
                                    ]);
                                    return mongoose.connection.close();
                                }
                                resolve(
                                    `A resolução da inatividade do cliente com o indexOf${resolutionIndexOf}) foi removida.`
                                );
                                return mongoose.connection.close();
                            });
                        } else {
                            reject(`Clientes com o campo(${field}) com o valor: ${value}. não existem no banco de dados.`);
                            return mongoose.connection.close();
                        }
                    });
                }
            });
        },
        sendClosingdate: (id, closingdate) => { // Defini a data da resolução da inatividade do cliente
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
                    schema_clients.find({
                        id: String(id)
                    }, (err, clients) => {
                        if (err) {
                            reject([
                                `Não foi possível encontrar os clientes pelo campo(${field}) com o valor: ${value}.`,
                                err
                            ]);
                            return mongoose.connection.close();
                        }

                        if (clients) {
                            let client = clients[0],
                                inactive = client['inactive'];

                            inactive['closingdate'] = closingdate;

                            schema_clients.updateOne({
                                id: String(id)
                            }, {
                                inactive
                            }, (err) => {
                                if (err) {
                                    reject([
                                        `Não é possível definir a data de encerramento da inatividade do cliente com o id(${id}).`,
                                        err
                                    ]);
                                    return mongoose.connection.close();
                                }
                                resolve(
                                    `A data de encerramento da inatividade do cliente com o id(${id}) foi definida.`,
                                );
                                return mongoose.connection.close();
                            });
                        } else {
                            reject(`Clientes com o campo(${field}) com o valor: ${value}. não existem no banco de dados.`);
                            return mongoose.connection.close();
                        }
                    });
                }
            });
        },
        get: (field = '', value = '') => { // Busca o cliente de forma customizada
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

                    schema_clients.find(filter, (err, clients) => {
                        if (err) {
                            reject([
                                `Não foi possível encontrar os clientes pelo campo(${field}) com o valor: ${value}.`,
                                err
                            ]);
                            return mongoose.connection.close();
                        }

                        if (clients) {
                            let data = clients.map(client => {
                                return {
                                    id: client['id'],
                                    person: client['person'],
                                    name: client['name'],
                                    costcenter: client['costcenter'],
                                    cpfcnpj: client['cpfcnpj'],
                                    phone: client['phone'],
                                    phone2: client['phone2'],
                                    contact: client['contact'],
                                    email: client['email'],
                                    location: {
                                        street: client['location']['street'],
                                        complement: client['location']['complement'],
                                        number: client['location']['number'],
                                        district: client['location']['district'],
                                        state: client['location']['state'],
                                        city: client['location']['city'],
                                        zipcode: client['location']['zipcode']
                                    },
                                    inactive: {
                                        reason: client['inactive']['reason'],
                                        measure: client['inactive']['measure'],
                                        resolution: (() => {
                                            let resolutions = client['inactive']['resolution'],
                                                LZString = require('lz-string');

                                            let i = 0,
                                                l = resolutions.length;

                                            for (; i < l; i++) {
                                                let message = resolutions[i]['message'];
                                                resolutions[i]['message'] = LZString.decompressFromBase64(message);
                                            }

                                            return resolutions;
                                        })(),
                                        closingdate: client['inactive']['closingdate']
                                    },
                                    status: client['status']
                                }
                            });

                            resolve({
                                message: `Informações dos clientes pelo campo(${field}) com o valor: ${value}. Retornados com sucesso!`,
                                clients: data
                            });
                            return mongoose.connection.close();
                        } else {
                            reject(`Clientes com o campo(${field}) com o valor: ${value}. não existem no banco de dados.`);
                            return mongoose.connection.close();
                        }
                    });
                }
            });
        }
    }
}