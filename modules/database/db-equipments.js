module.exports = (mongoose, uri, schema_equipments) => {
    return {
        register: ( // Registro do equipamento
            id,
            depreciation,
            segment,
            description,
            quantity,
            investment,
            amortization,
            investmentTotal
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
                    var equipment = new schema_equipments({
                        id: String(id),
                        depreciation: Number(depreciation),
                        segment: String(segment),
                        description: String(description),
                        quantity: Number(quantity),
                        investment: Number(investment),
                        amortization: Number(amortization),
                        investmentTotal: Number(investmentTotal)
                    });
                    equipment.validate((err) => {
                        if (err) {
                            reject([
                                `Não é possível registrar o equipamento com o id(${id}).`,
                                err
                            ]);
                            return mongoose.connection.close();
                        }
                        schema_equipments.find({
                            id: String(id)
                        }, (err, list) => {
                            if (err) {
                                reject([
                                    `Não foi possível verificar se o equipamento com o id(${id}) já foi registrado.`,
                                    err
                                ]);
                                return mongoose.connection.close();
                            }

                            if (list instanceof Array !== true) list = [];

                            let items = list.filter(item => item.id == id);

                            if (items.length <= 0) {
                                equipment.save(function (err) {
                                    if (err) {
                                        reject([
                                            `Erro na hora de registrar o equipamento com o id(${id}).`,
                                            err
                                        ]);
                                        return mongoose.connection.close();
                                    }

                                    resolve(`Equipamento com o id(${id}) registrado no banco de dados.`);
                                    return mongoose.connection.close();
                                });
                            } else {
                                reject(`Equipamento com o id(${id}) já está registrado no banco de dados.`);
                                return mongoose.connection.close();
                            }
                        });
                    });
                }
            });
        },
        update: (id, data) => { // Atualiza as informações do equipamento especifico
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
                    schema_equipments.updateOne({
                        id: String(id)
                    }, {
                        depreciation: Number(data['depreciation']),
                        segment: String(data['segment']),
                        description: String(data['description']),
                        quantity: Number(data['quantity']),
                        investment: Number(data['investment']),
                        amortization: Number(data['amortization']),
                        investmentTotal: Number(data['investmentTotal'])
                    }, (err) => {
                        if (err) {
                            reject([
                                `Não é possível atualizar as informações do equipamento com o id(${id}).`,
                                err
                            ]);
                            return mongoose.connection.close();
                        }
                        resolve(
                            `As informações do equipamento com o id(${id}), foram atualizadas.`
                        );
                        return mongoose.connection.close();
                    });
                }
            });
        },
        remove: (id) => { // Remove o equipamento especifico
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
                    schema_equipments.find({
                        id: String(id)
                    }, (err, equipments) => {
                        if (err) {
                            reject([
                                `Não foi possível encontrar os equipamentos pelo campo(${field}) com o valor: ${value}.`,
                                err
                            ]);
                            return mongoose.connection.close();
                        }

                        if (equipments) {
                            schema_equipments.remove({
                                id: String(id)
                            }, (err) => {
                                if (err) {
                                    reject([
                                        `Não é possível remover o equipamento com o ID(${id}) do banco de dados`,
                                        err
                                    ]);
                                    return mongoose.connection.close();
                                }
                                resolve(
                                    `Equipamento com o ID(${id}) removido do banco de dados`
                                );
                                return mongoose.connection.close();
                            });
                        } else {
                            reject(`Equipamentos com o campo(${field}) com o valor: ${value}. não existem no banco de dados.`);
                            return mongoose.connection.close();
                        }
                    });
                }
            });
        },
        get: (field = '', value = '') => { // Busca o equipamento de forma customizada
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

                    schema_equipments.find(filter, (err, equipments) => {
                        if (err) {
                            reject([
                                `Não foi possível encontrar os serviços pelo campo(${field}) com o valor: ${value}.`,
                                err
                            ]);
                            return mongoose.connection.close();
                        }

                        if (equipments) {
                            let data = equipments.map(equipment => {
                                return {
                                    id: equipment['id'],
                                    depreciation: equipment['depreciation'],
                                    segment: equipment['segment'],
                                    description: equipment['description'],
                                    quantity: equipment['quantity'],
                                    investment: equipment['investment'],
                                    amortization: equipment['amortization'],
                                    investmentTotal: equipment['investmentTotal']
                                }
                            });

                            resolve({
                                message: `Informações dos equipamentos pelo campo(${field}) com o valor: ${value}. Retornados com sucesso!`,
                                equipments: data
                            });
                            return mongoose.connection.close();
                        } else {
                            reject(`Equipamentos com o campo(${field}) com o valor: ${value}. não existem no banco de dados.`);
                            return mongoose.connection.close();
                        }
                    });
                }
            });
        }
    }
}