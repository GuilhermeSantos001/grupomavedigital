/**
 * @description Rotas para upload/download de arquivos
 * @author @GuilhermeSantos001
 * @update 17/07/2021
 * @version 1.0.4
 */

import { Router, Response } from 'express';
import * as fse from 'fs-extra';

import Random from '@/utils/random';
import TokenMiddleware from '@/middlewares/token-middleware';
import getReqProps from '@/utils/getReqProps';
import { localPath } from '@/utils/localpath';

export default function FileRouter(router: Router) {
    router.post('/upload/file', TokenMiddleware, async (req: any, res: Response) => {
        let {
            custompath
        } = getReqProps(req, [
            'custompath'
        ]);

        let handleError: Array<any> = [],
            filename_hash: string[] = [];

        req.pipe(req.busboy);

        req.busboy.on('file', (fieldname: string, file: any, filename: string) => {
            try {
                let
                    chunks: Array<any> = [],
                    filenameHash = Random.HASH(fieldname.length + filename.length, 'hex') + filename.substr(filename.lastIndexOf('.'));

                filename_hash.push(filenameHash);

                const filepath = typeof custompath === 'string' ? `public/${custompath}/${filenameHash}` : `public/uploads/${filenameHash}`;

                const FStream = fse.createWriteStream(localPath(filepath));

                file.on('data', (chunk: any) => chunks.push(chunk));

                file.on('error', (error: any) => {
                    return handleError.push(error);
                });

                file.on('end', () => {
                    FStream.write(Buffer.concat(chunks), error => {
                        if (error) {
                            return handleError.push(error);
                        }

                        FStream.end();
                    });
                });
            } catch (error) {
                return handleError.push(error);
            }
        });

        req.busboy.on('finish', () => {
            if (handleError.length > 0)
                return res.status(400).send({
                    success: false,
                    data: handleError
                });

            res.status(200).send({
                success: true,
                files: filename_hash
            });
        });
    });
}