/**
 * @description Verifica se o token do usuário está válido
 * @author @GuilhermeSantos001
 * @update 17/07/2021
 * @version 1.0.4
 */
import { Request, Response, NextFunction } from 'express';
import { decompressFromEncodedURIComponent } from 'lz-string';

import JsonWebToken from '@/core/jsonWebToken';
import getReqProps from '@/utils/getReqProps';
import userDB from '@/db/user-db';
import geoIP from '@/utils/geoIP';

export default function TokenMiddleware(req: Request, res: Response, next: NextFunction) {
    let
        token = getReqProps(req, ['token'])['token'];

    if (!token)
        return res.status(500).send({
            success: false,
            message: 'Not found token for session'
        });

    JsonWebToken.verify(token)
        .then(async (decoded: any) => {
            if (!decoded)
                return res.status(500).send({
                    success: false,
                    message: 'Not found token for session'
                });

            try {
                const { ip } = geoIP(req);

                await userDB.verifytoken(decoded['auth'], token, ip);

                req.params['decoded'] = decoded;

                return next();
            } catch (err) {
                return res.status(500).send({
                    success: false,
                    message: "Could not validate token"
                });
            }
        })
        .catch(err => {
            return res.status(500).send({
                success: false,
                message: "Invalid token. Try again!"
            })
        });
};