module.exports = (mongoose, uri, schema_fuel) => {
    return {
        register: ( // Registro do combustível
            id,
            description,
            tank,
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
                    var fuel = new schema_fuel({
                        id: String(id),
                        description: String(description),
                        tank: Number(tank),
                        unitary: Number(unitary),
                        total: Number(total)
                    });
                    fuel.validate((err) => {
                        if (err) {
                            reject([
                                `Não é possível registrar o combustível com o id(${id}).`,
                                err
                            ]);
                            return mongoose.connection.close();
                        }
                        schema_fuel.find({
                            id: String(id)
                        }, (err, list) => {
                            if (err) {
                                reject([
                                    `Não foi possível verificar se o combustível com o id(${id}) já foi registrado.`,
                                    err
                                ]);
                                return mongoose.connection.close();
                            }

                            if (list instanceof Array !== true) list = [];

                            let items = list.filter(item => item.id == id);

                            if (items.length <= 0) {
                                fuel.save(function (err) {
                                    if (err) {
                                        reject([
                                            `Erro na hora de registrar o combustível com o id(${id}).`,
                                            err
                                        ]);
                                        return mongoose.connection.close();
                                    }

                                    resolve(`Combustível com o id(${id}) registrado no banco de dados.`);
                                    return mongoose.connection.close();
                                });
                            } else {
                                reject(`Combustível com o id(${id}) já está registrado no banco de dados.`);
                                return mongoose.connection.close();
                            }
                        });
                    });
                }
            });
        },
        update: (id, data) => { // Atualiza as informações do combustível especifico
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
                    schema_fuel.updateOne({
                        id: String(id)
                    }, {
                        description: String(data['description']),
                        tank: Number(data['tank']),
                        unitary: Number(data['unitary']),
                        total: Number(data['total'])
                    }, (err) => {
                        if (err) {
                            reject([
                                `Não é possível atualizar as informações do combustível com o id(${id}).`,
                                err
                            ]);
                            return mongoose.connection.close();
                        }
                        resolve(
                            `As informações do combustível com o id(${id}), foram atualizadas.`
                        );
                        return mongoose.connection.close();
                    });
                }
            });
        },
        remove: (id) => { // Remove o combustível especifico
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
                    schema_fuel.find({
                        id: String(id)
                    }, (err, fuel) => {
                        if (err) {
                            reject([
                                `Não foi possível encontrar o combustível pelo campo(${field}) com o valor: ${value}.`,
                                err
                            ]);
                            return mongoose.connection.close();
                        }

                        if (fuel) {
                            schema_fuel.remove({
                                id: String(id)
                            }, (err) => {
                                if (err) {
                                    reject([
                                        `Não é possível remover o combustível com o ID(${id}) do banco de dados`,
                                        err
                                    ]);
                                    return mongoose.connection.close();
                                }
                                resolve(
                                    `Combustível com o ID(${id}) removido do banco de dados`
                                );
                                return mongoose.connection.close();
                            });
                        } else {
                            reject(`Combustível com o campo(${field}) com o valor: ${value}. não existe no banco de dados.`);
                            return mongoose.connection.close();
                        }
                    });
                }
            });
        },
        get: (field = '', value = '') => { // Busca o combustível de forma customizada
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

                    schema_fuel.find(filter, (err, fuel) => {
                        if (err) {
                            reject([
                                `Não foi possível encontrar o combustível pelo campo(${field}) com o valor: ${value}.`,
                                err
                            ]);
                            return mongoose.connection.close();
                        }

                        if (fuel) {
                            let data = fuel.map(data => {
                                return {
                                    id: data['id'],
                                    description: data['description'],
                                    tank: data['tank'],
                                    unitary: data['unitary'],
                                    total: data['total']
                                }
                            });

                            resolve({
                                message: `Informações do combustível pelo campo(${field}) com o valor: ${value}. Retornados com sucesso!`,
                                fuel: data
                            });
                            return mongoose.connection.close();
                        } else {
                            reject(`Combustível com o campo(${field}) com o valor: ${value}. não existe no banco de dados.`);
                            return mongoose.connection.close();
                        }
                    });
                }
            });
        }
    }
}