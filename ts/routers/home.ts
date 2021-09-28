/**
 * @description Rotas da Home
 * @author @GuilhermeSantos001
 * @update 17/07/2021
 * @version 1.0.2
 */

import express, { Request, Response } from 'express';

import { statSync, createReadStream, existsSync } from 'fs';

import { localPath } from '@/utils/localpath';
import geoIP from '@/utils/geoIP';

const router = express.Router({
    strict: true,
    caseSensitive: true
});

/**
 * @description Retorna as informações de localização da rota.
 */
router.get(['/ipinfo'], async (req: Request, res: Response) => {
    return res.status(200).send(geoIP(req));
});

/**
 * @description Método de stream 1
 */
router.get(['/stream1'], function (req: Request, res: Response) {
    let { range } = req.headers;

    if (!range) range = "";

    const
        videoPath = localPath('public/assets/teste.mp4'),
        videoSize = statSync(videoPath).size,
        CHUNK_SIZE = 10000,
        start = Number(range.replace(/\D/g, "")),
        end = Math.min(start + CHUNK_SIZE, videoSize - 1);

    if (range) {
        const headers = {
            "Content-Range": `bytes ${start}-${end}/${videoSize}`,
            "Accept-Ranges": "bytes",
            "Content-Type": "video/mp4"
        };

        res.writeHead(206, headers);

        return createReadStream(videoPath, { start, end }).pipe(res);
    } else {
        const headers = {
            'Content-Length': videoSize,
            'Content-Type': 'video/mp4'
        };

        res.writeHead(200, headers);

        return createReadStream(videoPath).pipe(res);
    }
});

/**
 * @description Método de stream 2
 */
router.get('/stream2', function (req: Request, res: Response) {
    const
        filePath = localPath('public/assets/Reis da Revoada.mp3'),
        stat = statSync(filePath),
        total = stat.size;

    if (req.headers.range) {
        let
            range = req.headers.range,
            parts = range.replace(/bytes=/, "").split("-"),
            partialstart = parts[0],
            partialend = parts[1],
            start = parseInt(partialstart, 10),
            end = partialend ? parseInt(partialend, 10) : total - 1,
            chunksize = (end - start) + 1,
            readStream = createReadStream(filePath, { start: start, end: end });

        const headers = {
            'Content-Range': 'bytes ' + start + '-' + end + '/' + total,
            'Accept-Ranges': 'bytes', 'Content-Length': chunksize,
            'Content-Type': 'audio/mpeg'
        };

        res.writeHead(206, headers);

        return readStream.pipe(res);
    } else {
        const headers = {
            'Content-Length': total,
            'Content-Type': 'audio/mpeg'
        };

        res.writeHead(200, headers);

        return createReadStream(filePath).pipe(res);
    }
});

/**
 * @description Retorna os videos
 * @server HTTP Live Streaming
 */
router.get('/videos/*', function (req: Request, res: Response) {
    const file = localPath('public\\assets\\hls\\videos' + '\\' + (req.url.replace('/videos/', "")));

    if (!existsSync(file))
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
            message: `Vídeo(${file}) não encontrado!`,
            error: null
        });

    return createReadStream(file).pipe(res);
});

/**
 * @description Retorna as legendas
 * @server HTTP Live Streaming
 */
router.get('/captions/*', function (req: Request, res: Response) {
    const file = localPath('public\\assets\\hls\\captions' + '\\' + (req.url.replace('/captions/', "")));

    if (!existsSync(file))
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
            message: `Legenda(${file}) não encontrada!`,
            error: null
        });

    return createReadStream(file).pipe(res);
});

/**
 * @description Retorna as miniaturas dos videos
 * @server HTTP Live Streaming
 */
router.get('/thumbs/*', function (req: Request, res: Response) {
    const file = localPath('public\\assets\\hls\\thumbs' + '\\' + (req.url.replace('/thumbs/', "")));

    if (!existsSync(file))
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
            message: `Miniatura(${file}) não encontrada!`,
            error: null
        });

    return createReadStream(file).pipe(res);
});

/**
 * @description All *
 */
router.use(['*'], async (req: Request, res: Response) => {
    return res.render('index', {
        title: 'Grupo Mave Digital',
        menus: [{
            type: 'normal',
            icon: 'home',
            first: true,
            enabled: true,
            title: 'Home',
            onclick: ""
        },
        {
            type: 'normal',
            icon: 'power',
            first: false,
            enabled: true,
            title: 'Acessar',
            onclick: "gotoSystem()"
        },
        {
            type: 'normal',
            icon: 'credit-card',
            first: false,
            enabled: true,
            title: 'Cartões Digitais',
            onclick: "cards()"
        },
        {
            type: 'normal',
            icon: 'sliders',
            first: false,
            enabled: true,
            title: 'Preferências',
            onclick: "openCanvasPreferences()"
        },
        {
            type: 'collapse',
            icon: 'help-circle',
            first: false,
            enabled: true,
            title: 'Precisa de Ajuda?',
            items: [
                {
                    title: 'HelpDesk/TI (GLPI)',
                    icon: 'tool',
                    enabled: true,
                    onclick: 'helpdesk()'
                }
            ]
        }]
    });
});

export default function Router(app: any): void {
    app.use('/', router);
}