const { Server } = require("socket.io"),
    mongoDB = require('./mongodb'),
    LZString = require('lz-string'),
    jwt = require('./jwt');

/**
 * @private
 * Strict Variables
 */
let keys = [];

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
        this.context = new Server(server);
        this.listening();
    }

    static set keys(secret) {
        if (keys.filter(key =>
            key['route'] !== secret['route']
        ).length <= 0)
            keys.push(secret);
    }

    static get keys() {
        return keys;
    }

    static checkKey(secret) {
        return this.keys.filter(key =>
            key['route'] === secret['route'] &&
            key['value'] === secret['value']
        ).length > 0;
    }

    static async credentials(secret) {
        const { token, key } = secret;

        return await jwt.verify(token)
            .then(result => {
                if (
                    !result ||
                    !this.checkKey(key)
                ) return false;
                return true;
            })
            .catch(err => {
                return false;
            });
    }

    static listening() {
        this.context.on('connection', socket => {
            /** Retorna a lista de atividades */
            socket.on('GET_ACTIVITIES', async (credentials, limit = 100) => {
                if (!await this.credentials(credentials))
                    return socket.emit('ACCESS_DANIED');

                const { activities } = await mongoDB.activities.get('', '', limit);

                socket.emit('POST_ACTIVITIES', LZString.compressToEncodedURIComponent(JSON.stringify(activities)));
            });
            this.keys = {
                route: "GET_ACTIVITIES",
                value: "$n#ROZjvWYzMS0x4jP9gmPek$0fs^EE*5*xM4r6OBzdI1nTWna"
            };

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
            this.keys = {
                route: "POST_CHART_USER_TOTAL",
                value: "*E2Y^oTqE%PEx2qRYVQe!aPcK^fR7VpYQ3hJSyC8PE5w3mSsZ$"
            };
        });
    }
}

module.exports = server => IO.create(server);