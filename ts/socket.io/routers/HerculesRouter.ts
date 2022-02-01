/**
 * @description Websocket Router -> Hercules Storage
 * @author GuilhermeSantos001
 * @update 31/01/2022
 */

import { Server, Socket } from "socket.io";

import { HerculesFilesRouter } from '@/socket.io/routers/hercules/HerculesFilesRouter';
import { HerculesFoldersRouter } from '@/socket.io/routers/hercules/HerculesFoldersRouter';

export function HerculesRouter(io: Server, socket: Socket): void {
    HerculesFilesRouter(io, socket);
    HerculesFoldersRouter(io, socket);
}