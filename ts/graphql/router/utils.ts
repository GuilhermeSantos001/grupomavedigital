import { Router, Request, Response } from 'express';

const router = Router({
    strict: true,
    caseSensitive: true
});

import APIMiddleware from '@/graphql/middlewares/api-middleware';
import getReqProps from '@/utils/getReqProps';

import { JsonWebToken } from '@/lib/JsonWebToken';
import { UsersManagerDB } from '@/database/UsersManagerDB';
import geoIP, { clearIPAddress } from '@/utils/geoIP';

/**
 * @description Revalidação da sessão do usuário, utilizando o refresh token
 */
router.post('/auth/revalidate', APIMiddleware, async (req: Request, res: Response) => {
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
        ]),
        { ip } = geoIP(req),
        internetadress = ip,
        usersManagerDB = new UsersManagerDB();

    if (!auth || !signature || !refreshTokenValue || !refreshTokenSignature)
        return res.status(200).json({ success: false });

    try {
        await JsonWebToken.verify(token as string);
        await usersManagerDB.verifytoken(auth, token as string, signature, clearIPAddress(String(internetadress).replace('::1', '127.0.0.1')));

        return res.status(200).json({ success: true });
    } catch (error) {
        try {
            await usersManagerDB.verifyRefreshToken(auth, refreshTokenSignature, refreshTokenValue);

            const updateHistory = await usersManagerDB.updateTokenHistory(auth, signature);

            return res.status(200).json({
                success: true,
                auth,
                token:updateHistory[1],
                signature: updateHistory[0],
                refreshTokenValue: refreshTokenValue,
                refreshTokenSignature: refreshTokenSignature,
            });
        } catch {
            return res.status(500).send({
                success: false,
                message: "Invalid Refresh Token. Try again!"
            });
        }
    }
});

router.use(['*'], async (req: Request, res: Response) => {
    return res.status(404).render('error', {
        title: 'Grupo Mave Digital',
        message: 'Página não encontrada 404',
        error: null
    });
});

export default router;