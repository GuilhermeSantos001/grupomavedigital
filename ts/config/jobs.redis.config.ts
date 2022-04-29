/**
 * @description Arquivo de configuração da conexão com o redis no Bull
 * @author GuilhermeSantos001
 * @update 21/01/2022
 */

import { ConnectionOptions } from 'bullmq';

const connectionOptions: ConnectionOptions = {
  host: String(process.env.REDIS_HOST),
  port: Number(process.env.REDIS_PORT),
  password: String(process.env.REDIS_PASSWORD),
  db: 5
}

export default connectionOptions;