module.exports = (mongoose, uri, schema_benefits) => {
    return {
        register: ( // Registro do beneficio
            description,
            quantity,
            value,
            total
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
                    var benefit = new schema_benefits({
                        description: String(description),
                        quantity: Number(quantity),
                        value: Number(value),
                        total: Number(total)
                    });
                    benefit.validate((err) => {
                        if (err) {
                            reject([
                                `Não é possível registrar o beneficio com a descrição(${description}).`,
                                err
                            ]);
                            return mongoose.connection.close();
                        }
                        schema_benefits.find({
                            description: String(description)
                        }, (err, list) => {
                            if (err) {
                                reject([
                                    `Não foi possível verificar se o beneficio com a descrição(${description}) já foi registrado.`,
                                    err
                                ]);
                                return mongoose.connection.close();
                            }

                            if (list instanceof Array !== true) list = [];

                            let items = list.filter(item => item.description == description);

                            if (items.length <= 0) {
                                benefit.save(function (err) {
                                    if (err) {
                                        reject([
                                            `Erro na hora de registrar o beneficio com a descrição(${description}).`,
                                            err
                                        ]);
                                        return mongoose.connection.close();
                                    }

                                    resolve(`Beneficio com a descrição(${description}) registrado no banco de dados.`);
                                    return mongoose.connection.close();
                                });
                            } else {
                                reject(`Beneficio com a descrição(${description}) já está registrado no banco de dados.`);
                                return mongoose.connection.close();
                            }
                        });
                    });
                }
            });
        },
        update: (description, data) => { // Atualiza as informações do beneficio
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
                    schema_benefits.updateOne({
                        description: String(description)
                    }, {
                        quantity: Number(data['quantity']),
                        value: Number(data['value']),
                        total: Number(data['total'])
                    }, (err) => {
                        if (err) {
                            reject([
                                `Não é possível atualizar as informações do beneficio com a descrição(${description}).`,
                                err
                            ]);
                            return mongoose.connection.close();
                        }
                        resolve(
                            `As informações do beneficio com a descrição(${description}), foram atualizadas.`
                        );
                        return mongoose.connection.close();
                    });
                }
            });
        },
        remove: (description) => { // Remove o beneficio especifico
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
                    schema_benefits.find({
                        description: String(description)
                    }, (err, benefits) => {
                        if (err) {
                            reject([
                                `Não foi possível encontrar o beneficio pelo campo(${field}) com o valor: ${value}.`,
                                err
                            ]);
                            return mongoose.connection.close();
                        }

                        if (benefits) {
                            schema_benefits.remove({
                                description: String(description)
                            }, (err) => {
                                if (err) {
                                    reject([
                                        `Não é possível remover o beneficio com a descrição(${description}) do banco de dados`,
                                        err
                                    ]);
                                    return mongoose.connection.close();
                                }
                                resolve(
                                    `Beneficio com a descrição(${description}) removido do banco de dados`
                                );
                                return mongoose.connection.close();
                            });
                        } else {
                            reject(`Beneficio com o campo(${field}) com o valor: ${value}. não existem no banco de dados.`);
                            return mongoose.connection.close();
                        }
                    });
                }
            });
        },
        get: (field = '', value = '') => { // Busca o beneficio de forma customizada
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

                    schema_benefits.find(filter, (err, benefits) => {
                        if (err) {
                            reject([
                                `Não foi possível encontrar os benefícios pelo campo(${field}) com o valor: ${value}.`,
                                err
                            ]);
                            return mongoose.connection.close();
                        }

                        if (benefits) {
                            let data = benefits.map(data => {
                                return {
                                    id: data['_id'],
                                    description: data['description'],
                                    quantity: data['quantity'],
                                    value: data['value'],
                                    total: data['total']
                                }
                            });

                            resolve({
                                message: `Informações dos benefícios pelo campo(${field}) com o valor: ${value}. Retornados com sucesso!`,
                                benefits: data
                            });
                            return mongoose.connection.close();
                        } else {
                            reject(`Benefícios com o campo(${field}) com o valor: ${value}. não existem no banco de dados.`);
                            return mongoose.connection.close();
                        }
                    });
                }
            });
        }
    }
}