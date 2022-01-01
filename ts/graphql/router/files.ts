/**
 * @description Rotas do Hercules Storage -> Files
 * @author @GuilhermeSantos001
 * @update 16/12/2021
 */

import { Router, Request, Response } from 'express';

const router = Router({
    strict: true,
    caseSensitive: true
});

import APIMiddleware from '@/middlewares/api-middleware';
import TokenMiddleware from '@/middlewares/token-middleware';
import getReqProps from '@/utils/getReqProps';
import FileController from '@/controllers/files';
import { compressToEncodedURIComponent, decompressFromEncodedURIComponent } from 'lz-string';

/**
 * @description Baixa uma versão do arquivo
 */
router.get(['/version/download/:filename.:ext'], APIMiddleware, TokenMiddleware, async function (req: Request, res: Response) {
    let {
        cid,
        version,
        updatedToken,
    } = getReqProps(req, [
        'cid',
        'version',
        'updatedToken'
    ]);

    // TODO: Verificar o funcionamento do retorno do updatedToken por cookie
    // TODO: Para que as solicitações ao express possam retornar o token atualizado

    if (updatedToken)
        res.cookie('updatedToken', compressToEncodedURIComponent(JSON.stringify(updatedToken)));

    cid = decompressFromEncodedURIComponent(String(cid));
    version = decompressFromEncodedURIComponent(String(version));

    if (String(cid).length <= 0)
        return res.status(400).send({
            success: false,
            data: `The route parameters are not valid.`
        });

    if (String(version).length <= 0)
        version = undefined;
    else
        version = typeof parseInt(String(version)) !== 'number' ? undefined : parseInt(String(version));

    try {
        await FileController.read(String(cid), {
            group: {
                name: 'administrador',
                permission: 'Read'
            }
        }, Number(version), res)
            .catch(() => res.status(400).render('hercules-access-denied', {
                title: 'Hercules Storage - Acesso Negado!',
                message: `Você não tem privilégio para ler o arquivo.`
            }));
    } catch (error) {
        return res.status(400).send({
            success: false,
            data: error
        });
    };
});

/**
 * @description Baixa um compilado de versões do arquivo
 */
router.get(['/versions/download/:filename'], APIMiddleware, TokenMiddleware, async function (req: Request, res: Response) {
    let {
        cid,
        versions,
        updatedToken
    } = getReqProps(req, [
        'cid',
        'versions',
        'updatedToken'
    ]);

    if (updatedToken)
        res.cookie('updatedToken', compressToEncodedURIComponent(JSON.stringify(updatedToken)));

    cid = decompressFromEncodedURIComponent(String(cid));
    versions = decompressFromEncodedURIComponent(String(versions));

    if (String(cid).length <= 0 || String(versions).length <= 0)
        return res.status(400).send({
            success: false,
            data: `The route parameters are not valid.`
        });

    const _versions: any = String(versions).split(',');

    try {
        await FileController.readCompile(String(cid), {
            group: {
                name: 'administrador',
                permission: 'Read'
            }
        }, _versions, res)
            .catch(() => res.status(400).render('hercules-access-denied', {
                title: 'Hercules Storage - Acesso Negado!',
                message: `Você não tem privilégio para ler o arquivo.`
            }));
    } catch (error) {
        return res.status(400).send({
            success: false,
            data: error
        });
    }
});

router.use(['*'], async (req: Request, res: Response) => {
    return res.status(404).render('error', {
        title: 'Grupo Mave Digital',
        message: 'Página não encontrada 404',
        error: null
    });
});

export default router;