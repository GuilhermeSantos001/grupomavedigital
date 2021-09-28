/**
 * @description Rotas do Hercules Storage
 * @author @GuilhermeSantos001
 * @update 27/08/2021
 * @version 1.3.3
 */

import express, { Request, Response } from 'express';
import { compressToEncodedURIComponent, decompressFromEncodedURIComponent } from 'lz-string';

import { PrivilegesSystem } from '@/mongo/user-manager-mongo';
import { trashDays } from "@/db/files-db";
import FileController from "@/controllers/files";
import FolderController from "@/controllers/folders";
import TokenMiddleware from '@/middlewares/token-middleware';
import JsonWebToken from '@/core/JsonWebToken';
import Privilege from '@/utils/privilege';
import getReqProps from '@/utils/getReqProps';

const router = express.Router({
    strict: true,
    caseSensitive: true
});

/**
 * Menus
 */
import { default as HelpHerculesStorage } from '@/routers/includes/data/help/herculesStorage';

/**
 * @description Pagina de ajuda sobre a proteção de arquivos/pastas
 */
router.get(['/help'], async function (req: Request, res: Response) {
    return res.status(200).render('help', {
        title: 'Grupo Mave Digital',
        router: 'Hercules Storage/Ajuda(?).',
        questions: HelpHerculesStorage,
        menus: [{
            type: 'normal',
            icon: 'help-circle',
            first: true,
            enabled: true,
            title: 'Ajuda/Armazenamento',
            onclick: ""
        },
        {
            type: 'normal',
            icon: 'box',
            first: false,
            enabled: true,
            title: 'Hercules Storage',
            onclick: "hercules_openStorage()"
        },
        {
            type: 'normal',
            icon: 'log-out',
            first: false,
            enabled: true,
            title: 'Sair',
            onclick: "gotoSystem()"
        }]
    })
});


/**
 * @description Escreve uma nova versão para o arquivo
 */
router.post('/version/append', TokenMiddleware, async function (req: Request, res: Response) {
    let {
        cid,
        permission
    } = getReqProps(req, [
        'cid',
        'permission'
    ]);

    if (!cid || !permission)
        return res.status(400).send({
            success: false,
            data: `The route parameters are not valid.`
        });

    permission = JSON.parse(permission);

    let handleError: Array<any> = [],
        responseError: any = undefined,
        versions: any = undefined,
        version: any = undefined,
        interval: any = undefined,
        usr_permission: any = undefined;

    function finish() {
        clearInterval(interval);

        if (responseError) {
            return res.status(400).send({
                success: false,
                data: responseError.error
            });
        } else {
            return res.status(200).send({
                success: true,
                version: {
                    total: versions,
                    actual: version
                }
            });
        };
    };

    req.pipe(req.busboy);

    req.busboy.on('file', async (fieldname: string, file: any, filename: string) => {
        try {
            if (Object.keys(permission).includes('email')) {
                usr_permission = { user: { email: Object.values(permission)[0], permission: "Write" } };
            } else {
                usr_permission = { group: { name: Object.values(permission)[0], permission: "Write" } };
            };

            await FileController.write(cid, usr_permission, file)
                .then(data => {
                    versions = data.versions;
                    version = data.version;
                })
                .catch((error) => responseError = error);

            file.on('error', (error: any) => {
                return handleError.push(error);
            });
        } catch (error) {
            return handleError.push(error);
        }
    });

    req.busboy.on('finish', async () => {
        try {
            if (handleError.length > 0)
                return res.status(400).send({
                    success: false,
                    data: handleError
                });

            interval = setInterval(() => {
                if (
                    responseError ||
                    typeof versions === 'number' && typeof version === 'number'
                )
                    return finish();
            }, 1000);
        } catch (error) {
            return res.status(400).send({
                success: false,
                data: error
            });
        };
    });
});

/**
 * @description Baixa uma versão do arquivo
 */
