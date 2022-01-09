/**
 * @description Rotas utilitarias do sistema
 * @author GuilhermeSantos001
 * @update 16/12/2021
 */

import { Router, Request, Response } from 'express';

const router = Router({
    strict: true,
    caseSensitive: true
});

import { decompressFromEncodedURIComponent } from 'lz-string';

import APIMiddleware from '@/middlewares/api-middleware';
import TokenMiddleware from '@/middlewares/token-middleware';
import getReqProps from '@/utils/getReqProps';
import Privilege from '@/utils/privilege';

/**
 * @description Baixa uma versão do arquivo
 */
router.get(['/privilege/alias/:privilege'], APIMiddleware, TokenMiddleware, async function (req: Request, res: Response) {
    const {
        privilege,
        updatedToken,
    } = getReqProps(req, [
        'privilege',
        'updatedToken',
    ]);

    const name: any = decompressFromEncodedURIComponent(String(privilege)) || "";

    if (name.length <= 0)
        return res.status(400).send({
            success: false,
            data: `The route parameters are not valid.`
        });

    if (name.length <= 0)
        return res.status(404).send({
            title: 'Grupo Mave Digital',
            message: 'Nenhum privilegio informado.',
            error: null
        });

    return res.status(200).send({ alias: Privilege.alias(name), updatedToken });
});

router.use(['*'], async (req: Request, res: Response) => {
    return res.status(404).render('error', {
        title: 'Grupo Mave Digital',
        message: 'Página não encontrada 404',
        error: null
    });
});

export default router;