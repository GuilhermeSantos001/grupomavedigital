import { Request, Response, NextFunction } from 'express';
import { decompressFromEncodedURIComponent } from 'lz-string';

import { JsonWebToken } from '@/lib/JsonWebToken';
import { UsersManagerDB } from '@/database/UsersManagerDB';
import geoIP, { clearIPAddress } from '@/utils/geoIP';
import getReqProps from '@/utils/getReqProps';

export default async function TokenMiddleware(req: Request, res: Response, next: NextFunction) {
    try {
        let
            {
                auth,
                token,
                signature,
                refreshTokenValue,
                refreshTokenSignature,
            } = getReqProps(req, [
                'auth',
                'token',
                'signature',
                'refreshTokenValue',
                'refreshTokenSignature',
            ]);

        auth = decompressFromEncodedURIComponent(String(auth)) || "";
        token = decompressFromEncodedURIComponent(String(token)) || "";
        signature = decompressFromEncodedURIComponent(String(signature)) || "";
        refreshTokenValue = decompressFromEncodedURIComponent(String(refreshTokenValue)) || "";
        refreshTokenSignature = decompressFromEncodedURIComponent(String(refreshTokenSignature)) || "";

        if (
            !auth ||
            !token ||
            !signature ||
            !refreshTokenValue ||
            !refreshTokenSignature
        ) {
            return res.status(500).send({
                success: false,
                message: 'The parameters are invalid!'
            });
        }

        const
            userManagerDB = new UsersManagerDB(),
            { ip } = geoIP(req),
            internetadress = ip;

        try {
            await JsonWebToken.verify(token);
            await userManagerDB.verifytoken(auth, token, signature, clearIPAddress(String(internetadress).replace('::1', '127.0.0.1')));

            return next();
        } catch {
            await userManagerDB.verifyRefreshToken(auth, refreshTokenSignature, refreshTokenValue);

            const updateHistory = await userManagerDB.updateTokenHistory(auth, token);

            req.params['updatedToken'] = JSON.stringify({
                auth,
                token: updateHistory[1],
                signature: updateHistory[0],
                refreshTokenValue,
                refreshTokenSignature,
            });

            return next();
        }
    } catch {
        return res.status(500).send({
            success: false,
            message: "Invalid Refresh Token. Try again!"
        })
    }
};