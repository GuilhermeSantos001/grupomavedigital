/**
 * @description Servidor Socket.io
 * @author GuilhermeSantos001
 * @update 24/01/2022
 */

import { Server, Socket } from "socket.io";

import Moment from '@/utils/moment';

import routerHercules from '@/socketIO/routerHercules';
import routerPayback from '@/socketIO/routerPayback';

function SocketIO(io: Server) {
    /**
     * Routers
     */
    io.on('connection', (socket: Socket) => {
        if (process.env.NODE_ENV === 'development') {
            console.log(`[SOCKET ${socket.id}] [${Moment.format({ exclude: 'T', layout: 'DD/MM/YYYYTHH:mm:ss' })}] Connected`);

            socket.on("disconnect", (reason) => {
                console.log(`[SOCKET ${socket.id}] [${Moment.format({ exclude: 'T', layout: 'DD/MM/YYYYTHH:mm:ss' })}] Disconnected -> Reason ${reason}`);
            });
        }

        routerHercules(io, socket);
        routerPayback(io, socket);
    });
}

export { SocketIO };