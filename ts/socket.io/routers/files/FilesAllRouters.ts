import { Server, Socket } from "socket.io";

import { FilesSocketEvents } from '@/constants/SocketEvents';

import {
  TYPEOF_EMITTER_FILE_UPLOAD_ATTACHMENT,
  TYPEOF_LISTENER_FILE_UPLOAD_ATTACHMENT,
  TYPEOF_EMITTER_FILE_CHANGE_TYPE_ATTACHMENT,
  TYPEOF_LISTENER_FILE_CHANGE_TYPE_ATTACHMENT,
  TYPEOF_EMITTER_FILE_DELETE_ATTACHMENT,
  TYPEOF_LISTENER_FILE_DELETE_ATTACHMENT,
} from "@/constants/SocketFileType";

import { decompressFromBase64, compressToBase64 } from "lz-string";

import { matches } from "@/schemas/FilesSchema";

import { UploadsController } from "@/controllers/UploadsController";

export function FilesAllRouters(io: Server, socket: Socket): void {
  socket.on(FilesSocketEvents.FILE_UPLOAD_ATTACHMENT, async (data: string) => {
    const {
      channel,
      authorId,
      name,
      description,
      size,
      compressedSize,
      fileId,
      version,
    }: TYPEOF_EMITTER_FILE_UPLOAD_ATTACHMENT = JSON.parse(decompressFromBase64(data) || ""),
      channelSuccess = `${channel}-SUCCESS`,
      channelError = `${channel}-FAILURE`;

    try {
      const
        uploadsController = new UploadsController(),
        filename = String(name).substring(0, String(name).lastIndexOf('.')).replace(matches.specialCharacters, ' ').replace(/\s{2,}/g, ' '),
        filetype = name.substring(name.lastIndexOf('.')),
        temporary = true,
        expiredAt = new Date(uploadsController.getTimeToExpire()).toISOString(),
        upload = await uploadsController.register({
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

      const reply: TYPEOF_LISTENER_FILE_UPLOAD_ATTACHMENT = {
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
      };

      return socket.emit(
        channelSuccess,
        compressToBase64(JSON.stringify(reply)));
    } catch (error) {
      socket
        .emit(channelError, error instanceof Error ? error.message : JSON.stringify(error));
    }
  });

  socket.on(FilesSocketEvents.FILE_CHANGE_TYPE_ATTACHMENT, async (data: string) => {
    const {
      filesId,
      type,
    }: TYPEOF_EMITTER_FILE_CHANGE_TYPE_ATTACHMENT = JSON.parse(decompressFromBase64(data) || ""),
      channel = FilesSocketEvents.FILE_CHANGE_TYPE_ATTACHMENT,
      channelSuccess = `${channel}-SUCCESS`,
      channelError = `${channel}-FAILURE`;

    try {
      const uploadsController = new UploadsController();

      if (type === 'TEMPORARY') {
        for (const fileId of filesId.filter(fileId => fileId.length > 0)) {
          if (!await uploadsController.makeTemporary(fileId))
            throw new Error('Não foi possível mudar o arquivo para temporario.');
        }
      } else if (type === 'PERMANENT') {
        for (const fileId of filesId.filter(fileId => fileId.length > 0)) {
          if (!await uploadsController.makePermanent(fileId))
            throw new Error('Não foi possível mudar o arquivo para permanente.');
        }
      }

      const reply: TYPEOF_LISTENER_FILE_CHANGE_TYPE_ATTACHMENT = {
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

  socket.on(FilesSocketEvents.FILE_DELETE_ATTACHMENT, async (data: string) => {
    const {
      filesId,
      mirrorsId,
    }: TYPEOF_EMITTER_FILE_DELETE_ATTACHMENT = JSON.parse(decompressFromBase64(data) || ""),
      channel = FilesSocketEvents.FILE_DELETE_ATTACHMENT,
      channelSuccess = `${channel}-SUCCESS`,
      channelError = `${channel}-FAILURE`;

    try {
      const uploadsController = new UploadsController();

      for (const fileId of filesId) {
        await uploadsController.remove(fileId);
      }

      const reply: TYPEOF_LISTENER_FILE_DELETE_ATTACHMENT = {
        mirrorsId
      }

      return socket.emit(
        channelSuccess,
        compressToBase64(JSON.stringify(reply))
      );
    } catch (error) {
      socket
        .emit(channelError, error instanceof Error ? error.message : JSON.stringify(error));
    }
  });
}