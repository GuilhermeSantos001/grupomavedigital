/**
 * @description Websocket Router -> Payback
 * @author GuilhermeSantos001
 * @update 10/01/2022
 */

import { Server } from "socket.io";

import routerPaybackAll from '@/socketIO/payback/routerPaybackAll';

export default function routerPayback(io: Server, socket: any): void {
  routerPaybackAll(io, socket);
}