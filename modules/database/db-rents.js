module.exports = (mongoose, uri, schema_rents) => {
    return {
        register: ( // Registro da alocação
            id,
            description,
            quantity,
            unitary,
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
                    var rents = new schema_rents({
                        id: String(id),
                        description: String(description),
                        quantity: Number(quantity),
                        unitary: Number(unitary),
                        total: Number(total)
                    });
                    rents.validate((err) => {
                        if (err) {
                            reject([
                                `Não é possível registrar a alocação com o id(${id}).`,
                                err
                            ]);
                            return mongoose.connection.close();
                        }
                        schema_rents.find({
                            id: String(id)
                        }, (err, list) => {
                            if (err) {
                                reject([
                                    `Não foi possível verificar se a alocação com o id(${id}) já foi registrada.`,
                                    err
                                ]);
                                return mongoose.connection.close();
                            }

                            if (list instanceof Array !== true) list = [];

                            let items = list.filter(item => item.id == id);

                            if (items.length <= 0) {
                                rents.save(function (err) {
                                    if (err) {
                                        reject([
                                            `Erro na hora de registrar a alocação com o id(${id}).`,
                                            err
                                        ]);
                                        return mongoose.connection.close();
                                    }

                                    resolve(`Alocação com o id(${id}) registrada no banco de dados.`);
                                    return mongoose.connection.close();
                                });
                            } else {
                                reject(`Alocação com o id(${id}) já está registrada no banco de dados.`);
                                return mongoose.connection.close();
                            }
                        });
                    });
                }
            });
        },
        update: (id, data) => { // Atualiza as informações da alocação especifica
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
                    schema_rents.updateOne({
                        id: String(id)
                    }, {
                        description: String(data['description']),
                        quantity: Number(data['quantity']),
                        unitary: Number(data['unitary']),
                        total: Number(data['total'])
                    }, (err) => {
                        if (err) {
                            reject([
                                `Não é possível atualizar as informações da alocação com o id(${id}).`,
                                err
                            ]);
                            return mongoose.connection.close();
                        }
                        resolve(
                            `As informações da alocação com o id(${id}), foram atualizadas.`
                        );
                        return mongoose.connection.close();
                    });
                }
            });
        },
        remove: (id) => { // Remove a alocação especifica
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
                    schema_rents.find({
                        id: String(id)
                    }, (err, rents) => {
                        if (err) {
                            reject([
                                `Não foi possível encontrar as alocações pelo campo(${field}) com o valor: ${value}.`,
                                err
                            ]);
                            return mongoose.connection.close();
                        }

                        if (rents) {
                            schema_rents.remove({
                                id: String(id)
                            }, (err) => {
                                if (err) {
                                    reject([
                                        `Não é possível remover a alocação com o ID(${id}) do banco de dados`,
                                        err
                                    ]);
                                    return mongoose.connection.close();
                                }
                                resolve(
                                    `Alocação com o ID(${id}) removida do banco de dados`
                                );
                                return mongoose.connection.close();
                            });
                        } else {
                            reject(`Alocações com o campo(${field}) com o valor: ${value}. não existem no banco de dados.`);
                            return mongoose.connection.close();
                        }
                    });
                }
            });
        },
        get: (field = '', value = '') => { // Busca a alocação de forma customizada
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

                    schema_rents.find(filter, (err, rents) => {
                        if (err) {
                            reject([
                                `Não foi possível encontrar as alocações pelo campo(${field}) com o valor: ${value}.`,
                                err
                            ]);
                            return mongoose.connection.close();
                        }

                        if (rents) {
                            let data = rents.map(rental => {
                                return {
                                    id: rental['id'],
                                    description: rental['description'],
                                    quantity: rental['quantity'],
                                    unitary: rental['unitary'],
                                    total: rental['total']
                                }
                            });

                            resolve({
                                message: `Informações das alocações pelo campo(${field}) com o valor: ${value}. Retornados com sucesso!`,
                                rents: data
                            });
                            return mongoose.connection.close();
                        } else {
                            reject(`Alocações com o campo(${field}) com o valor: ${value}. não existem no banco de dados.`);
                            return mongoose.connection.close();
                        }
                    });
                }
            });
        }
    }
}