/**
 * @description Servidor Socket.io
 * @author GuilhermeSantos001
 * @update 10/01/2022
 */

import { Server, Socket, ServerOptions } from "socket.io";
import { createAdapter } from '@socket.io/redis-adapter';
import { ExtendedError } from 'socket.io/dist/namespace';
import { decompressFromBase64 } from 'lz-string';
import Redis from 'ioredis';

import verifySignedURL from '@/utils/verifySignedURL';
import routerMiddlewares from '@/socketIO/routerMiddlewares';
import routerHercules from '@/socketIO/routerHercules';
import routerPayback from '@/socketIO/routerPayback';

class IO {
    static readonly db: number = 3;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    static context: any;

    constructor() {
        throw new TypeError('this is static class');
    }

    static create() {
        let options: Partial<ServerOptions> = {};

        if (process.env.NODE_ENV === 'development') {
            options = {
                cors: {
                    origin: '*',
                    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
                    allowedHeaders: ['Content-Type', 'Authorization', 'Accept', 'Origin', 'X-Requested-With', 'X-HTTP-Method-Override', 'Accept-Language', 'Access-Control-Allow-Origin', 'Access-Control-Allow-Credentials'],
                    credentials: false,
                },
                pingTimeout: 60000,
                pingInterval: 25000,
            };
        } else {
            options = {
                cors: {
                    origin: "https://grupomavedigital.com.br",
                    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
                    allowedHeaders: ['Content-Type', 'Authorization', 'Accept', 'Origin', 'X-Requested-With', 'X-HTTP-Method-Override', 'Accept-Language', 'Access-Control-Allow-Origin', 'Access-Control-Allow-Credentials'],
                    credentials: true,
                },
                pingTimeout: 60000,
                pingInterval: 25000,
            };
        }

        this.context = new Server(parseInt(process.env.APP_SOCKET_PORT || '5000'), options);

        this.listening();
    }

    static listening() {
        /**
         * Redis Adapter & Middlewares
         */
        const pubClient = new Redis({ host: process.env.REDIS_HOST, port: Number(process.env.REDIS_PORT), db: this.db });
        const subClient = pubClient.duplicate();

        this.context.adapter(createAdapter(pubClient, subClient));

        this.context.use(async (socket: Socket, next: (err?: ExtendedError | undefined) => void) => {
            if (verifySignedURL(decompressFromBase64(socket.handshake.auth.signedUrl) || "")) {
                return next();
            } else {
                return next(new Error('Session expired!'));
            }
        });

        /**
         * Routers
         */

        this.context.on('connection', (socket: Socket) => {
            routerMiddlewares(this.context, socket);
            routerHercules(this.context, socket);
            routerPayback(this.context, socket);
        });
    }
}

export default function SocketIO(): void {
    IO.create();
}