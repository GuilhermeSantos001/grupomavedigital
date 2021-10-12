/**
 * @description Gerenciador de QRCode para autenticação de duas etapas.
 * @author GuilhermeSantos001
 * @update 12/10/2021
 */

import { generateSecret, verifyToken } from 'node-2fa';
import { toDataURL } from 'qrcode';

export interface QRCode {
    secret: string;
    qrcode: string;
}

export async function generateQRCode(username: string): Promise<QRCode> {
    const newSecret = await generateSecret({
        name: "Grupo Mave Digital",
        account: username
    });

    return new Promise((resolve, reject) => {
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

export async function verify(tempBase32Secret: string, userToken: string): Promise<boolean> {
    try {
        if (!verifyToken(tempBase32Secret, userToken)) {
            throw new Error(`Código de autenticação de duas etapas está inválido.`);
        } else {
            return true;
        }
    } catch (err) {
        throw new Error(`Two Factor Validation Failed, error: ${err}`);
    }
}