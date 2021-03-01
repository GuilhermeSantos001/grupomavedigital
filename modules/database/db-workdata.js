module.exports = (mongoose, uri, schema_workdata) => {
    return {
        register: ( // Registro do dado trabalhista
            id,
            jobtitle,
            scale,
            salary,
            time,
            dayswork,
            overtime,
            accumulation,
            additionalnight,
            gratification,
            dangerousness,
            insalubrity,
            dsr,
            uniforms
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
                    var workdata = new schema_workdata({
                        id: String(id),
                        jobtitle: String(jobtitle),
                        scale: String(scale),
                        salary: Number(salary),
                        time: Object(time),
                        dayswork: Number(dayswork),
                        overtime: Object(overtime),
                        accumulation: Object(accumulation),
                        additionalnight: Object(additionalnight),
                        gratification: Object(gratification),
                        dangerousness: Object(dangerousness),
                        insalubrity: Object(insalubrity),
                        dsr: Object(dsr),
                        uniforms: []
                    });
                    workdata.validate((err) => {
                        if (err) {
                            reject([
                                `Não é possível registrar o dado trabalhista com o id(${id}).`,
                                err
                            ]);
                            return mongoose.connection.close();
                        }
                        schema_workdata.find({
                            id: String(id)
                        }, (err, list) => {
                            if (err) {
                                reject([
                                    `Não foi possível verificar se o dado trabalhista com o id(${id}) já foi registrado.`,
                                    err
                                ]);
                                return mongoose.connection.close();
                            }

                            if (list instanceof Array !== true) list = [];

                            let items = list.filter(item => item.id == id);

                            if (items.length <= 0) {
                                uniforms.map(ref => {
                                    workdata.uniforms.push(ref);
                                });

                                workdata.save(function (err) {
                                    if (err) {
                                        reject([
                                            `Erro na hora de registrar o dado trabalhista com o id(${id}).`,
                                            err
                                        ]);
                                        return mongoose.connection.close();
                                    }

                                    resolve(`Dado trabalhista com o id(${id}) registrado no banco de dados.`);
                                    return mongoose.connection.close();
                                });
                            } else {
                                reject(`Dado trabalhista com o id(${id}) já está registrado no banco de dados.`);
                                return mongoose.connection.close();
                            }
                        });
                    });
                }
            });
        },
        update: (id, data) => { // Atualiza as informações do dado trabalhista
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
                    schema_workdata.updateOne({
                        id: String(id)
                    }, {
                        jobtitle: String(data['jobtitle']),
                        scale: String(data['scale']),
                        salary: Number(data['salary']),
                        time: Object(data['time']),
                        dayswork: Number(data['dayswork']),
                        additionalnight: Object(data['additionalnight']),
                        gratification: Object(data['gratification'])
                    }, async (err) => {
                        if (err) {
                            reject([
                                `Não é possível atualizar as informações do dado trabalhista com o id(${id}).`,
                                err
                            ]);
                            return mongoose.connection.close();
                        }

                        const workdata = await schema_workdata.find({
                            id: String(id)
                        });

                        workdata[0].uniforms = [];

                        await data['uniforms'].map(ref => {
                            workdata[0].uniforms.push(ref);
                        })

                        if (data['uniforms'].length > 0)
                            workdata[0].save(function (err) {
                                if (err) {
                                    reject([
                                        `Erro na hora de salvar os uniformes do dado trabalhista com o id(${id}).`,
                                        err
                                    ]);
                                    return mongoose.connection.close();
                                }

                                resolve(`As informações do dado trabalhista com o id(${id}), foram atualizados.`);
                                return mongoose.connection.close();
                            });
                        else {
                            resolve(
                                `As informações do dado trabalhista com o id(${id}), foram atualizados.`
                            );
                            return mongoose.connection.close();
                        }
                    });
                }
            });
        },
        remove: (id) => { // Remove o dado trabalhista
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
                    schema_workdata.find({
                        id: String(id)
                    }, (err, workdata) => {
                        if (err) {
                            reject([
                                `Não foi possível encontrar o dado trabalhista pelo campo(${field}) com o valor: ${value}.`,
                                err
                            ]);
                            return mongoose.connection.close();
                        }

                        if (workdata) {
                            schema_workdata.remove({
                                id: String(id)
                            }, (err) => {
                                if (err) {
                                    reject([
                                        `Não é possível remover o dado trabalhista com o id(${id}) do banco de dados`,
                                        err
                                    ]);
                                    return mongoose.connection.close();
                                }
                                resolve(
                                    `Dado trabalhista com o id(${id}) removido do banco de dados`
                                );
                                return mongoose.connection.close();
                            });
                        } else {
                            reject(`Dado trabalhista com o campo(${field}) com o valor: ${value}. não existem no banco de dados.`);
                            return mongoose.connection.close();
                        }
                    });
                }
            });
        },
        get: (field = '', value = '') => { // Busca o dado trabalhista de forma customizada
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

                    schema_workdata.find(filter, (err, workdata) => {
                        if (err) {
                            reject([
                                `Não foi possível encontrar os dados trabalhistas pelo campo(${field}) com o valor: ${value}.`,
                                err
                            ]);
                            return mongoose.connection.close();
                        }

                        if (workdata) {
                            let data = workdata.map(data => {
                                return {
                                    id: data['id'],
                                    jobtitle: data['jobtitle'],
                                    scale: data['scale'],
                                    salary: data['salary'],
                                    time: data['time'],
                                    dayswork: data['dayswork'],
                                    overtime: data['overtime'],
                                    additionalnight: data['additionalnight'],
                                    gratification: data['gratification'],
                                    dangerousness: data['dangerousness'],
                                    insalubrity: data['insalubrity'],
                                    uniforms: data['uniforms'],
                                    uniformsId: data['uniformsId']
                                }
                            });

                            resolve({
                                message: `Informações dos dados trabalhistas pelo campo(${field}) com o valor: ${value}. Retornados com sucesso!`,
                                workdata: data
                            });
                            return mongoose.connection.close();
                        } else {
                            reject(`Dados trabalhistas com o campo(${field}) com o valor: ${value}. não existem no banco de dados.`);
                            return mongoose.connection.close();
                        }
                    });
                }
            });
        },
        getUniforms: (field = '', value = '') => { // Busca os uniformes do dado trabalhista de forma customizada
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

                    schema_workdata.
                    find(filter).
                    populate('uniforms').
                    exec(function (err, workdata) {
                        if (err) {
                            reject([
                                `Não foi possível encontrar os uniformes do dado trabalhistas pelo campo(${field}) com o valor: ${value}.`,
                                err
                            ]);
                            return mongoose.connection.close();
                        }

                        if (workdata) {
                            let data = workdata[0]['uniforms'].map(uniform => {
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
                                message: `Informações dos uniformes do dado trabalhistas pelo campo(${field}) com o valor: ${value}. Retornados com sucesso!`,
                                uniforms: data
                            });
                            return mongoose.connection.close();
                        } else {
                            reject(`Dados dos uniformes do dado trabalhistas com o campo(${field}) com o valor: ${value}. não existem no banco de dados.`);
                            return mongoose.connection.close();
                        }
                    });
                }
            });
        }
    }
}