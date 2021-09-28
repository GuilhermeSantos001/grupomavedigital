/**
 * @description Rotas da Home
 * @author @GuilhermeSantos001
 * @update 17/07/2021
 * @version 1.0.3
 */

import express, { Request, Response } from 'express';

import TokenMiddleware from '@/middlewares/token-middleware';
import Privilege from '@/utils/privilege';
import getReqProps from '@/utils/getReqProps';

const router = express.Router({
    strict: true,
    caseSensitive: true
});

/**
 * @description Retorna a pagina de cadastro de usuário
 */
router.get(['/users/register'], TokenMiddleware, async (req: Request, res: Response) => {
    let {
        token
    } = getReqProps(req, [
        'token'
    ]);

    const { privileges } = token;

    if (Privilege.admin(privileges))
        return res.status(200).render('cpanel-users-register', {
            title: 'Grupo Mave Digital',
            privileges: Privilege.alias(privileges.reverse()[0]),
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
 * @description Retorna a pagina do painel de controle
 */
router.get(['/'], TokenMiddleware, async (req: Request, res: Response) => {
    let {
        token
    } = getReqProps(req, [
        'token'
    ]);

    const { privileges } = token;

    if (Privilege.staff(privileges))
        return res.status(200).render('cpanel', {
            title: 'Grupo Mave Digital',
            privileges: Privilege.alias(privileges.reverse()[0]),
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
                            enabled: Privilege.admin(privileges),
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

/**
 * @description All *
 */
router.use(['*'], async (req: Request, res: Response) => {
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

export default function Router(app: any): void {
    app.use('/system/cpanel', router);
}