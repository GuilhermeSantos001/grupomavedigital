/**
 * @description Rotas para os materiais.
 * @author @GuilhermeSantos001
 * @update 17/07/2021
 * @version 1.0.9
 */

import { Router, Request, Response } from 'express';

import Privilege from '@/utils/privilege';
import TokenMiddleware from '@/middlewares/token-middleware';
import getReqProps from '@/utils/getReqProps';

/**
 * Materials
 */
import { default as MaterialGrupoMave } from '@/routers/includes/data/resources/grupomave';
import { default as MaterialSmave } from '@/routers/includes/data/resources/smave';
import { default as MaterialVmave } from '@/routers/includes/data/resources/vmave';
import { default as MaterialVmavePoliciaFederal } from '@/routers/includes/data/resources/vmavepoliciafederal';
import { default as MaterialMaveSystems } from '@/routers/includes/data/resources/mavesystems';
import { default as MaterialMavQuality } from '@/routers/includes/data/resources/mavquality';


export default function MaterialsRouter(router: Router) {
    router.get(['/materials/:id'], TokenMiddleware, async (req: Request, res: Response) => {
        let {
            token,
            id
        } = getReqProps(req, [
            'token',
            'id'
        ]);

        const { privileges } = token;

        let resources = [];
        switch (String(id).replace(/\W/g, '').toLowerCase()) {
            case 'grupomave':
                resources = MaterialGrupoMave;
                break;
            case 'smave':
                resources = MaterialSmave;
                break;
            case 'vmave':
                resources = MaterialVmave;
                break;
            case 'vmavepoliciafederal':
                resources = MaterialVmavePoliciaFederal
                break;
            case 'mavesystems':
                resources = MaterialMaveSystems
                break;
            case 'mavquality':
                resources = MaterialMavQuality;
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

        return res.status(200).render('material', {
            title: 'Grupo Mave Digital',
            router: `Sistema/Materiais/${id}`,
            privileges: Privilege.alias(privileges.reverse()[0]),
            id,
            resources,
            menus: [{
                type: 'normal',
                icon: 'pen-tool',
                first: true,
                enabled: true,
                title: `Material - ${id}`,
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
    });
}