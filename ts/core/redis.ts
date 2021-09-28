
/**
 * @description Armazenamento de estrutura de dados em memória, usado como um banco de dados em memória distribuído de chave-valor.
 * @author @GuilhermeSantos001
 * @update 17/07/2021
 * @version 1.0.1
 */

import LZString from 'lz-string';
import { createClient, RedisClient } from 'redis';

import Debug from '@/core/log4';

declare function events(error?: any): string;
declare function _callback(response: boolean, values: any[]): void;
declare function finish(key: string, operation: string, error?: any, callback?: typeof _callback, ...args: any[]): void;

declare type Config = {
    host: string;
    port: number;
    connect_timeout: number;
};

export default class REDIS {
    private onError: typeof events;
    private onConnect: typeof events;
    private onReady: typeof events;
    private onContinue: typeof events;
    private onEnd: typeof events;
    private onFinish: typeof finish;
    private config: Config;
    private readonly db: number;
    private client?: RedisClient;
    private lzstring: LZString.LZStringStatic;

    constructor(db: number = 1) {
        this.onError = function (error: any) {
            return `Redis(Client | DB: ${this.getDB()}) -> Error ${error}`;
        };

        this.onConnect = function () {
            return `Redis(Client | DB: ${this.getDB()}) -> Connected`;
        };

        this.onReady = function () {
            return `Redis(Client | DB: ${this.getDB()}) -> Ready for the next operation`;
        };

        this.onContinue = function () {
            return `Redis(Client | DB: ${this.getDB()}) -> Connection successfully established`;
        };

        this.onEnd = function () {
            return `Redis(Client | DB: ${this.getDB()}) -> Disconnected`;
        };

        this.onFinish = function (key, operation, error, callback: any, ...args: any[]) {
            if (error) {
                const msg = `Redis(Client | DB: ${this.getDB()}) -> Error occurred in the database operation: ${operation} \n Key: ${key} \n ${error}`;

                Debug.fatal('redis', msg);

                return callback(false, args);
            }

            const msg = `Redis(Client | DB: ${this.getDB()}) -> Success occurred in the database operation: ${operation} \n Key: ${key}`;

            Debug.info('redis', msg);

            return callback(true, args);
        };

        this.config = {
            host: String(process.env.REDIS_HOST),
            port: Number(process.env.REDIS_PORT),
            connect_timeout: Number(process.env.REDIS_CONNECT_TIMEOUT)
        };
        this.db = db;
        this.lzstring = LZString;
    };

    getDB(): number {
        return this.db;
    }

    connect() {
        return new Promise<String>((resolve, reject) => {
            if (typeof this.client === "undefined" || this.client && !this.client?.connected) {
                this.client = createClient(this.config);
            } else {
                return resolve(this.onContinue());
            }

            this.client?.on('error', (error: any) => {
                const msg = this.onError(error);

                Debug.fatal('redis', msg);

                return reject(msg);
            });

            this.client?.on('connect', () => {
                const msg = this.onConnect();

                return Debug.info('redis', msg);
            });

            this.client?.on('ready', () => {
                const msg = this.onReady();

                Debug.info('redis', msg);

                return resolve(msg);
            });

            this.client?.on('end', () => {
                const msg = this.onEnd();

                return Debug.info('redis', msg);
            });
        });
    };

    disconnect() {
        if (this.client && this.client?.connected)
            return this.client?.quit();
    };

    flush() {
        return new Promise(async (resolve, reject) => {
            if (this.client && this.client?.connected) {
                this.client?.select(this.db, async (error: any) => {
                    if (error)
                        return Debug.fatal('redis', this.onError(error));

                    let status = await this.client?.flushdb();

                    if (status) {
                        const msg = `Redis(Client | DB: ${this.getDB()}) -> Success occurred in the database operation: ${'CLEAR DATABASE'} \n db: ${this.db}`;

                        Debug.info('redis', msg);

                        return resolve(msg);
                    } else {
                        const msg = `Redis(Client | DB: ${this.getDB()}) -> Error occurred in the database operation: ${'CLEAR DATABASE'} \n db: ${this.db}`;

                        Debug.fatal('redis', msg);

                        return reject(msg);
                    }
                });
            } else {
                const msg = `Redis(Client | DB: ${this.getDB()}) -> Error occurred in the database operation: ${'CLEAR DATABASE'} \n db: ${this.db} \n Error: Client is not connected`;

                Debug.fatal('redis', msg);

                return reject(msg);
            }
        });
    };

    async set(key: string, value: string, callback?: typeof _callback) {
        try {
            await this.connect();

            if (typeof callback !== "function") callback = () => { };

            this.client?.select(this.db, (error: any) => {
                if (error)
                    return Debug.fatal('redis', this.onError(error));

                this.client?.set(key, this.lzstring.compressToBase64(value), (error: any, reply: string) => this.onFinish(key, 'SET VALUE', error, callback, reply));
            });
        } catch (error) {
            return Debug.fatal('redis', this.onError(error));
        }
    };

    async get(key: string, callback?: typeof _callback) {
        try {
            await this.connect();

            if (typeof callback !== "function") callback = () => { };

            this.client?.select(this.db, async (error: any) => {
                if (error)
                    return Debug.fatal('redis', this.onError(error));

                this.client?.get(key, async (error: any, value: any) => this.onFinish(key, 'GET VALUE', error, callback, this.lzstring.decompressFromBase64(value)));
            });
        } catch (error) {
            return Debug.fatal('redis', this.onError(error));
        }
    };
};