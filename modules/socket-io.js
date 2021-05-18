const { Server } = require("socket.io"),
    redis = require('socket.io-redis'),
    mongoDB = require('./mongodb'),
    LZString = require('lz-string'),
    jwt = require('./jwt');

/**
 * @class IO
 * @author GuilhermeSantos001
 * @description Servidor Socket.io
 * @static
 */
class IO {
    constructor() {
        throw new Error('this is static class');
    }

    static get context() {
        return this._context;
    }

    static set context(value) {
        this._context = value;
    }

    static create(server) {
        let options = {};
        if (process.env.NODE_ENV === 'development') {
            options = {
                cors: {
                    origin: "*:*",
                    methods: ["GET", "POST"]
                },
                transports: ['websocket', 'polling']
            };
        } else {
            options = {
                cors: {
                    origin: "https://grupomavedigital.com.br",
                    methods: ["GET", "POST"]
                },
                transports: ['websocket', 'polling']
            };
        }

        this.context = new Server(server, options);

        this.listening();
    }

    static listening() {
        /**
         * Redis Adapter & Middlewares
         */
        this.context.adapter(redis({ host: 'localhost', port: 6379 }));
        this.context.use((socket, next) => {
            const token = socket.handshake.auth.token;

            console.log('TESTE -> !!!!')

            jwt.verify(token)
                .then(result => {
                    if (
                        !result
                    ) {
                        const err = new Error("not authorized");

                        err.data = { content: "Please retry later" };

                        return next(err);
                    }

                    return next();
                })
                .catch(error => {
                    const err = new Error("not authorized");

                    err.data = { content: "Error with token ->", error };

                    return next(err);
                });
        });

        /**
         * Routers
         */

        this.context.on('connection', socket => {
            /** Retorna a lista de atividades */
            socket.on('GET_ACTIVITIES', async (limit = 100) => {
                const { activities } = await mongoDB.activities.get('', '', limit);

                socket.emit('POST_ACTIVITIES', LZString.compressToEncodedURIComponent(JSON.stringify(activities)));
            });

            /** Retorna dados para os gráficos */
            socket.on('GET_CHART_USER_TOTAL', async () => {
                const
                    { users } = await mongoDB.users.get(),
                    totals = [
                        users.filter(user => user['status']).length,
                        users.filter(user => !user['status']).length
                    ],
                    res = { totals };

                socket.emit('POST_CHART_USER_TOTAL', LZString.compressToEncodedURIComponent(JSON.stringify(res)));
            });
        });
    }
}

module.exports = server => IO.create(server);