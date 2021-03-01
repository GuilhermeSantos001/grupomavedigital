module.exports = (mongoose, uri, schema_uniforms) => {
    return {
        register: ( // Registro do uniforme
            id,
            description,
            quantity,
            unitary,
            total,
            monthlycost
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
                    var uniform = new schema_uniforms({
                        id: String(id),
                        description: String(description),
                        quantity: Number(quantity),
                        unitary: Number(unitary),
                        total: Number(total),
                        monthlycost: Number(monthlycost)
                    });
                    uniform.validate((err) => {
                        if (err) {
                            reject([
                                `Não é possível registrar o uniforme com o id(${id}).`,
                                err
                            ]);
                            return mongoose.connection.close();
                        }
                        schema_uniforms.find({
                            id: String(id)
                        }, (err, list) => {
                            if (err) {
                                reject([
                                    `Não foi possível verificar se o uniforme com o id(${id}) já foi registrado.`,
                                    err
                                ]);
                                return mongoose.connection.close();
                            }

                            if (list instanceof Array !== true) list = [];

                            let items = list.filter(item => item.id == id);

                            if (items.length <= 0) {
                                uniform.save(function (err) {
                                    if (err) {
                                        reject([
                                            `Erro na hora de registrar o uniforme com o id(${id}).`,
                                            err
                                        ]);
                                        return mongoose.connection.close();
                                    }

                                    resolve(`Uniforme com o id(${id}) registrado no banco de dados.`);
                                    return mongoose.connection.close();
                                });
                            } else {
                                reject(`Uniforme com o id(${id}) já está registrado no banco de dados.`);
                                return mongoose.connection.close();
                            }
                        });
                    });
                }
            });
        },
        update: (id, data) => { // Atualiza as informações do uniforme especifico
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
                    schema_uniforms.updateOne({
                        id: String(id)
                    }, {
                        description: String(data['description']),
                        quantity: Number(data['quantity']),
                        unitary: Number(data['unitary']),
                        total: Number(data['total']),
                        monthlycost: Number(data['monthlycost'])
                    }, (err) => {
                        if (err) {
                            reject([
                                `Não é possível atualizar as informações do uniforme com o id(${id}).`,
                                err
                            ]);
                            return mongoose.connection.close();
                        }
                        resolve(
                            `As informações do uniforme com o id(${id}), foram atualizadas.`
                        );
                        return mongoose.connection.close();
                    });
                }
            });
        },
        remove: (id) => { // Remove o uniforme especifico
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
                    schema_uniforms.find({
                        id: String(id)
                    }, (err, uniforms) => {
                        if (err) {
                            reject([
                                `Não foi possível encontrar o uniforme pelo campo(${field}) com o valor: ${value}.`,
                                err
                            ]);
                            return mongoose.connection.close();
                        }

                        if (uniforms) {
                            schema_uniforms.remove({
                                id: String(id)
                            }, (err) => {
                                if (err) {
                                    reject([
                                        `Não é possível remover o uniforme com o id(${id}) do banco de dados`,
                                        err
                                    ]);
                                    return mongoose.connection.close();
                                }
                                resolve(
                                    `Uniforme com o id(${id}) removido do banco de dados`
                                );
                                return mongoose.connection.close();
                            });
                        } else {
                            reject(`Uniformes com o campo(${field}) com o valor: ${value}. não existem no banco de dados.`);
                            return mongoose.connection.close();
                        }
                    });
                }
            });
        },
        get: (field = '', value = '') => { // Busca o uniforme de forma customizada
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

                    schema_uniforms.find(filter, (err, uniforms) => {
                        if (err) {
                            reject([
                                `Não foi possível encontrar os uniformes pelo campo(${field}) com o valor: ${value}.`,
                                err
                            ]);
                            return mongoose.connection.close();
                        }

                        if (uniforms) {
                            let data = uniforms.map(uniform => {
                                return {
                                    ref: uniform['_id'],
                                    id: uniform['id'],
                                    description: uniform['description'],
                                    quantity: uniform['quantity'],
                                    unitary: uniform['unitary'],
                                    total: uniform['total'],
                                    monthlycost: uniform['monthlycost']
                                }
                            });

                            resolve({
                                message: `Informações dos uniformes pelo campo(${field}) com o valor: ${value}. Retornados com sucesso!`,
                                uniforms: data
                            });
                            return mongoose.connection.close();
                        } else {
                            reject(`Uniformes com o campo(${field}) com o valor: ${value}. não existem no banco de dados.`);
                            return mongoose.connection.close();
                        }
                    });
                }
            });
        }
    }
}