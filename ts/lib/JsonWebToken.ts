/**
 * @description Controle dos JSON Web Tokens
 * @author GuilhermeSantos001
 * @update 01/03/2022
 */

import { sign, verify, Secret } from 'jsonwebtoken';
import { nanoid } from 'nanoid';
import { SignJWT } from 'jose';
import { compressToUint8Array } from 'lz-string';

import { RedisClient } from '@/lib/RedisClient';

declare type Options = { expiresIn: string | '3m' | '10m' | '1h' | '7d' };

export interface Token {
    payload: any;
    secret?: Secret;
    options: Options;
}

export class JsonWebToken {
    static readonly db: number = 2;

    static flush(): Promise<void> {
        return new Promise(async (resolve, reject) => {
            try {
                const Redis = new RedisClient(JsonWebToken.db);

                await Redis.flush();

                resolve();
            } catch (error) {
                reject(error);
            }
        })
    }

    static isCancelled(token: string): Promise<boolean> {
        return new Promise<boolean>(async (resolve, reject) => {
            try {
                const Redis = new RedisClient(JsonWebToken.db);

                const value = await Redis.get(`token_cancelled_${token}`);

                if (typeof value === 'string' && value === token) {
                    return resolve(true);
                }

                resolve(false);
            } catch (error) {
                reject(error);
            }
        });
    }

    static sign(token: Token): Promise<string> {
        return new Promise(async (resolve, reject) => {
            return sign(token.payload, token.secret || process.env.APP_SECRET || "", token.options, (err, encoded) => {
                if (err)
                    return reject(err);

                return resolve(typeof encoded === 'string' ? encoded : "");
            });
        });
    }

    static async signCookie(value: string, duration: `${number}${'m' | 'h' | 'd'}`) {
        const token = await new SignJWT({ value })
            .setProtectedHeader({ alg: 'HS256'  })
            .setJti(nanoid())
            .setIssuedAt()
            .setExpirationTime(duration)
            .sign(compressToUint8Array(process.env.APP_SECRET!));

        return token;
    }

    static verify(token: string, secret?: Secret) {
        return new Promise<any>(async (resolve, reject) => {
            if (await this.isCancelled(token) === false) {
                return verify(token, secret || process.env.APP_SECRET || "", (err, decoded) => {
                    if (err)
                        return reject(err);

                    return resolve(decoded);
                });
            } else {
                return reject();
            }
        });
    }

    static cancel(token: string) {
        return new Promise<boolean>(async (resolve, reject) => {
            try {
                const Redis = new RedisClient(JsonWebToken.db);

                await Redis.set(`token_cancelled_${token}`, token);

                resolve(true);
            } catch (error) {
                reject(error);
            };
        });
    }
}