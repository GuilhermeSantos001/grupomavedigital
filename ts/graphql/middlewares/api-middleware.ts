/**
 * @description Verifica se o token do usuário está válido
 * @author GuilhermeSantos001
 * @update 05/11/2021
 */
import { Request, Response, NextFunction } from 'express';
import { createHash } from 'crypto';

import getReqProps from '@/utils/getReqProps';

export default function APIMiddleware(req: Request, res: Response, next: NextFunction) {
    const authHeader = getReqProps(req, ['auth'])['auth'],
        code = createHash('sha256').update(process.env.APP_AUTHORIZATION || "").digest('hex');

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