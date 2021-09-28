/**
 * @description Verifica se o token do usuário está válido
 * @author @GuilhermeSantos001
 * @update 17/07/2021
 * @version 1.0.1
 */
import { Request, Response, NextFunction } from 'express';
import { compressToEncodedURIComponent } from 'lz-string';
import { createHash } from 'crypto';

import getReqProps from '@/utils/getReqProps';

export default function APIMiddleware(req: Request, res: Response, next: NextFunction) {
    const authHeader = getReqProps(req, ['authorization'])['authorization'],
        code = compressToEncodedURIComponent(createHash('sha256').update(process.env.APP_AUTHORIZATION || "").digest('hex'));

    if (
        !authHeader ||
        code != authHeader
    )
        return res.status(500).send({
            success: false,
            message: "You are not allowed to proceed"
        })

    return next();
};