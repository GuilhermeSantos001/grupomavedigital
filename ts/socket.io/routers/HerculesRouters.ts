/**
 * @description Websocket Router -> Hercules Storage
 * @author GuilhermeSantos001
 * @update 31/01/2022
 */

import { Server, Socket } from "socket.io";

import { HerculesFilesRouters } from '@/socket.io/routers/hercules/HerculesFilesRouters';
import { HerculesFoldersRouters } from '@/socket.io/routers/hercules/HerculesFoldersRouters';

export function HerculesRouters(io: Server, socket: Socket): void {
    HerculesFilesRouters(io, socket);
    HerculesFoldersRouters(io, socket);
}