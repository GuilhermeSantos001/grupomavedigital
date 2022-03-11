import { Router, Request, Response } from 'express';

const router = Router({
    strict: true,
    caseSensitive: true
});

import { compressToEncodedURIComponent, decompressFromEncodedURIComponent } from 'lz-string';
import { setSessionCookies } from '@/lib/Cookies';
import { cookieOptions } from '@/graphql/index';

import { FilesController } from '@/controllers/FilesController';
import { UploadsController } from '@/controllers/UploadsController';

import APIMiddleware from '@/graphql/middlewares/api-middleware';
import TokenMiddleware from '@/graphql/middlewares/token-middleware';
import getReqProps from '@/utils/getReqProps'

/**
 * @description Baixa todos os arquivos hospedados
 */
router.get(['/uploads/all'], APIMiddleware, TokenMiddleware, async function (req: Request, res: Response) {
    let {
        updatedToken,
    } = getReqProps(req, [
        'updatedToken'
    ]);

    if (updatedToken) {
        updatedToken = JSON.parse(updatedToken);
        await setSessionCookies({
            authorization: updatedToken.authorization,
            token: updatedToken.token,
            signature: updatedToken.signature,
            refreshTokenValue: updatedToken.refreshTokenValue,
            refreshTokenSignature: updatedToken.refreshTokenSignature,
        }, {
            express: {
                req,
                res
            },
            cookieOptions
        })
    }

    try {
        const uploadsController = new UploadsController();
        return res.status(200).send(compressToEncodedURIComponent(JSON.stringify(await uploadsController.getAll())));
    } catch (error) {
        return res.status(400).send({
            success: false,
            data: error
        });
    };
});

/**
 * @description Baixa um arquivo hospedado
 */
router.get(['/uploads/raw/:filename.:ext'], APIMiddleware, TokenMiddleware, async function (req: Request, res: Response) {
    let {
        fileId,
        updatedToken,
    } = getReqProps(req, [
        'fileId',
        'updatedToken'
    ]);

    if (updatedToken) {
        updatedToken = JSON.parse(updatedToken);
        await setSessionCookies({
            authorization: updatedToken.auth,
            token: updatedToken.token,
            signature: updatedToken.signature,
            refreshTokenValue: updatedToken.refreshTokenValue,
            refreshTokenSignature: updatedToken.refreshTokenSignature,
        }, {
            express: {
                req,
                res
            },
            cookieOptions
        })
    }

    if (String(fileId).length <= 0)
        return res.status(400).send({
            success: false,
            data: `The route parameters are not valid.`
        });

    try {
        const uploadsController = new UploadsController();

        await uploadsController.raw(res, fileId);
    } catch (error) {
        return res.status(400).send({
            success: false,
            data: error
        });
    };
});

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

    if (updatedToken) {
        updatedToken = JSON.parse(updatedToken);
        await setSessionCookies({
            authorization: updatedToken.authorization,
            token: updatedToken.token,
            signature: updatedToken.signature,
            refreshTokenValue: updatedToken.refreshTokenValue,
            refreshTokenSignature: updatedToken.refreshTokenSignature,
        }, {
            express: {
                req,
                res
            },
            cookieOptions
        })
    }

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
        const filesController = new FilesController();

        await filesController.read(String(cid), {
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

    if (updatedToken) {
        updatedToken = JSON.parse(updatedToken);
        await setSessionCookies({
            authorization: updatedToken.authorization,
            token: updatedToken.token,
            signature: updatedToken.signature,
            refreshTokenValue: updatedToken.refreshTokenValue,
            refreshTokenSignature: updatedToken.refreshTokenSignature,
        }, {
            express: {
                req,
                res
            },
            cookieOptions
        })
    }

    cid = decompressFromEncodedURIComponent(String(cid));
    versions = decompressFromEncodedURIComponent(String(versions));

    if (String(cid).length <= 0 || String(versions).length <= 0)
        return res.status(400).send({
            success: false,
            data: `The route parameters are not valid.`
        });

    const _versions: any = String(versions).split(',');

    try {
        const filesController = new FilesController();

        await filesController.readCompile(String(cid), {
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