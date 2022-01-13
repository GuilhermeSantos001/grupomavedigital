/**
 * @description Verifica se o token do usuário está válido
 * @author GuilhermeSantos001
 * @update 13/01/2022
 */
import { Request, Response, NextFunction } from 'express';
import { decompressFromEncodedURIComponent } from 'lz-string';

import JsonWebToken from '@/core/jsonWebToken';
import getReqProps from '@/utils/getReqProps';
import userManagerDB from '@/db/user-db';
import geoIP from '@/utils/geoIP';

export default async function TokenMiddleware(req: Request, res: Response, next: NextFunction) {
    try {
        let
            {
                auth,
                token,
                refreshtoken,
                signature
            } = getReqProps(req, [
                'auth',
                'token',
                'refreshtoken',
                'signature'
            ]);

        auth = decompressFromEncodedURIComponent(String(auth)) || "";
        token = decompressFromEncodedURIComponent(String(token)) || "";
        refreshtoken = JSON.parse(decompressFromEncodedURIComponent(String(refreshtoken)) || "");

        if (
            !auth ||
            !token ||
            !refreshtoken ||
            !signature
        ) {
            return res.status(500).send({
                success: false,
                message: 'The parameters are invalid!'
            });
        }

        const
            { ip } = geoIP(req),
            internetadress = ip;

        try {
            await JsonWebToken.verify(token);
            await userManagerDB.verifytoken(auth, token, signature, internetadress);

            return next();
        } catch {
            if (refreshtoken) {
                await userManagerDB.verifyRefreshToken(auth, refreshtoken.signature, refreshtoken.value);

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
    } catch {
        return res.status(500).send({
            success: false,
            message: "Invalid Refresh Token. Try again!"
        })
    }
};