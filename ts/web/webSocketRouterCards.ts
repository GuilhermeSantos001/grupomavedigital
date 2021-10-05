/**
 * @description Websocket Router -> Cards
 * @author @GuilhermeSantos001
 * @update 29/09/2021
 */

import { Server, Socket } from "socket.io";
import LZString from "lz-string";

import userDb from '@/db/user-db';
import activityDB from '@/db/activities-db';

export default function WebSocketRouterCards(io: Server, socket: Socket): void {
  /** Retorna a lista de atividades */
  socket.on('GET_ACTIVITIES', async (limit = 100) => {
    const activities = await activityDB.get(limit);

    socket.emit('POST_ACTIVITIES', LZString.compressToEncodedURIComponent(JSON.stringify(activities)));
  });

  /** Retorna dados para os gráficos */
  socket.on('GET_CHART_USER_TOTAL', async () => {
    const
      totals = await userDb.getUsersEnabledAndDisabled(),
      res = { totals };

    socket.emit('POST_CHART_USER_TOTAL', LZString.compressToEncodedURIComponent(JSON.stringify(res)));
  });
}