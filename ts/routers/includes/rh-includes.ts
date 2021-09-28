/**
 * @description Rotas para os módulos do RH.
 * @author @GuilhermeSantos001
 * @update 17/07/2021
 * @version 1.0.3
 */

import { Router, Request, Response } from 'express';

import Privilege from '@/utils/privilege';
import TokenMiddleware from '@/middlewares/token-middleware';
import getReqProps from '@/utils/getReqProps';

export default function RHRouter(router: Router) {
    router.get(['/rh/appMeuRH'], TokenMiddleware, async (req: Request, res: Response) => {
        let {
            token
        } = getReqProps(req, [
            'token'
        ]);

        const { privileges } = token;

        return res.status(200).render('app-meu-rh', {
            title: 'Grupo Mave Digital',
            router: 'Sistema/Recursos Humanos/APP Meu RH.',
            privileges: Privilege.alias(privileges.reverse()[0]),
            menus: [{
                type: 'normal',
                icon: 'pocket',
                first: true,
                enabled: true,
                title: 'APP Meu RH',
                onclick: ""
            },
            {
                type: 'normal',
                icon: 'image',
                first: false,
                enabled: true,
                title: 'QRCode',
                onclick: "openQRCode()"
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
    });
}