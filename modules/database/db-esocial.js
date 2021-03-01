module.exports = (mongoose, uri, schema_esocial) => {
    return {
        register: ( // Registro do encargo social
            description,
            percentage
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
                    var esocial = new schema_esocial({
                        description: String(description),
                        percentage: Number(percentage)
                    });
                    esocial.validate((err) => {
                        if (err) {
                            reject([
                                `Não é possível registrar o encargo social com a descrição(${description}).`,
                                err
                            ]);
                            return mongoose.connection.close();
                        }
                        schema_esocial.find({
                            description: String(description)
                        }, (err, list) => {
                            if (err) {
                                reject([
                                    `Não foi possível verificar se o encargo com a descrição(${description}) já foi registrado.`,
                                    err
                                ]);
                                return mongoose.connection.close();
                            }

                            if (list instanceof Array !== true) list = [];

                            let items = list.filter(item => item.description == description);

                            if (items.length <= 0) {
                                esocial.save(function (err) {
                                    if (err) {
                                        reject([
                                            `Erro na hora de registrar o encargo social com a descrição(${description}).`,
                                            err
                                        ]);
                                        return mongoose.connection.close();
                                    }

                                    resolve(`Encargo social com a descrição(${description}) registrado no banco de dados.`);
                                    return mongoose.connection.close();
                                });
                            } else {
                                reject(`Encargo social com a descrição(${description}) já está registrado no banco de dados.`);
                                return mongoose.connection.close();
                            }
                        });
                    });
                }
            });
        },
        update: (description, data) => { // Atualiza as informações do encargo social
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
                    schema_esocial.updateOne({
                        description: String(description)
                    }, {
                        percentage: Number(data['percentage'])
                    }, (err) => {
                        if (err) {
                            reject([
                                `Não é possível atualizar as informações do encargo social com a descrição(${description}).`,
                                err
                            ]);
                            return mongoose.connection.close();
                        }
                        resolve(
                            `As informações do encargo social com a descrição(${description}), foram atualizadas.`
                        );
                        return mongoose.connection.close();
                    });
                }
            });
        },
        remove: (description) => { // Remove o encargo social especifico
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
                    schema_esocial.find({
                        description: String(description)
                    }, (err, esocial) => {
                        if (err) {
                            reject([
                                `Não foi possível encontrar o encargo social pelo campo(${field}) com o valor: ${value}.`,
                                err
                            ]);
                            return mongoose.connection.close();
                        }

                        if (esocial) {
                            schema_esocial.remove({
                                description: String(description)
                            }, (err) => {
                                if (err) {
                                    reject([
                                        `Não é possível remover o encargo social com a descrição(${description}) do banco de dados`,
                                        err
                                    ]);
                                    return mongoose.connection.close();
                                }
                                resolve(
                                    `Encargo social com a descrição(${description}) removido do banco de dados`
                                );
                                return mongoose.connection.close();
                            });
                        } else {
                            reject(`Encargo social com o campo(${field}) com o valor: ${value}. não existem no banco de dados.`);
                            return mongoose.connection.close();
                        }
                    });
                }
            });
        },
        get: (field = '', value = '') => { // Busca o encargo social de forma customizada
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

                    schema_esocial.find(filter, (err, esocial) => {
                        if (err) {
                            reject([
                                `Não foi possível encontrar os encargos sociais pelo campo(${field}) com o valor: ${value}.`,
                                err
                            ]);
                            return mongoose.connection.close();
                        }

                        if (esocial) {
                            let data = esocial.map(data => {
                                return {
                                    id: data['_id'],
                                    description: data['description'],
                                    percentage: data['percentage']
                                }
                            });

                            resolve({
                                message: `Informações dos encargos sociais pelo campo(${field}) com o valor: ${value}. Retornados com sucesso!`,
                                esocial: data
                            });
                            return mongoose.connection.close();
                        } else {
                            reject(`Encargos sociais com o campo(${field}) com o valor: ${value}. não existem no banco de dados.`);
                            return mongoose.connection.close();
                        }
                    });
                }
            });
        }
    }
}