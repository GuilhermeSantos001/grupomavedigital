module.exports = (mongoose, uri, schema_activities) => {
    return {
        register: (
            id,
            created,
            ipremote,
            auth,
            privilege,
            roadmap
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
                    var activity = new schema_activities({
                        id: String(id),
                        created: String(created),
                        ipremote: String(ipremote),
                        auth: String(auth),
                        privilege,
                        roadmap: String(roadmap)
                    });
                    activity.validate((err) => {
                        if (err) {
                            reject([
                                `Não é possível registrar a atividade com o id(${id}).`,
                                err
                            ]);
                            return mongoose.connection.close();
                        }
                        schema_activities.find({
                            id: String(id)
                        }, (err, list) => {
                            if (err) {
                                reject([
                                    `Não foi possível verificar se a atividade com o id(${id}) já foi registrada.`,
                                    err
                                ]);
                                return mongoose.connection.close();
                            }

                            if (list instanceof Array !== true) list = [];

                            let items = list.filter(item => item.id == id);

                            if (items.length <= 0) {
                                activity.save(function (err) {
                                    if (err) {
                                        reject([
                                            `Erro na hora de registrar a atividade com o id(${id}).`,
                                            err
                                        ]);
                                        return mongoose.connection.close();
                                    }

                                    resolve(`Atividade com o id(${id}) registrada no banco de dados.`);
                                    return mongoose.connection.close();
                                });
                            } else {
                                reject(`Atividade com o id(${id}) já está registrada no banco de dados.`);
                                return mongoose.connection.close();
                            }
                        });
                    });
                }
            });
        },
        get: (field = '', value = '', limit = 10) => {
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

                    schema_activities.find(filter)
                        .limit(limit)
                        .exec((err, activities) => {
                            if (err) {
                                reject([
                                    `Não foi possível encontrar a atividade pelo campo(${field}) com o valor: ${value}.`,
                                    err
                                ]);
                                return mongoose.connection.close();
                            }

                            if (activities) {
                                let data = activities.map(activity => {
                                    return {
                                        id: activity['id'],
                                        ipremote: activity['ipremote'],
                                        auth: activity['auth'],
                                        privilege: activity['privilege'],
                                        roadmap: activity['roadmap'],
                                        created: activity['created']
                                    }
                                });

                                resolve({
                                    message: `Informações das atividades pelo campo(${field}) com o valor: ${typeof value === 'object' ? JSON.stringify(value) : value}. Retornadas com sucesso!`,
                                    activities: data
                                });
                                return mongoose.connection.close();
                            } else {
                                reject(`Atividades com o campo(${field}) com o valor: ${typeof value === 'object' ? JSON.stringify(value) : value}. não existem no banco de dados.`);
                                return mongoose.connection.close();
                            }
                        })
                }
            });
        }
    }
}