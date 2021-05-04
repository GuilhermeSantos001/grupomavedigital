const express = require('express');
const router = express.Router({
    strict: true,
    caseSensitive: true
});
const middlewareToken = require('../middlewares/token');
const getReqProps = require('../modules/getReqProps');
const hasPrivilege = require('../modules/hasPrivilege');
const mongoDB = require('../modules/mongodb');

router.get(['/users/register'], middlewareToken, async (req, res) => {
    let {
        token
    } = getReqProps(req, [
        'token'
    ]);

    const { privilege } = token['data'];

    if (hasPrivilege.admin(privilege))
        return res.status(200).render('cpanel-users-register', {
            title: 'Grupo Mave Digital',
            privilege: hasPrivilege.alias(privilege.reverse()[0]),
            router: 'Painel de Controle/Usuários/Registrar.',
            path: 'cpanel',
            menus: [
                {
                    type: 'normal',
                    icon: 'user-plus',
                    first: true,
                    enabled: true,
                    title: 'Registrar Usuário',
                    onclick: ""
                },
                {
                    type: 'normal',
                    icon: 'chevron-left',
                    first: false,
                    enabled: true,
                    title: 'Voltar',
                    onclick: 'gotoSystem()'
                }]
        })
    else
        return res.status(400).render('error', {
            title: 'Grupo Mave Digital - Acesso Negado!',
            message: 'Você não tem privilégio para acessar a pagina.',
            path: 'cpanel',
            menus: [{
                type: 'normal',
                icon: 'rotate-ccw',
                first: false,
                enabled: true,
                title: 'Voltar',
                onclick: "gotoSystem()"
            }],
            error: ''
        })
});

/**
 * HOME
 */
router.get(['/'], middlewareToken, async (req, res) => {
    let {
        token
    } = getReqProps(req, [
        'token'
    ]);

    const { privilege } = token['data'];

    if (hasPrivilege.staff(privilege))
        return res.status(200).render('cpanel', {
            title: 'Grupo Mave Digital',
            privilege: hasPrivilege.alias(privilege.reverse()[0]),
            router: 'Painel de Controle.',
            menus: [
                {
                    type: 'normal',
                    icon: 'settings',
                    first: true,
                    enabled: true,
                    title: 'Painel de Controle',
                    onclick: ""
                },
                {
                    type: 'collapse',
                    icon: 'users',
                    first: false,
                    enabled: true,
                    title: 'Usuários',
                    items: [
                        {
                            title: 'Registrar',
                            icon: 'user-plus',
                            enabled: hasPrivilege.admin(privilege),
                            onclick: 'cpanel_users_register()'
                        }
                    ]
                },
                {
                    type: 'collapse',
                    icon: 'credit-card',
                    first: false,
                    enabled: true,
                    title: 'Cartões Digitais',
                    items: [
                        {
                            title: 'Gerenciar',
                            icon: 'layers',
                            enabled: true,
                            onclick: 'cards_control()'
                        }
                    ]
                },
                {
                    type: 'normal',
                    icon: 'chevron-left',
                    first: false,
                    enabled: true,
                    title: 'Voltar',
                    onclick: 'gotoSystem()'
                }]
        })
    else
        return res.status(400).render('error', {
            title: 'Grupo Mave Digital - Acesso Negado!',
            message: 'Você não tem privilégio para acessar a pagina.',
            menus: [{
                type: 'normal',
                icon: 'rotate-ccw',
                first: false,
                enabled: true,
                title: 'Voltar',
                onclick: "gotoSystem()"
            }],
            error: ''
        })
});

router.use(['*'], async (req, res) => {
    return res.status(404).render('error', {
        title: 'Grupo Mave Digital',
        path: 'cpanel',
        menus: [{
            type: 'normal',
            icon: 'rotate-ccw',
            first: false,
            enabled: true,
            title: 'Voltar',
            onclick: "gotoSystem()"
        }],
        message: 'Página não encontrada 404',
        error: null
    });
});

module.exports = (app) => app.use('/system/cpanel', router);