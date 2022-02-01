/**
 * @description Servidor Socket.io
 * @author GuilhermeSantos001
 * @update 31/01/2022
 */

import { Server, Socket } from "socket.io";

import Moment from '@/utils/moment';

import { HerculesRouter } from '@/socket.io/routers/HerculesRouter';
import { PaybackRouter } from '@/socket.io/routers/PaybackRouter';

export function SocketIO(io: Server) {
    io.on('connection', (socket: Socket) => {
        if (process.env.NODE_ENV === 'development') {
            console.log(`[SOCKET ${socket.id}] [${Moment.format({ exclude: 'T', layout: 'DD/MM/YYYYTHH:mm:ss' })}] Connected`);

            socket.on("disconnect", (reason) => {
                console.log(`[SOCKET ${socket.id}] [${Moment.format({ exclude: 'T', layout: 'DD/MM/YYYYTHH:mm:ss' })}] Disconnected -> Reason ${reason}`);
            });
        }

        HerculesRouter(io, socket);
        PaybackRouter(io, socket);
    });
}