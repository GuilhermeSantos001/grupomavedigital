/**
 * @description Websocket Router -> Payback -> All
 * @author GuilhermeSantos001
 * @update 12/01/2022
 */

import { Server, Socket } from "socket.io";

import { matches } from "@/mongo/files-manager-mongo";

import Upload from "@/controllers/upload";

export default function routerPaybackAll(io: Server, socket: Socket): void {
  /**
     * ? Evento emitido quando um arquivo é criado
     */
  socket.on('CREATE-FILE', async (
    authorId: string,
    name: string,
    description: string,
    size: number,
    compressedSize: number,
    fileId: string,
    version: number,
  ) => {
    const
      channel = 'CREATE-FILE',
      channelError = `${channel}-FAILURE`;

    try {
      const
        filename = String(name).substring(0, String(name).lastIndexOf('.')).replace(matches.specialCharacters, ' ').replace(/\s{2,}/g, ' '),
        filetype = name.substring(name.lastIndexOf('.')),
        temporary = true,
        expiredAt = new Date(Upload.getTimeToExpire()).toISOString(),
        createdAt = new Date().toISOString(),
        upload = await Upload.register({
          fileId,
          authorId,
          name,
          description,
          size,
          compressedSize,
          version,
          temporary
        });

      if (!upload)
        throw new TypeError('Não foi possível armazenar o arquivo.');

      return socket.emit('COVERING-UPLOAD-MIRROR-SUCCESS',
        fileId,
        authorId,
        filename,
        filetype,
        description,
        size,
        compressedSize,
        version,
        temporary,
        expiredAt,
        createdAt,
      );
    } catch (error) {
      socket
        .emit(channelError, error instanceof TypeError ? error.message : JSON.stringify(error));
    }
  });
}