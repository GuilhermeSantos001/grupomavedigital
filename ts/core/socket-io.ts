/**
 * @description Servidor Socket.io
 * @author @GuilhermeSantos001
 * @update 17/07/2021
 * @version 1.0.3
 */

import { Server as HTTPServer } from 'http';
import { Server } from "socket.io";
import { createAdapter } from '@socket.io/redis-adapter';
import { RedisClient } from 'redis';

import JsonWebToken from "@/core/JsonWebToken";
import WebSocketRouterMiddlewares from '@/app/routers/wss/middlewares-socket';
import WebSocketRouterCards from '@/app/routers/wss/cards-socket';
import WebSocketRouterHerculesStorage from '@/app/routers/wss/storageHercules-socket';

class IO {
    static readonly db: number = 3;
    static _context: any = null;

    constructor() {
        throw new Error('this is static class');
    };

    static get context() {
        return this._context;
    };

    static set context(value) {
        this._context = value;
    };

    static create(server: HTTPServer) {
        let options = {};

        if (process.env.NODE_ENV === 'development') {
            options = {
                cors: {
                    origin: "*:*",
                    methods: ["GET", "POST"]
                }
            };
        } else {
            options = {
                cors: {
                    origin: "https://grupomavedigital.com.br",
                    methods: ["GET", "POST"]
                },
                transports: ['websocket', 'polling']
            };
        };

        this.context = new Server(server, options);

        this.listening();
    };

    static listening() {
        /**
         * Redis Adapter & Middlewares
         */
        const pubClient = new RedisClient({ host: process.env.REDIS_HOST, port: Number(process.env.REDIS_PORT), db: this.db });
        const subClient = pubClient.duplicate();

        this.context.adapter(createAdapter(pubClient, subClient));

        this.context.use((socket: any, next: any) => {
            const token = socket.handshake.auth.token;

            JsonWebToken.verify(token)
                .then(result => {
                    if (
                        !result
                    ) {
                        const err = new Error("not authorized");

                        return next({
                            ...err,
                            data: { content: "Please retry later" }
                        });
                    }

                    return next();
                })
                .catch(error => {
                    const err = new Error("not authorized");

                    return next({
                        ...err,
                        data: { content: "Error with token ->", error }
                    });
                });
        });

        /**
         * Routers
         */

        this.context.on('connection', (socket: any) => {
            WebSocketRouterMiddlewares(this.context, socket);
            WebSocketRouterCards(this.context, socket);
            WebSocketRouterHerculesStorage(this.context, socket);
        });
    };
};

export default function SocketIO(server: HTTPServer): void {
    IO.create(server);
};