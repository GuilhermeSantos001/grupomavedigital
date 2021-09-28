/**
 * @description Gerenciador de QRCode para autenticação de duas etapas.
 * @author GuilhermeSantos001
 * @update 17/07/2021
 * @version 1.0.0
 */

import { generateSecret, totp } from 'speakeasy';
import { toDataURL } from 'qrcode';

export interface QRCode {
    secret: string;
    qrcode: string;
};

export function generateQRCode(username: string) {
    return new Promise<QRCode>(async (resolve, reject) => {
        const secret = await generateSecret();

        toDataURL(String(secret.otpauth_url).replace('SecretKey', `Grupo Mave Digital (${username})`), function (err, data_url) {
            if (err)
                return reject(`QRCode Error: ${err}`);

            return resolve({
                secret: secret.base32,
                qrcode: data_url
            });
        });
    });
};

export function verify(tempBase32Secret: string, userToken: string) {
    return new Promise<boolean>(async (resolve, reject) => {
        try {
            if (!await totp.verify({
                secret: tempBase32Secret,
                encoding: 'base32',
                token: userToken
            })) {
                reject(`Código de autenticação de duas etapas está inválido.`);
            } else {
                resolve(true);
            };
        } catch (err) {
            reject(`Two Factor Validation Failed, error: ${err}`);
        };
    });
};