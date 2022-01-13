/**
 * @description Verifica se o token do usuário está válido
 * @author GuilhermeSantos001
 * @update 11/01/2022
 */
import { Request, Response, NextFunction } from 'express';
import { createHash } from 'crypto';
import { decompressFromBase64 } from 'lz-string';

import getReqProps from '@/utils/getReqProps';

export default function APIMiddleware(req: Request, res: Response, next: NextFunction) {
    const authHeader = getReqProps(req, ['key'])['key'],
        code = createHash('sha256').update(process.env.APP_AUTHORIZATION || "").digest('hex');

    if (
        !authHeader ||
        code != decompressFromBase64(authHeader)
    )
        return res.status(500).send({
            success: false,
            message: "You are not allowed to proceed"
        })

    return next();
};