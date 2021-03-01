module.exports = (mongoose, uri, schema_states) => {
    return {
        register: ( // Registro do estado no banco de dados
            name,
            cities
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
                    var state = new schema_states({
                        name: String(name),
                        cities: Array(cities)
                    });
                    state.validate((err) => {
                        if (err) {
                            reject([
                                `Não é possível registrar o estado com o nome(${name}).`,
                                err
                            ]);
                            return mongoose.connection.close();
                        }
                        schema_states.find({
                            name: String(name)
                        }, (err, list) => {
                            if (err) {
                                reject([
                                    `Não foi possível verificar se o estado com o nome(${name}) já foi registrado.`,
                                    err
                                ]);
                                return mongoose.connection.close();
                            }

                            if (list instanceof Array !== true) list = [];

                            let items = list.filter(item => item.name == name);

                            if (items.length <= 0) {
                                state.save(function (err) {
                                    if (err) {
                                        reject([
                                            `Erro na hora de registrar o estado com o nome(${name}).`,
                                            err
                                        ]);
                                        return mongoose.connection.close();
                                    }

                                    resolve({
                                        message: `Estado com o nome(${name}) registrado no banco de dados.`,
                                        state: {
                                            name: state['name'],
                                            cities: state['cities'],
                                            country: state['country']
                                        }
                                    });
                                    return mongoose.connection.close();
                                });
                            } else {
                                reject(`Estado com o nome(${name}) já está registrado no banco de dados.`);
                                return mongoose.connection.close();
                            }
                        });
                    });
                }
            });
        },
        get: (field = '', value = '', dataFilters = []) => { // Busca o estado de forma customizada
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

                    schema_states.find(filter, (err, states) => {
                        if (err) {
                            reject([
                                `Não foi possível encontrar os estados pelo campo(${field}) com o valor: ${value}.`,
                                err
                            ]);
                            return mongoose.connection.close();
                        }

                        if (states) {
                            let data = [];

                            if (dataFilters.includes("states") && dataFilters.includes("cities")) {
                                data = {};

                                data.cities = {};
                                data.states = [];

                                states.map(state => {
                                    state['cities'].map(names => {
                                        if (data.cities[state['name']] === undefined) data.cities[state['name']] = [];
                                        names.map(name => data.cities[state['name']].push(name))
                                    })
                                    data.states.push(state['name'])
                                })
                            } else {
                                data = states.map(state => {
                                    return {
                                        name: state['name'],
                                        cities: state['cities'],
                                        country: state['country']
                                    };
                                })
                            }

                            resolve({
                                message: `Informações dos estados pelo campo(${field}) com o valor: ${value}. Retornadas com sucesso!`,
                                data
                            });
                            return mongoose.connection.close();
                        } else {
                            reject(`Estados com o campo(${field}) com o valor: ${value}. não existe no banco de dados.`);
                            return mongoose.connection.close();
                        }
                    });
                }
            });
        }
    }
}