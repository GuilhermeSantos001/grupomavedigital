/**
 * @description Websocket Router -> Middlewares
 * @author GuilhermeSantos001
 * @update 19/10/2021
 */

import { Server } from "socket.io";

import { decompressFromBase64 } from "lz-string";
import verifySignedURL from '@/utils/verifySignedURL';

export default function RouterMiddlewares(io: Server, socket: any): void {
    /**
     * @description Escuta todos os eventos recebidos
     */
    const onevent = socket.onevent;
    socket.onevent = async function (packet: any) {
        if (packet.data.indexOf('DISCONNECT') === -1) {
            try {
                await verify();

                return onevent.call(this, packet);
            } catch {
                return socket.emit('connect_close');
            }
        } else {
            return onevent.call(this, packet);
        }
    };

    /**
     * @description Desconecta a conexão
     */
    socket.on('DISCONNECT', () => socket.disconnect());

    /**
     * @description Verifica se o token do usuário está valido
     */
    function verify(): Promise<void> {
        return new Promise((resolve, reject) => {
            if (verifySignedURL(decompressFromBase64(socket.handshake.auth.signedUrl) || "")) {
                return resolve();
            } else {
                return reject('Session expired!');
            }
        });
    }
}