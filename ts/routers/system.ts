/**
 * @description Rotas do sistema
 * @author @GuilhermeSantos001
 * @update 17/07/2021
 * @version 1.0.7
 */

import express, { Request, Response } from 'express';

import getReqProps from '@/utils/getReqProps';
import Privilege from '@/utils/privilege';
import APIMiddleware from '@/middlewares/api-middleware';
import TokenMiddleware from '@/middlewares/token-middleware';

/**
 * INCLUDES *
 */
import FileRouter from '@/routers/includes/files-includes';
import RHRouter from '@/routers/includes/rh-includes';
import ManualsRouter from '@/routers/includes/manuals-includes';
import MaterialsRouter from '@/routers/includes/materials-includes';

const router = express.Router({
    strict: true,
    caseSensitive: true
});

/**
 * FILES
*/
FileRouter(router);

/**
 * RH
 */
RHRouter(router);

/**
 * Manuals
 */
ManualsRouter(router);

/**
 * Materials
 */
MaterialsRouter(router);

/**
 * HOME
 */
router.get(['/'], APIMiddleware, TokenMiddleware, async (req: Request, res: Response) => {
    let {
        decoded
    } = getReqProps(req, [
        'decoded'
    ]);

    const {
        privileges,
        auth,
        email
    } = decoded;

    return res.status(200).send({
        success: true,
        data: {
            privileges,
            auth,
            email
        }
    });
});

router.use(['*'], async (req: Request, res: Response) => {
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
});

export default function Router(app: any): void {
    app.use('/system', router);
}