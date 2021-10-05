/**
 * @description Gerenciador de QRCode para autenticação de duas etapas.
 * @author GuilhermeSantos001
 * @update 29/09/2021
 */

import { generateSecret, verifyToken } from 'node-2fa';
import { toDataURL } from 'qrcode';

export interface QRCode {
    secret: string;
    qrcode: string;
}

export function generateQRCode(username: string): Promise<QRCode> {
    return new Promise(async (resolve, reject) => {
        const newSecret = await generateSecret({
            name: "Grupo Mave Digital",
            account: username
        });

        toDataURL(String(newSecret.uri), function (err, data_url) {
            if (err)
                return reject(`QRCode Error: ${err}`);

            return resolve({
                secret: newSecret.secret,
                qrcode: data_url
            });
        });
    });
}

export function verify(tempBase32Secret: string, userToken: string): Promise<boolean> {
    return new Promise(async (resolve, reject) => {
        try {
            if (!verifyToken(tempBase32Secret, userToken)) {
                reject(`Código de autenticação de duas etapas está inválido.`);
            } else {
                resolve(true);
            }
        } catch (err) {
            reject(`Two Factor Validation Failed, error: ${err}`);
        }
    });
}