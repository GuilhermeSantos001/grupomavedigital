/**
 * @description Websocket Router -> Hercules Storage
 * @author GuilhermeSantos001
 * @update 19/10/2021
 */

import { Server, Socket } from "socket.io";

import routerHerculesFolder from '@/socketIO/hercules/routerHerculesFolder';
import routerHerculesFile from '@/socketIO/hercules/routerHerculesFile';

export default function routerHercules(io: Server, socket: Socket): void {
    routerHerculesFolder(io, socket);
    routerHerculesFile(io, socket);
}