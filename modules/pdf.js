const pdf = require("pdf-creator-node"),
    fs = require('fs'),
    path = require('./localPath');

module.exports = {
    termo_confidencialidade: (src, data = {}) => {
        let html = fs.readFileSync(path.localPath('html/termo-de-confidencialidade.html'), 'utf8'),
            options = {
                format: "A3",
                orientation: "portrait",
                border: "10mm",
                header: {
                    contents: '<div style="text-align: center;"><img src="file:///C:\\Users\\guilherme\\Documents\\MaveBank\\html\\timbrado-cima.png" class="img-wluid" alt="Responsive image" style="height: 2cm;"></div>'
                },
                footer: {
                    contents: '<div style="text-align: center;"><img src="file:///C:\\Users\\guilherme\\Documents\\MaveBank\\html\\timbrado-baixo.png" class="img-wluid" alt="Responsive image" style="height: 2cm;"></div>'
                }
            };

        let document = {
            html: html,
            data: {
                name: data.name,
                street: data.street,
                number: data.number,
                district: data.district,
                state: data.state,
                city: data.city,
                zipcode: data.zipcode,
                cnpj: data.cnpj,
                day: data.day,
                month: data.month,
                year: data.year
            },
            path: path.localPath(`public/docs/${src}.pdf`)
        };

        return new Promise((resolve, reject) => {
            pdf.create(document, options)
                .then(res => {
                    return resolve(res);
                })
                .catch(error => {
                    return reject(error);
                });
        })
    },
    contrato_de_parceria: (src, data = {}) => {
        let html = fs.readFileSync(path.localPath('html/contrato-de-parceria.html'), 'utf8'),
            options = {
                format: "A3",
                orientation: "portrait",
                border: "10mm",
                header: {
                    "contents": '<div style="text-align: center;"><img src="file:///C:\\Users\\guilherme\\Documents\\MaveBank\\html\\timbrado-cima.png" class="img-wluid" alt="Responsive image" style="height: 2cm;"></div>'
                },
                footer: {
                    "contents": '<div style="text-align: center;"><img src="file:///C:\\Users\\guilherme\\Documents\\MaveBank\\html\\timbrado-baixo.png" class="img-wluid" alt="Responsive image" style="height: 2cm;"></div>'
                }
            };

        let document = {
            html: html,
            data: {
                name: data.name,
                street: data.street,
                number: data.number,
                district: data.district,
                state: data.state,
                city: data.city,
                zipcode: data.zipcode,
                cnpj: data.cnpj,
                day: data.day,
                month: data.month,
                year: data.year,
                valor: data.valor,
                clientes: data.clientes
            },
            path: path.localPath(`public/docs/${src}.pdf`)
        };

        return new Promise((resolve, reject) => {
            pdf.create(document, options)
                .then(res => {
                    return resolve(res);
                })
                .catch(error => {
                    return reject(error);
                });
        })
    },
    budget: (src, data = {}) => {
        let html = fs.readFileSync(path.localPath('html/orçamento.html'), 'utf8'),
            options = {
                format: "A3",
                orientation: "landscape",
                border: "10mm",
                header: {
                    contents: '<div style="text-align: center;"><img src="file:///C:\\Users\\guilherme\\Documents\\MaveBank\\html\\timbrado-cima.png" class="img-wluid" alt="Responsive image" style="height: 2cm;"></div>'
                },
                footer: {
                    contents: '<div style="text-align: center;"><img src="file:///C:\\Users\\guilherme\\Documents\\MaveBank\\html\\timbrado-baixo.png" class="img-wluid" alt="Responsive image" style="height: 2cm;"></div>'
                }
            };

        let document = {
            html: html,
            data: {
                budgetDesc: data['budgetDesc'],
                budgetID: data['budgetID'],
                datenow: data['datenow'],
                clientname: data['clientname'],
                chargetotal: data['chargetotal'],
                technicalreserve: data['technicalreserve'],
                indirect: data['indirect'],
                lair: data['lair'],
                iss: data['iss'],
                piscofins: data['piscofins'],
                ir: data['ir'],
                csll: data['csll'],
                totalcost: data['totalcost'],
                taxes: data['taxes'],
                indirectcost: data['indirectcost'],
                profit: data['profit'],
                salevalue: data['salevalue'],
                workdata: data['workdata'],
                benefits: data['benefits'],
                uniforms: data['uniforms'],
                equipments: data['equipments'],
                totals: data['totals']
            },
            path: path.localPath(`public/docs/${src}.pdf`)
        };

        return new Promise((resolve, reject) => {
            pdf.create(document, options)
                .then(res => {
                    return resolve(res);
                })
                .catch(error => {
                    return reject(error);
                });
        })
    }
}