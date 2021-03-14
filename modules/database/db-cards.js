module.exports = (mongoose, uri, schema_cards) => {
    return {
        register: ( // Registro dos Cartões Digitais
            id,
            version,
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
                        version: String(version),
                        photo: {
                            path: String(photo['path']),
                            name: String(photo['name']),
                        },
                        name: String(name),
                        jobtitle: String(jobtitle),
                        phones,
                        whatsapp: {
                            phone: whatsapp['phone'],
                            text: whatsapp['text'],
                            message: whatsapp['message'],
                        },
                        vcard: {
                            firstname: String(vcard['firstname']),
                            lastname: String(vcard['lastname']),
                            organization: String(vcard['organization']),
                            photo: {
                                path: String(vcard['photo']['path']),
                                name: String(vcard['photo']['name']),
                            },
                            logo: {
                                path: String(vcard['logo']['path']),
                                name: String(vcard['logo']['name']),
                            },
                            workPhone: vcard['workPhone'],
                            birthday: {
                                year: Number(vcard['birthday']['year']),
                                month: Number(vcard['birthday']['month']),
                                day: Number(vcard['birthday']['day']),
                            },
                            title: String(vcard['title']),
                            url: String(vcard['url']),
                            workUrl: String(vcard['workUrl']),
                            email: String(vcard['email']),
                            label: String(vcard['label']),
                            street: String(vcard['street']),
                            city: String(vcard['city']),
                            stateProvince: String(vcard['stateProvince']),
                            postalCode: String(vcard['postalCode']),
                            countryRegion: String(vcard['countryRegion']),
                            socialUrls: vcard['socialUrls'],
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
        update: (
            id,
            version,
            photo,
            name,
            jobtitle,
            phones,
            whatsapp,
            vcard,
            footer
        ) => { // Atualiza as informações do cartão especificado
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
                        id: String(id)
                    }, {
                        version: String(version),
                        photo: {
                            path: String(photo['path']),
                            name: String(photo['name']),
                        },
                        name: String(name),
                        jobtitle: String(jobtitle),
                        phones,
                        whatsapp: {
                            phone: whatsapp['phone'],
                            text: whatsapp['text'],
                            message: whatsapp['message'],
                        },
                        vcard: {
                            firstname: String(vcard['firstname']),
                            lastname: String(vcard['lastname']),
                            organization: String(vcard['organization']),
                            photo: {
                                path: String(vcard['photo']['path']),
                                name: String(vcard['photo']['name']),
                            },
                            logo: {
                                path: String(vcard['logo']['path']),
                                name: String(vcard['logo']['name']),
                            },
                            workPhone: vcard['workPhone'],
                            birthday: {
                                year: Number(vcard['birthday']['year']),
                                month: Number(vcard['birthday']['month']),
                                day: Number(vcard['birthday']['day']),
                            },
                            title: String(vcard['title']),
                            url: String(vcard['url']),
                            workUrl: String(vcard['workUrl']),
                            email: String(vcard['email']),
                            label: String(vcard['label']),
                            street: String(vcard['street']),
                            city: String(vcard['city']),
                            stateProvince: String(vcard['stateProvince']),
                            postalCode: String(vcard['postalCode']),
                            countryRegion: String(vcard['countryRegion']),
                            socialUrls: vcard['socialUrls'],
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
                    }, (err) => {
                        if (err) {
                            reject([
                                `Não é possível atualizar as informações do cartão digital com o id(${id}).`,
                                err
                            ]);
                            return mongoose.connection.close();
                        }
                        resolve(
                            `As informações do cartão digital com o id(${id}), foram atualizadas.`
                        );
                        return mongoose.connection.close();
                    });
                }
            });
        },
        remove: (id) => { // Remove o cartão digital especifico
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
                        id: String(id)
                    }, (err, cards) => {
                        if (err) {
                            reject([
                                `Não foi possível encontrar o cartão digital pelo campo(${field}) com o valor: ${value}.`,
                                err
                            ]);
                            return mongoose.connection.close();
                        }

                        if (cards) {
                            schema_cards.deleteOne({
                                id: String(id)
                            }, (err) => {
                                if (err) {
                                    reject([
                                        `Não é possível remover o cartão digital com o id(${id}) do banco de dados`,
                                        err
                                    ]);
                                    return mongoose.connection.close();
                                }
                                resolve(
                                    `Cartão Digital com o id(${id}) removido do banco de dados`
                                );
                                return mongoose.connection.close();
                            });
                        } else {
                            reject(`Cartão Digital com o campo(${field}) com o valor: ${value}. não existem no banco de dados.`);
                            return mongoose.connection.close();
                        }
                    });
                }
            });
        },
        get: (field = '', value = '', limit = 10) => { // Busca o cartão de forma customizada
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

                    schema_cards.find(filter)
                        .limit(limit)
                        .exec((err, cards) => {
                            if (err) {
                                reject([
                                    `Não foi possível encontrar o cartão digital pelo campo(${field}) com o valor: ${value}.`,
                                    err
                                ]);
                                return mongoose.connection.close();
                            }

                            if (cards) {
                                let data = cards.map(card => {
                                    return {
                                        _index: card['_id'],
                                        id: card['id'],
                                        version: card['version'],
                                        photo: card['photo'],
                                        name: card['name'],
                                        jobtitle: card['jobtitle'],
                                        phones: card['phones'],
                                        whatsapp: card['whatsapp'],
                                        vcard: card['vcard'],
                                        footer: card['footer']
                                    }
                                });

                                resolve({
                                    message: `Informações dos cartões digitais pelo campo(${field}) com o valor: ${value}. Retornados com sucesso!`,
                                    cards: data
                                });
                                return mongoose.connection.close();
                            } else {
                                reject(`Cartões Digitais com o campo(${field}) com o valor: ${value}. não existem no banco de dados.`);
                                return mongoose.connection.close();
                            }
                        })
                }
            });
        }
    }
}