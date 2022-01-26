/**
 * @description Websocket Router -> Payback -> All
 * @author GuilhermeSantos001
 * @update 26/01/2022
 */

import { Server, Socket } from "socket.io";

import { PaybackSocketEvents } from '@/constants/socketEvents';

import {
  TYPEOF_EMITTER_PAYBACK_UPLOAD_MIRROR,
  TYPEOF_LISTENER_PAYBACK_UPLOAD_MIRROR,
  TYPEOF_EMITTER_PAYBACK_CHANGE_TYPE_MIRROR,
  TYPEOF_LISTENER_PAYBACK_CHANGE_TYPE_MIRROR,
  TYPEOF_EMITTER_PAYBACK_DELETE_MIRROR,
  TYPEOF_LISTENER_PAYBACK_DELETE_MIRROR
} from "@/constants/SocketTypes";

import { decompressFromBase64, compressToBase64 } from "lz-string";

import { matches } from "@/mongo/files-manager-mongo";

import Upload from "@/controllers/upload";

export default function routerPaybackAll(io: Server, socket: Socket): void {
  /**
   * ? Evento emitido quando o espelho de ponto do funcionario que está sendo coberto e o funcionario que está cobrindo é anexado
   */
  socket.on(PaybackSocketEvents.PAYBACK_UPLOAD_MIRROR, async (data: string) => {
    const {
      authorId,
      name,
      description,
      size,
      compressedSize,
      fileId,
      version,
      type,
    }: TYPEOF_EMITTER_PAYBACK_UPLOAD_MIRROR = JSON.parse(decompressFromBase64(data) || ""),
    channel =
      type === 'COVERAGE' ?
        PaybackSocketEvents.PAYBACK_UPLOAD_COVERAGE_MIRROR :
        PaybackSocketEvents.PAYBACK_UPLOAD_COVERING_MIRROR,
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
        throw new Error('Não foi possível armazenar o arquivo.');

      const reply: TYPEOF_LISTENER_PAYBACK_UPLOAD_MIRROR = {
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
      };

      return socket.emit(
        channelSuccess,
        compressToBase64(JSON.stringify(reply)));
    } catch (error) {
      socket
        .emit(channelError, error instanceof Error ? error.message : JSON.stringify(error));
    }
  });

  /**
   * ? Evento emitido quando o espelho de ponto do funcionario muda de tipo
   */
  socket.on(PaybackSocketEvents.PAYBACK_CHANGE_TYPE_MIRROR, async (data: string) => {
    const {
      filesId,
      type,
    }: TYPEOF_EMITTER_PAYBACK_CHANGE_TYPE_MIRROR = JSON.parse(decompressFromBase64(data) || ""),
      channel = PaybackSocketEvents.PAYBACK_CHANGE_TYPE_MIRROR,
      channelSuccess = `${channel}-SUCCESS`,
      channelError = `${channel}-FAILURE`;

    try {
      if (type === 'TEMPORARY') {
        for (const fileId of filesId.filter(fileId => fileId.length > 0)) {
          if (!await Upload.makeTemporary(fileId))
            throw new Error('Não foi possível mudar o arquivo para temporario.');
        }
      } else if (type === 'PERMANENT') {
        for (const fileId of filesId.filter(fileId => fileId.length > 0)) {
          if (!await Upload.makePermanent(fileId))
            throw new Error('Não foi possível mudar o arquivo para permanente.');
        }
      }

      const reply: TYPEOF_LISTENER_PAYBACK_CHANGE_TYPE_MIRROR = {
        filesId,
        type,
      }

      return socket.emit(
        channelSuccess,
        compressToBase64(JSON.stringify(reply)));
    } catch (error) {
      socket
        .emit(channelError, error instanceof Error ? error.message : JSON.stringify(error));
    }
  });

  /**
   * ? Evento emitido quando o espelho de ponto do funcionario é excluído
   */
  socket.on(PaybackSocketEvents.PAYBACK_DELETE_MIRROR, async (data: string) => {
    const {
      filesId,
    }: TYPEOF_EMITTER_PAYBACK_DELETE_MIRROR = JSON.parse(decompressFromBase64(data) || ""),
      channel = PaybackSocketEvents.PAYBACK_DELETE_MIRROR,
      channelSuccess = `${channel}-SUCCESS`,
      channelError = `${channel}-FAILURE`;

    try {
      for (const fileId of filesId) {
        if (!await Upload.remove(fileId))
          throw new Error('Não foi possível excluir o arquivo.');
      }

      const reply: TYPEOF_LISTENER_PAYBACK_DELETE_MIRROR = {
        filesId
      }

      return socket.emit(
        channelSuccess,
        compressToBase64(JSON.stringify(reply)));
    } catch (error) {
      socket
        .emit(channelError, error instanceof Error ? error.message : JSON.stringify(error));
    }
  });
}