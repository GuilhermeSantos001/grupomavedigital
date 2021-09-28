/**
 * @description Rotas para os manuais.
 * @author @GuilhermeSantos001
 * @update 17/07/2021
 * @version 1.0.5
 */

import { Router, Request, Response } from 'express';

import Privilege from '@/utils/privilege';
import TokenMiddleware from '@/middlewares/token-middleware';
import getReqProps from '@/utils/getReqProps';

/**
 * Menus
 */
import { default as MenuHelpDesk } from '@/routers/includes/data/menus/helpdesk';
import { default as MenuMonday } from '@/routers/includes/data/menus/monday';

export default function ManualsRouter(router: Router) {
    router.get(['/manuals/:id'], TokenMiddleware, async (req: Request, res: Response) => {
        let {
            token,
            id
        } = getReqProps(req, [
            'token',
            'id'
        ]);

        const { privileges } = token;

        let menus = [];

        switch (String(id).toLowerCase()) {
            case 'helpdesk':
                menus = MenuHelpDesk;
                break;
            case 'monday':
                menus = MenuMonday;
                break;
            default:
                return res.status(404).render('error', {
                    title: 'Grupo Mave Digital',
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
        }

        id = String(id).toUpperCase();

        return res.status(200).render('manual', {
            title: 'Grupo Mave Digital',
            router: `Sistema/Manuais/${id}.`,
            privileges: Privilege.alias(privileges.reverse()[0]),
            id,
            menus
        })
    });
}