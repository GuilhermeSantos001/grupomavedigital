/**
 * @description Controle dos JSON Web Tokens
 * @author @GuilhermeSantos001
 * @update 17/07/2021
 * @version 1.0.2
 */

import { sign, verify, Secret } from 'jsonwebtoken';

import REDIS from '@/core/redis';
import Moment from '@/utils/moment';

declare type Options = { expiresIn: string | '3m' | '10m' | '1h' | '7d' };

export interface Token {
    payload: any;
    secret?: Secret;
    options: Options;
}

export default class JsonWebToken {
    static readonly db: number = 2;

    static flush(): Promise<void> {
        return new Promise(async (resolve, reject) => {
            try {
                const client = new REDIS(this.db);
                await client.connect();
                await client.flush();
                client.disconnect();
                resolve();
            } catch (error) {
                reject(error);
            }
        })
    }

    static isCancelled(token: string): Promise<boolean> {
        return new Promise<boolean>(async (resolve, reject) => {
            const client = new REDIS(this.db);

            client.get(`token_cancelled_${token}`, (response: boolean, values: any[]) => {
                client.disconnect();

                if (!response)
                    return reject();

                if (values.filter(value => value !== '').length > 0)
                    return resolve(true);

                resolve(false);
            });
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
            const client = new REDIS(this.db);

            client.set(`token_cancelled_${token}`, Moment.format(), (response: boolean, values: any[]) => {
                client.disconnect();

                if (!response) {
                    return resolve(false);
                }

                return resolve(true);
            });
        });
    }
}