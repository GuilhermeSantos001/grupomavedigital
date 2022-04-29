import { Request, Response, NextFunction } from 'express';

import { JsonWebToken } from '@/lib/JsonWebToken';
import { UsersManagerDB } from '@/database/UsersManagerDB';
import geoIP, { clearIPAddress } from '@/utils/geoIP';

export default async function TokenMiddleware(req: Request, res: Response, next: NextFunction) {
    try {
        const
            cookies = req.cookies,
            auth = cookies['auth'],
            token = cookies['token'],
            signature = cookies['signature'],
            refreshTokenValue = cookies['refreshTokenValue'],
            refreshTokenSignature = cookies['refreshTokenSignature'];

        if (
            !auth ||
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
        } catch (error) {
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
    } catch (error) {
        return res.status(500).send({
            success: false,
            message: "Invalid Refresh Token. Try again!"
        })
    }
};