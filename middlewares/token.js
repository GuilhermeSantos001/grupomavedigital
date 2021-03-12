const jwt = require('../modules/jwt');
const getReqProps = require('../modules/getReqProps');
const mongoDB = require('../modules/mongodb');
const LZString = require('lz-string');
const getClientAddress = req => (req.headers['x-forwarded-for'] || '').split(',')[0] || req.connection.remoteAddress;

module.exports = (req, res, next) => {
    const token = getReqProps(req, ['usr_token'])['usr_token'];
    const internetAdress = getReqProps(req, ['usr_internetadress'])['usr_internetadress'];

    let {
        logout
    } = getReqProps(req, [
        'logout',
    ]);

    if (!token) return res.status(401).send({
        success: false,
        error: 'No token code provided!'
    });

    jwt.verify(token)
        .then(async result => {
            if (!result)
                return res.status(401).send({
                    success: false,
                    error: 'Verify your code token.'
                });

            try {
                await mongoDB.users.verifytoken(result['data']['auth'], token, internetAdress, getClientAddress(req))

                req.params['token'] = result;

                return next();
            } catch (err) {
                if (err['code'] === 1) {
                    return res.status(500).render('tokenBlocked', {
                        title: 'Grupo Mave Digital',
                        message: 'Você não pode utilizar uma sessão que foi finalizada anteriormente.',
                        menus: [{
                            type: 'normal',
                            icon: 'power',
                            first: false,
                            enabled: true,
                            title: 'Efetuar Login',
                            onclick: "login()"
                        }]
                    })
                } else if (err['code'] === 2) {
                    return res.status(500).render('tokenBlocked', {
                        title: 'Grupo Mave Digital',
                        message: 'Você não pode utilizar uma sessão que está em outro endereço de internet.',
                        menus: [{
                            type: 'normal',
                            icon: 'power',
                            first: false,
                            enabled: true,
                            title: 'Efetuar Login',
                            onclick: "login()"
                        }]
                    })
                } else if (err['code'] === 3) {
                    return res.status(500).render('tokenBlocked', {
                        title: 'Grupo Mave Digital',
                        message: 'Você não pode utilizar uma sessão que está em outro endereço de IP.',
                        menus: [{
                            type: 'normal',
                            icon: 'power',
                            first: false,
                            enabled: true,
                            title: 'Efetuar Login',
                            onclick: "login()"
                        }]
                    })
                }
            }
        })
        .catch(err => {
            if (logout) {
                return res.status(200).send({
                    message: 'Grupo Mave Digital - Success!!!',
                    data: null
                })
            } else {
                return res.status(500).render('sessionExpired', {
                    title: 'Grupo Mave Digital',
                    message: 'Sua sessão expirou, por gentileza faça o login novamente!',
                    menus: [{
                        type: 'normal',
                        icon: 'power',
                        first: false,
                        enabled: true,
                        title: 'Efetuar Login',
                        onclick: "expired()"
                    }]
                })
            }
        });
};