router.get(['/version/download/:filename.:ext'], TokenMiddleware, async function (req: Request, res: Response) {
    let {
        cid,
        permission,
        version
    } = getReqProps(req, [
        'cid',
        'permission',
        'version'
    ]);

    if (!permission)
        return res.status(400).send({
            success: false,
            data: `The route parameters are not valid.`
        });

    cid = decompressFromEncodedURIComponent(cid);
    permission = JSON.parse(decompressFromEncodedURIComponent(permission) || "");
    version = decompressFromEncodedURIComponent(version);

    if (cid.length <= 0)
        return res.status(400).send({
            success: false,
            data: `The route parameters are not valid.`
        });

    if (version.length <= 0)
        version = undefined;
    else
        version = typeof parseInt(version) !== 'number' ? undefined : parseInt(version);

    let usr_permission: any = undefined;

    try {
        if (Object.keys(permission).includes('email')) {
            usr_permission = { user: { email: Object.values(permission)[0], permission: "Read" } };
        } else {
            usr_permission = { group: { name: Object.values(permission)[0], permission: "Read" } };
        };

        await FileController.read(cid, usr_permission, version, res)
            .catch(() => res.status(400).render('hercules-access-denied', {
                title: 'Hercules Storage - Acesso Negado!',
                message: `Você não tem privilégio para ler o arquivo.`,
                menus: [{
                    type: 'normal',
                    icon: 'x-square',
                    first: false,
                    enabled: true,
                    title: 'Sair',
                    onclick: "windowClose();"
                }]
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
router.get(['/versions/download/:filename'], TokenMiddleware, async function (req: Request, res: Response) {
    let {
        cid,
        permission,
        versions
    } = getReqProps(req, [
        'cid',
        'permission',
        'versions'
    ]);

    if (!permission || !versions)
        return res.status(400).send({
            success: false,
            data: `The route parameters are not valid.`
        });

    cid = decompressFromEncodedURIComponent(cid);
    permission = JSON.parse(decompressFromEncodedURIComponent(permission) || "");
    versions = JSON.parse(decompressFromEncodedURIComponent(versions) || "");

    if (cid.length <= 0 || versions.length <= 0)
        return res.status(400).send({
            success: false,
            data: `The route parameters are not valid.`
        });

    let usr_permission: any = undefined;

    try {
        if (Object.keys(permission).includes('email')) {
            usr_permission = { user: { email: Object.values(permission)[0], permission: "Read" } };
        } else {
            usr_permission = { group: { name: Object.values(permission)[0], permission: "Read" } };
        };

        await FileController.readCompile(cid, usr_permission, versions, res)
            .catch(() => res.status(400).render('hercules-access-denied', {
                title: 'Hercules Storage - Acesso Negado!',
                message: `Você não tem privilégio para ler o arquivo.`,
                menus: [{
                    type: 'normal',
                    icon: 'x-square',
                    first: false,
                    enabled: true,
                    title: 'Sair',
                    onclick: "windowClose();"
                }]
            }));
    } catch (error) {
        return res.status(400).send({
            success: false,
            data: error
        });
    }
});

/**
 * @description Pagina de exibição do conteudo da pasta
 */
router.get(['/folder/:folderName/:folderId'], TokenMiddleware, async function (req: Request, res: Response) {
    let {
        token,
        folderName,
        folderId
    } = getReqProps(req, [
        'token',
        'folderName',
        'folderId'
    ]);

    const
        { privileges } = token,
        files = await FileController.get({ folderId: { $eq: folderId } } /* Filter */, 0 /* Skip */, 100 /* Limit */),
        folders = await FolderController.get({ folderId: { $eq: folderId } } /* Filter */, 0 /* Skip */, 100 /* Limit */),
        extensions = FileController.extensions,
        maxSize = FileController.maxSize,
        privilegesSystem = Privilege.all();

    return res.status(200).render('hercules', {
        title: 'Grupo Mave Digital',
        privileges: Privilege.alias(privileges.reverse()[0]),
        router: `Hercules Storage/Pasta/${folderName}`,
        compressData: compressToEncodedURIComponent(JSON.stringify({
            files: compressToEncodedURIComponent(JSON.stringify(files)),
            folders: compressToEncodedURIComponent(JSON.stringify(folders)),
            folderName: compressToEncodedURIComponent(String(folderName)),
            folderId: compressToEncodedURIComponent(String(folderId)),
            privilegesSystem: compressToEncodedURIComponent(JSON.stringify(privilegesSystem)),
            trashDays: compressToEncodedURIComponent(JSON.stringify(trashDays)),
            extensions: compressToEncodedURIComponent(JSON.stringify(extensions)),
            maxSize: compressToEncodedURIComponent(JSON.stringify(maxSize))
        })),
        menus: [
            {
                type: 'normal',
                icon: 'file-text',
                first: true,
                enabled: true,
                title: 'Conteúdo',
                onclick: ""
            },
            {
                type: 'normal',
                icon: 'folder',
                first: false,
                enabled: true,
                title: 'Armazenamento',
                onclick: "hercules_openStorage(true)"
            },
            {
                type: 'normal',
                icon: 'chevron-left',
                first: false,
                enabled: true,
                title: 'Voltar',
                onclick: 'hercules_openStorage()'
            }]
    })
});

/**
 * @description Pagina principal
 */
router.get(['/'], TokenMiddleware, async function (req: Request, res: Response) {
    let {
        token
    } = getReqProps(req, [
        'token'
    ]);

    const
        { privileges } = token,
        files = await FileController.get({ folderId: { $eq: undefined } } /* Filter */, 0 /* Skip */, 100 /* Limit */),
        folders = await FolderController.get({ folderId: { $eq: undefined } } /* Filter */, 0 /* Skip */, 100 /* Limit */),
        extensions = FileController.extensions,
        maxSize = FileController.maxSize,
        privilegesSystem = Privilege.all();

    return res.status(200).render('hercules', {
        title: 'Grupo Mave Digital',
        privileges: Privilege.alias(privileges.reverse()[0]),
        router: 'Hercules Storage.',
        compressData: compressToEncodedURIComponent(JSON.stringify({
            files: compressToEncodedURIComponent(JSON.stringify(files)),
            folders: compressToEncodedURIComponent(JSON.stringify(folders)),
            folderId: compressToEncodedURIComponent(String('public')),
            privilegesSystem: compressToEncodedURIComponent(JSON.stringify(privilegesSystem)),
            trashDays: compressToEncodedURIComponent(JSON.stringify(trashDays)),
            extensions: compressToEncodedURIComponent(JSON.stringify(extensions)),
            maxSize: compressToEncodedURIComponent(JSON.stringify(maxSize))
        })),
        menus: [
            {
                type: 'normal',
                icon: 'folder',
                first: true,
                enabled: true,
                title: 'Armazenamento',
                onclick: ""
            },
            {
                type: 'normal',
                icon: 'archive',
                first: false,
                enabled: true,
                title: 'Explorador de Pastas',
                onclick: "openFolderTree()"
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

/**
 * @description All *
 */
router.use(['*'], async (req: Request, res: Response) => {
    return res.status(404).render('error', {
        title: 'Grupo Mave Digital',
        path: 'storage/hercules',
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
    app.use('/system/storage/hercules', router);
};