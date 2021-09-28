/**
 * @description Websocket Router -> Middlewares
 * @author @GuilhermeSantos001
 * @update 25/08/2021
 * @version 1.0.0
 */

import JsonWebToken from "@/core/JsonWebToken";

export default function WebSocketRouterMiddlewares(io: any, socket: any) {
    /**
     * @description Escuta todos os eventos recebidos
     */
    const onevent = socket.onevent;
    socket.onevent = async function (packet: any) {
        if (packet.data.indexOf('DISCONNECT') === -1) {
            try {
                await verifyToken();

                return onevent.call(this, packet);
            } catch {
                return socket.emit('connect_close');
            };
        } else {
            return onevent.call(this, packet);
        };
    };

    /**
     * @description Desconecta a conexão
     */
    socket.on('DISCONNECT', () => socket.disconnect());

    /**
     * @description Verifica se o token do usuário está valido
     */
    function verifyToken() {
        return new Promise<void>((resolve, reject) => {
            const token = socket.handshake.auth.token;

            JsonWebToken.verify(token)
                .then(result => {
                    if (
                        !result
                    ) {
                        return reject();
                    };

                    return resolve();
                })
                .catch(error => reject());
        });
    };
};