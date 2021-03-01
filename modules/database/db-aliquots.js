module.exports = (mongoose, uri, schema_aliquots) => {
    return {
        register: ( // Registro da Alíquota
            percentage,
            city,
            code,
            state
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
                    var aliquots = new schema_aliquots({
                        city: String(city),
                        code: Number(code),
                        percentage: Number(percentage),
                        state: String(state)
                    });
                    aliquots.validate((err) => {
                        if (err) {
                            reject([
                                `Não é possível registrar a aliquota para a cidade(${city}).`,
                                err
                            ]);
                            return mongoose.connection.close();
                        }
                        schema_aliquots.find({
                            city: String(city),
                            code: Number(code),
                            percentage: Number(percentage),
                            state: String(state)
                        }, (err, list) => {
                            if (err) {
                                reject([
                                    `Não foi possível verificar se a aliquota para a cidade(${city}) com o código(${code}) já foi registrada.`,
                                    err
                                ]);
                                return mongoose.connection.close();
                            }

                            if (list instanceof Array !== true) list = [];

                            let items = list.filter(item => item.city == city);

                            if (items.length <= 0) {
                                aliquots.save(function (err) {
                                    if (err) {
                                        reject([
                                            `Erro na hora de registrar a aliquota para a cidade(${city}) com o código(${code}) no percentual de ${percentage * 0.01}%.`,
                                            err
                                        ]);
                                        return mongoose.connection.close();
                                    }

                                    resolve(`Aliquota para a cidade(${city}) com o código(${code}) no percentual de ${percentage * 0.01}%, registrada no banco de dados.`);
                                    return mongoose.connection.close();
                                });
                            } else {
                                reject(`Aliquota para a cidade(${city}) com o código(${code}) no percentual de ${percentage * 0.01}%, já está registrada no banco de dados.`);
                                return mongoose.connection.close();
                            }
                        });
                    });
                }
            });
        },
        update: (state, city, code, prevpercentage, data) => { // Atualiza as informações da alíquota especifica
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
                    schema_aliquots.updateOne({
                        city: String(city),
                        code: Number(code),
                        percentage: Number(prevpercentage),
                        state: String(state)
                    }, {
                        percentage: Number(data['percentage'])
                    }, (err) => {
                        if (err) {
                            reject([
                                `Não é possível atualizar as informações da alíquota para a cidade(${city}) com o código(${code}) no percentual de ${prevpercentage * 0.01}%.`,
                                err
                            ]);
                            return mongoose.connection.close();
                        }
                        resolve(
                            `As informações da alíquota para a cidade(${city}) com o código(${code}) no percentual de ${prevpercentage * 0.01}%, foram atualizadas.`
                        );
                        return mongoose.connection.close();
                    });
                }
            });
        },
        remove: (percentage, city, code, state) => { // Remove a alíquota especifica
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
                    schema_aliquots.find({
                        city: String(city),
                        code: Number(code),
                        percentage: Number(percentage),
                        state: String(state)
                    }, (err, aliquots) => {
                        if (err) {
                            reject([
                                `Não foi possível encontrar a alíquota pelo campo(${field}) com o valor: ${value}.`,
                                err
                            ]);
                            return mongoose.connection.close();
                        }

                        if (aliquots) {
                            schema_aliquots.remove({
                                city: String(city),
                                code: Number(code),
                                percentage: Number(percentage),
                                state: String(state)
                            }, (err) => {
                                if (err) {
                                    reject([
                                        `Não é possível remover a alíquota para a cidade(${city}) com o código(${code}) no percentual de ${percentage * 0.01}% do banco de dados`,
                                        err
                                    ]);
                                    return mongoose.connection.close();
                                }
                                resolve(
                                    `Alíquota para a cidade(${city}) com o código(${code}) no percentual de ${percentage * 0.01}% removida do banco de dados`
                                );
                                return mongoose.connection.close();
                            });
                        } else {
                            reject(`Alíquotas com o campo(${field}) com o valor: ${value}. não existem no banco de dados.`);
                            return mongoose.connection.close();
                        }
                    });
                }
            });
        },
        get: (field = '', value = '') => { // Busca a alíquota de forma customizada
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

                    schema_aliquots.find(filter, (err, aliquots) => {
                        if (err) {
                            reject([
                                `Não foi possível encontrar as aliquotas pelo campo(${field}) com o valor: ${value}.`,
                                err
                            ]);
                            return mongoose.connection.close();
                        }

                        if (aliquots) {
                            let data = aliquots.map(aliquot => {
                                return {
                                    id: aliquot['_id'],
                                    city: aliquot['city'],
                                    code: aliquot['code'],
                                    percentage: aliquot['percentage'],
                                    state: aliquot['state']
                                }
                            });

                            resolve({
                                message: `Informações das aliquotas pelo campo(${field}) com o valor: ${value}. Retornados com sucesso!`,
                                aliquots: data
                            });
                            return mongoose.connection.close();
                        } else {
                            reject(`Aliquotas com o campo(${field}) com o valor: ${value}. não existem no banco de dados.`);
                            return mongoose.connection.close();
                        }
                    });
                }
            });
        }
    }
}