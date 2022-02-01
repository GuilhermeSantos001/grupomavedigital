/**
 * @description Websocket Router -> Payback
 * @author GuilhermeSantos001
 * @update 31/01/2022
 */

import { Server, Socket } from "socket.io";

import { PaybackAllRouter } from '@/socket.io/routers/payback/PaybackAllRouter';

export function PaybackRouter(io: Server, socket: Socket): void {
  PaybackAllRouter(io, socket);
}