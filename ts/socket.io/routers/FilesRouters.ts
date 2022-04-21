import { Server, Socket } from "socket.io";

import { FilesAllRouters } from '@/socket.io/routers/files/FilesAllRouters';

export function FilesRouters(io: Server, socket: Socket): void {
  FilesAllRouters(io, socket);
}