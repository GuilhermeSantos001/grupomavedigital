import { Server, Socket } from "socket.io";

import Moment from '@/utils/moment';

import { HerculesRouters } from '@/socket.io/routers/HerculesRouters';
import { FilesRouters } from '@/socket.io/routers/FilesRouters';

export function SocketIO(io: Server) {
    io.on('connection', (socket: Socket) => {
        if (process.env.NODE_ENV === 'development') {
            console.log(`[SOCKET ${socket.id}] [${Moment.format({ exclude: 'T', layout: 'DD/MM/YYYYTHH:mm:ss' })}] Connected`);

            socket.on("disconnect", (reason) => {
                console.log(`[SOCKET ${socket.id}] [${Moment.format({ exclude: 'T', layout: 'DD/MM/YYYYTHH:mm:ss' })}] Disconnected -> Reason ${reason}`);
            });
        }

        HerculesRouters(io, socket);
        FilesRouters(io, socket);
    });
}