
/**
 * @description Armazenamento de estrutura de dados em memória, usado como um banco de dados em memória distribuído de chave-valor.
 * @author @GuilhermeSantos001
 * @update 26/11/2021
 */

import LZString from 'lz-string';
import Redis from 'ioredis';

declare type Config = {
    host: string;
    port: number;
};

class REDIS {
    private readonly db: number;
    private config: Config;
    private client?: Redis.Redis;
    private lzstring: LZString.LZStringStatic;

    constructor(db = 1) {
        this.config = {
            host: String(process.env.REDIS_HOST),
            port: Number(process.env.REDIS_PORT)
        };

        this.db = db;

        this.lzstring = LZString;

        this.client = new Redis(this.config);
    }

    getDB(): number {
        return this.db;
    }

    flush(): Promise<void> {
        return new Promise((resolve, reject) => {
            this.client?.flushdb((error) => {
                if (error)
                    return reject(error);

                resolve();
            });
        });
    }

    async set(key: string, value: string): Promise<void> {
        return new Promise((resolve, reject) => {
            try {
                this.client?.select(this.db, (error) => {
                    if (error)
                        return reject(error);

                    this.client?.set(key, this.lzstring.compressToBase64(value), (error) => {
                        if (error)
                            return reject(error);

                        resolve();
                    });
                });
            } catch (error) {
                return reject(error);
            }
        });
    }

    async get(key: string): Promise<string | boolean> {
        return new Promise((resolve, reject) => {
            try {
                this.client?.select(this.db, async (error) => {
                    if (error)
                        return reject(error);

                    this.client?.get(key, (error, reply) => {
                        if (error)
                            return reject(error);

                        if (reply)
                            return resolve(this.lzstring.decompressFromBase64(reply) || "");

                        resolve(false);
                    });
                });
            } catch (error) {
                return reject(error);
            }
        });
    }

    async delete(key: string): Promise<void> {
        return new Promise((resolve, reject) => {
            try {
                this.client?.select(this.db, async (error) => {
                    if (error)
                        return reject(error);

                    this.client?.del(key, (error) => {
                        if (error)
                            return reject(error);

                        resolve();
                    });
                });
            } catch (error) {
                return reject(error);
            }
        });
    }
}

export default function clientRedis(db: number) {
    return new REDIS(db);
}