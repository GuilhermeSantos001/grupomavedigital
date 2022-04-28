/**
 * @description Verifica se o token do usuário está válido
 * @author GuilhermeSantos001
 * @update 03/02/2022
 */
import { Request, Response, NextFunction } from 'express';
import { createHash } from 'crypto';
import { decompressFromBase64 } from 'lz-string';

import { prismaClient } from '@/database/PrismaClient';

import getReqProps from '@/utils/getReqProps';

export default async function asyAPIMiddleware(req: Request, res: Response, next: NextFunction) {
    const { key: authHeader, keypass } = getReqProps(req, ['key', 'keypass']),
        code = createHash('sha256').update(process.env.APP_AUTHORIZATION || "").digest('hex');

    try {
        if (!keypass)
            throw new Error('Keypass is required');

        const apiKey = await prismaClient.aPIKey.findFirst({
            where: {
                passphrase: decompressFromBase64(keypass) || keypass
            }
        });

        if (!apiKey)
            throw new Error('API key not found');

        if (
            apiKey.key === authHeader ||
            apiKey.key === decompressFromBase64(authHeader || "")
        )
            return next();

        return res.status(500).send({
            success: false,
            message: "Your key is invalid"
        })
    } catch {
        if (
            !authHeader ||
            code != authHeader &&
            code != decompressFromBase64(authHeader)
        )
            return res.status(500).send({
                success: false,
                message: "You don't have permission to access this resource"
            })

        return next();
    }
};