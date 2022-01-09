/**
 * @description Verifica se o token do usuário está válido
 * @author GuilhermeSantos001
 * @update 16/12/2021
 */
import { Request, Response, NextFunction } from 'express';
import { decompressFromEncodedURIComponent } from 'lz-string';

import JsonWebToken from '@/core/jsonWebToken';
import getReqProps from '@/utils/getReqProps';
import userManagerDB from '@/db/user-db';
import geoIP from '@/utils/geoIP';

export default async function TokenMiddleware(req: Request, res: Response, next: NextFunction) {
    let
        auth = getReqProps(req, ['auth'])['auth'],
        token = getReqProps(req, ['token'])['token'],
        refreshToken = getReqProps(req, ['refreshToken'])['refreshToken'],
        signature = getReqProps(req, ['signature'])['signature'];

    auth = decompressFromEncodedURIComponent(String(auth)) || "";
    token = decompressFromEncodedURIComponent(String(token)) || "";
    refreshToken = JSON.parse(decompressFromEncodedURIComponent(String(refreshToken)) || "");
    signature = decompressFromEncodedURIComponent(String(signature)) || "";

    if (auth.length <= 0 ||
        token.length <= 0 ||
        !refreshToken ||
        signature.length <= 0
    )
        return res.status(500).send({
            success: false,
            message: 'The parameters are invalid!'
        });

    const
        { ip } = geoIP(req),
        internetadress = ip;

    try {
        await JsonWebToken.verify(token);
        await userManagerDB.verifytoken(auth, token, signature, internetadress);

        return next();
    } catch {
        if (refreshToken) {
            await userManagerDB.verifyRefreshToken(auth, refreshToken.signature, refreshToken.value);

            const
                updateHistory = await userManagerDB.updateTokenHistory(auth, token),
                updatedToken: any = {
                    signature: updateHistory[0], token: updateHistory[1]
                };

            req.params['updatedToken'] = updatedToken

            return next();
        }

        return res.status(500).send({
            success: false,
            message: "Invalid token. Try again!"
        })
    }
};