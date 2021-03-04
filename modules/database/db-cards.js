module.exports = (mongoose, uri, schema_cards) => {
    return {
        register: ( // Registro dos Cartões Digitais
            id,
            photo,
            name,
            jobtitle,
            phones,
            whatsapp,
            vcard,
            footer
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
                    var cards = new schema_cards({
                        id: String(id),
                        photo: String(photo),
                        name: String(name),
                        jobtitle: String(jobtitle),
                        phones: [phones[0], phones[1]],
                        whatsapp: String(whatsapp),
                        vcard: {
                            firstname: String(vcard['firstname']),
                            lastname: String(vcard['lastname']),
                            organization: String(vcard['organization']),
                            photo: {
                                path: String(vcard['photo']['path']),
                                file: String(vcard['photo']['file']),
                            },
                            logo: {
                                path: String(vcard['logo']['path']),
                                file: String(vcard['logo']['file']),
                            },
                            workPhone,
                            birthday: {
                                year: Number(vcard['birthday']['year']),
                                month: Number(vcard['birthday']['month']),
                                day: Number(vcard['birthday']['day']),
                            },
                            title: String(vcard['title']),
                            url: String(vcard['url']),
                            workUrl: String(vcard['workUrl']),
                            workEmail: String(vcard['workEmail']),
                            workAddress: {
                                label: String(vcard['workAddress']['label']),
                                street: String(vcard['workAddress']['street']),
                                city: String(vcard['workAddress']['city']),
                                stateProvince: String(vcard['workAddress']['stateProvince']),
                                postalCode: String(vcard['workAddress']['postalCode']),
                                countryRegion: String(vcard['workAddress']['countryRegion']),
                            },
                            socialUrls,
                            file: {
                                name: String(vcard['file']['name']),
                                path: String(vcard['file']['path']),
                            }
                        },
                        footer: {
                            email: String(footer['email']),
                            location: String(footer['location']),
                            website: String(footer['website']),
                            attachment: String(footer['attachment']),
                            socialmedia: footer['socialmedia'],
                        }
                    });
                    cards.validate((err) => {
                        if (err) {
                            reject([
                                `Não é possível registrar o cartão digital com o código(${id}).`,
                                err
                            ]);
                            return mongoose.connection.close();
                        }
                        schema_cards.find({
                            id: String(id)
                        }, (err, list) => {
                            if (err) {
                                reject([
                                    `Não foi possível verificar se o cartão digital com o código(${id}) já foi registrado.`,
                                    err
                                ]);
                                return mongoose.connection.close();
                            }

                            if (list instanceof Array !== true) list = [];

                            let items = list.filter(item => item.id == id);

                            if (items.length <= 0) {
                                cards.save(function (err) {
                                    if (err) {
                                        reject([
                                            `Erro na hora de registrar o cartão digital com o código(${id}).`,
                                            err
                                        ]);
                                        return mongoose.connection.close();
                                    }

                                    resolve(`Cartão Digital com o código(${id}), registrado no banco de dados.`);
                                    return mongoose.connection.close();
                                });
                            } else {
                                reject(`Cartão Digital com o código(${id}), já está registrado no banco de dados.`);
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
                    schema_cards.updateOne({
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
                    schema_cards.find({
                        city: String(city),
                        code: Number(code),
                        percentage: Number(percentage),
                        state: String(state)
                    }, (err, cards) => {
                        if (err) {
                            reject([
                                `Não foi possível encontrar a alíquota pelo campo(${field}) com o valor: ${value}.`,
                                err
                            ]);
                            return mongoose.connection.close();
                        }

                        if (cards) {
                            schema_cards.remove({
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

                    schema_cards.find(filter, (err, cards) => {
                        if (err) {
                            reject([
                                `Não foi possível encontrar as aliquotas pelo campo(${field}) com o valor: ${value}.`,
                                err
                            ]);
                            return mongoose.connection.close();
                        }

                        if (cards) {
                            let data = cards.map(aliquot => {
                                return {
                                    id: aliquot['_id'],
                                    city: aliquot['city'],
                                    code: aliquot['code'],
                                    percentage: aliquot['percentage'],
                                    state: aliquot['state']
                                }
                            });

                            resolve({
                                message: `Informações dos aliquotas pelo campo(${field}) com o valor: ${value}. Retornados com sucesso!`,
                                cards: data
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