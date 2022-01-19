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
   * ? Evento emitido quando o espelho de ponto do funcionario que está sendo coberto e o funcionario que está cobrindo é anexado
   */
  socket.on('PAYBACK-UPLOAD-MIRROR', async (
    authorId: string,
    name: string,
    description: string,
    size: number,
    compressedSize: number,
    fileId: string,
    version: number,
    type: 'COVERAGE' | 'COVERING'
  ) => {
    const
      channel = `PAYBACK-UPLOAD-${type}-MIRROR`,
      channelSuccess = `${channel}-SUCCESS`,
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
          filename,
          filetype,
          description,
          size,
          compressedSize,
          version,
          temporary
        });

      if (!upload)
        throw new TypeError('Não foi possível armazenar o arquivo.');

      return socket.emit(channelSuccess,
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

  /**
   * ? Evento emitido quando o espelho de ponto do funcionario muda de tipo
   */
  socket.on('PAYBACK-CHANGE-TYPE-MIRROR', async (
    filesId: string[],
    type: 'TEMPORARY' | 'PERMANENT'
  ) => {
    const
      channel = `PAYBACK-CHANGE-TYPE-MIRROR`,
      channelSuccess = `${channel}-SUCCESS`,
      channelError = `${channel}-FAILURE`;

    try {
      if (type === 'TEMPORARY') {
        for (const fileId of filesId.filter(fileId => fileId.length > 0)) {
          if (!await Upload.makeTemporary(fileId))
            throw new TypeError('Não foi possível mudar o arquivo para temporario.');
        }
      } else if (type === 'PERMANENT') {
        for (const fileId of filesId.filter(fileId => fileId.length > 0)) {
          if (!await Upload.makePermanent(fileId))
            throw new TypeError('Não foi possível mudar o arquivo para permanente.');
        }
      }

      return socket.emit(channelSuccess,
        filesId,
        type,
      );
    } catch (error) {
      socket
        .emit(channelError, error instanceof TypeError ? error.message : JSON.stringify(error));
    }
  });

  /**
   * ? Evento emitido quando o espelho de ponto do funcionario é excluído
   */
  socket.on('PAYBACK-DELETE-MIRROR', async (
    filesId: string[],
    types: string[]
  ) => {
    const
      channel = `PAYBACK-DELETE-MIRROR`,
      channelSuccess = `${channel}-SUCCESS`,
      channelError = `${channel}-FAILURE`;

    try {
      for (const fileId of filesId) {
        if (!await Upload.remove(fileId))
          throw new TypeError('Não foi possível excluir o arquivo.');
      }

      return socket.emit(channelSuccess, filesId, types);
    } catch (error) {
      socket
        .emit(channelError, error instanceof TypeError ? error.message : JSON.stringify(error));
    }
  });
}