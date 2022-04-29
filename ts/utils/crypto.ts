/**
 * @description Proteção de strings utilizando criptografia
 * @author GuilhermeSantos001
 * @update 17/07/2021
 */

import { createCipheriv, createDecipheriv } from 'crypto';

import RANDOM from '@/utils/random';

declare interface Config {
    algorithm: 'aes-128-gcm' | 'aes-192-gcm' | 'aes-256-gcm';
    password: string;
    authTagLength: number;
}

declare interface Encrypted {
    content: string;
    iv: string;
    tag: Buffer;
}

/**
 * @description Cria uma criptografia para a string
 */
export function Encrypt(txt: string, password?: string): Encrypted {
    const
        config: Config = {
            algorithm: 'aes-256-gcm',
            password: process.env.CRYPTO_PASSWORD || "",
            authTagLength: 16
        },
        iv = RANDOM.STRING(64),
        cipher = createCipheriv(config.algorithm, password || config.password, iv, { authTagLength: config.authTagLength });

    let encrypted = cipher.update(txt, 'utf8', 'hex');

    encrypted += cipher.final('hex');

    const tag = cipher.getAuthTag();

    return {
        content: encrypted,
        iv,
        tag
    };
}

/**
 * @description Gera a descriptografa para a string
 */
export function Decrypt(encrypted: Encrypted, password?: string): string {
    try {
        const config: Config = {
            algorithm: 'aes-256-gcm',
            password: process.env.CRYPTO_PASSWORD || "",
            authTagLength: 16
        },
            iv = encrypted.iv,
            decipher = createDecipheriv(config.algorithm, password || config.password, iv, { authTagLength: config.authTagLength });

        decipher.setAuthTag(encrypted.tag);

        let txt = decipher.update(encrypted.content, 'hex', 'utf8');

        txt += decipher.final('utf8');

        return txt;
    } catch (error) {
        return `Error ${error}`;
    }
}