/**
 * @description Websocket Router -> Hercules Storage -> Files
 * @author GuilhermeSantos001
 * @update 31/01/2022
 */

import { Server, Socket } from "socket.io";

import { ObjectId } from "bson";

import { FilesController } from '@/controllers/FilesController';
import { UsersManagerDB } from '@/database/UsersManagerDB';
import { PrivilegesSystem } from "@/schemas/UsersSchema";
import { GroupId, UserId, matches } from "@/schemas/FilesSchema";
import Privilege from "@/utils/privilege";

export function HerculesFilesRouters(io: Server, socket: Socket): void {
  /**
   * ? Evento emitido quando um arquivo é criado
   */
  socket.on('CREATE-FILE', async (
    room: string[],
    groupId: PrivilegesSystem[],
    userAuth: string,
    authorId: string,
    name: string,
    size: number,
    compressedSize: number,
    fileId: string,
    version: number
  ) => {
    const
      channel = 'CREATE-FILE',
      channelError = `${channel}-ERROR`;

    try {
      const
        filesController = new FilesController(),
        usersManagerDB = new UsersManagerDB(),
        filename = String(name).substring(0, String(name).lastIndexOf('.')).replace(matches.specialCharacters, ' ').replace(/\s{2,}/g, ' '),
        filetype = name.substring(name.lastIndexOf('.')),
        files = await filesController.get({
          name: filename,
          type: filetype
        }, 0, 1),
        { email } = await usersManagerDB.getInfo(userAuth);

      if (files.length <= 0) {
        const file = await filesController.newFile({
          room,
          authorId,
          accessGroupId: (() => {
            const data: GroupId[] = [];

            // ! Verifica se o grupo de administradores está na lista
            if (!groupId.includes('administrador'))
              groupId.push('administrador');

            // ! Verifica se o grupo de moderadores está na lista
            if (!groupId.includes('moderador'))
              groupId.push('moderador');

            // ! Verifica se o grupo de supervisores está na lista
            if (!groupId.includes('supervisor'))
              groupId.push('supervisor');

            // ! Verifica se o grupo de diretores está na lista
            if (!groupId.includes('diretoria'))
              groupId.push('diretoria');

            if (groupId.length > 0) {
              groupId.forEach((name: PrivilegesSystem) => data.push({
                name,
                permissions: ['Write', 'Read', 'Delete', 'Share', 'Security', 'Protect', 'Block']
              }));

              return data;
            }

            return undefined;
          })(),
          accessUsersId: [
            {
              email,
              permissions: ['Write', 'Read', 'Delete', 'Share', 'Security', 'Protect', 'Block']
            }
          ],
          description: '',
          name: filename,
          permission: ["Write", "Read", "Delete", "Share", "Security", "Protect", "Block"],
          status: "Available",
          tag: '',
          type: filetype,
          version,
          history: [{
            authorId,
            size,
            compressedSize,
            uploadDate: new Date(),
            fileId: new ObjectId(fileId),
            version
          }],
          size,
          compressedSize,
        });

        io
          .emit(
            'FILE-RENDER',
            room,
            file.cid,
            file.accessGroupId,
            file.accessUsersId,
            file.folderId,
            await file.getAuthorUsername(),
            await file.getAuthorEmail(),
            file.name,
            file.description,
            file.tag,
            file.type,
            file.createdAt,
            file.updated,
            file.lastAccess,
            file.version,
            file.history?.length,
            file.history,
            file.size,
            file.compressedSize,
            file.trash
          );
      } else {
        const
          file = files[0],
          { email } = await usersManagerDB.getInfo(userAuth);

        if (
          groupId.filter(name => file.checkGroupAccess({ name }, 'Delete')).length > 0 ||
          file.checkUserAccess({ email }, 'Delete')
        ) {
          await filesController.insertVersion(file.cid || "", authorId, size, compressedSize, new ObjectId(fileId), version, { group: { name: 'administrador', permission: 'Write' } });

          const updateFile = await filesController.get({
            cid: file.cid
          }, 0, 1);

          if (!updateFile[0].history)
            updateFile[0].history = [];

          const history = updateFile[0].history.length > 0 ? updateFile[0].history[updateFile[0].history.length - 1] : undefined;

          io
            .emit(
              'FILE-UPDATE-VERSION-SUCCESS',
              room,
              updateFile[0].cid,
              updateFile[0].version,
              updateFile[0].history?.length,
              updateFile[0].size,
              updateFile[0].compressedSize,
              updateFile[0].updated,
              updateFile[0].lastAccess,
              history,
            );
        } else {
          throw new Error(`Você não tem permissão para adicionar versões nesse arquivo`);
        }
      }
    } catch (error) {
      socket
        .emit(channelError, room, error instanceof Error ? error.message : JSON.stringify(error));
    }
  });

  /**
   * ? Evento emitido quando um arquivo tem versões removidas
   */
  socket.on('FILE-VERSION-DELETE', async (
    room: string[],
    groupId: PrivilegesSystem[],
    userAuth: string,
    cid: string,
    versions: number[]
  ) => {
    const
      channel = 'FILE-VERSION-DELETE',
      channelSuccess = `${channel}-SUCCESS-${cid}`,
      channelError = `${channel}-ERROR-${cid}`;

    try {
      const
        filesController = new FilesController(),
        usersManagerDB = new UsersManagerDB(),
        files = await filesController.get({ cid, }, 0, 1);

      if (files.length <= 0) {
        socket
          .emit(
            channelError,
            room,
            `Arquivo não foi encontrado`
          );
      } else {
        const file = files[0],
          { email } = await usersManagerDB.getInfo(userAuth);

        if (
          groupId.filter(name => file.checkGroupAccess({ name }, 'Delete')).length > 0 ||
          file.checkUserAccess({ email }, 'Delete')
        ) {
          await filesController.remove(file.cid || "", { group: { name: 'administrador', permission: 'Delete' } }, versions);

          const updatedFile = await filesController.get({ cid }, 0, 1);

          io
            .emit(channelSuccess, room, cid, updatedFile[0].version, updatedFile[0].history?.length, updatedFile[0].size, updatedFile[0].compressedSize, versions, updatedFile[0].updated, updatedFile[0].lastAccess);
        } else {
          throw new Error(`Você não tem permissão para remover versões desse arquivo`);
        }
      }
    } catch (error) {
      socket
        .emit(channelError, room, error instanceof Error ? error.message : JSON.stringify(error));
    }
  });

  /**
   * ? Evento emitido quando os arquivos de um quarto especifico são solicitados
   */
  socket.on('GET-FILES-BY-ROOM', async (
    room: string[],
    groupId: PrivilegesSystem[],
    userAuth: string,
    limit: number,
    folderId?: string,
  ) => {
    const
      channel = 'GET-FILES-BY-ROOM',
      channelError = `${channel}-ERROR`;

    try {
      const
        filesController = new FilesController(),
        usersManagerDB = new UsersManagerDB(),
        files = await filesController.get({ room: { $all: room }, folderId: { $eq: !folderId ? undefined : folderId } }, 0, limit),
        { email } = await usersManagerDB.getInfo(userAuth);

      if (files.length > 0) {
        for (const file of files) {
          if (
            groupId.filter(name => file.checkGroupAccess({ name }, 'Read')).length > 0 ||
            file.checkUserAccess({ email }, 'Read')
          ) {
            if (file.inRoom(room)) {
              socket
                .emit(
                  'FILE-RENDER',
                  room,
                  file.cid,
                  file.accessGroupId,
                  file.accessUsersId,
                  file.folderId,
                  await file.getAuthorUsername(),
                  await file.getAuthorEmail(),
                  file.name,
                  file.description,
                  file.tag,
                  file.type,
                  file.createdAt,
                  file.updated,
                  file.lastAccess,
                  file.version,
                  file.history?.length,
                  file.history,
                  file.size,
                  file.compressedSize,
                  file.trash
                );
            }
          }
        }
      }
    } catch (error) {
      socket
        .emit(channelError, room, error instanceof Error ? error.message : JSON.stringify(error));
    }
  });

  /**
   * ? Evento emitido quando um arquivo é solicitado
   */
  socket.on('GET-FILE-BY-CID', async (
    room: string[],
    groupId: PrivilegesSystem[],
    userAuth: string,
    cid: string
  ) => {
    const
      channel = 'GET-FILE-BY-CID',
      channelError = `${channel}-ERROR`;

    try {
      const
        filesController = new FilesController(),
        usersManagerDB = new UsersManagerDB(),
        files = await filesController.get({ cid }, 0, 1),
        { email } = await usersManagerDB.getInfo(userAuth);

      if (files.length > 0) {
        for (const file of files) {
          if (
            groupId.filter(name => file.checkGroupAccess({ name }, 'Read')).length > 0 ||
            file.checkUserAccess({ email }, 'Read')
          ) {
            if (file.inRoom(room)) {
              socket
                .emit(
                  'FILE-RENDER',
                  room,
                  file.cid,
                  file.accessGroupId,
                  file.accessUsersId,
                  file.folderId,
                  await file.getAuthorUsername(),
                  await file.getAuthorEmail(),
                  file.name,
                  file.description,
                  file.tag,
                  file.type,
                  file.createdAt,
                  file.updated,
                  file.lastAccess,
                  file.version,
                  file.history?.length,
                  file.history,
                  file.size,
                  file.compressedSize,
                  file.trash
                );
            }
          }
        }
      }
    } catch (error) {
      socket
        .emit(channelError, room, error instanceof Error ? error.message : JSON.stringify(error));
    }
  });

  /**
   * ? Evento emitido quando o nome do arquivo é atualizado
   */
  socket.on('FILE-UPDATE-NAME', async (
    room: string[],
    groupId: PrivilegesSystem[],
    userAuth: string,
    cid: string,
    name: string
  ) => {
    const
      channel = 'FILE-UPDATE-NAME',
      channelSuccess = `${channel}-SUCCESS-${cid}`,
      channelError = `${channel}-ERROR-${cid}`;

    try {
      const
        filesController = new FilesController(),
        usersManagerDB = new UsersManagerDB(),
        files = await filesController.get({ cid }, 0, 1);

      if (files.length <= 0) {
        socket
          .emit(
            channelError,
            room,
            `Arquivo não foi encontrado`
          );
      } else {
        const file = files[0],
          { email } = await usersManagerDB.getInfo(userAuth);

        if (
          groupId.filter(name => file.checkGroupAccess({ name }, 'Write')).length > 0 ||
          file.checkUserAccess({ email }, 'Write')
        ) {
          await filesController.update(file.cid || "", { group: { name: 'administrador', permission: 'Write' } }, { name: name, description: file.description, tag: file.tag })

          const updatedFile = await filesController.get({ cid }, 0, 1);

          io
            .emit(channelSuccess, room, socket.id, cid, updatedFile[0].name, updatedFile[0].updated, updatedFile[0].lastAccess);
        } else {
          throw new Error(`Você não tem permissão para editar esse arquivo`);
        }
      }
    } catch (error) {
      socket
        .emit(channelError, room, error instanceof Error ? error.message : JSON.stringify(error));
    }
  });

  /**
   * ? Evento emitido quando a descrição do arquivo é atualizada
   */
  socket.on('FILE-UPDATE-DESCRIPTION', async (
    room: string[],
    groupId: PrivilegesSystem[],
    userAuth: string,
    cid: string,
    description: string
  ) => {
    const channel = 'FILE-UPDATE-DESCRIPTION',
      channelSuccess = `${channel}-SUCCESS-${cid}`,
      channelError = `${channel}-ERROR-${cid}`;

    try {
      const
        filesController = new FilesController(),
        usersManagerDB = new UsersManagerDB(),
        files = await filesController.get({ cid }, 0, 1);

      if (files.length <= 0) {
        socket
          .emit(
            channelError,
            room,
            `Arquivo não foi encontrado`
          );
      } else {
        const file = files[0],
          { email } = await usersManagerDB.getInfo(userAuth);

        if (
          groupId.filter(name => file.checkGroupAccess({ name }, 'Write')).length > 0 ||
          file.checkUserAccess({ email }, 'Write')
        ) {
          await filesController.update(file.cid || "", { group: { name: 'administrador', permission: 'Write' } }, { name: file.name, description, tag: file.tag })

          const updatedFile = await filesController.get({ cid }, 0, 1);

          io
            .emit(channelSuccess, room, socket.id, cid, updatedFile[0].description, updatedFile[0].updated, updatedFile[0].lastAccess);
        } else {
          throw new Error(`Você não tem permissão para editar esse arquivo`);
        }
      }
    } catch (error) {
      socket
        .emit(channelError, room, error instanceof Error ? error.message : JSON.stringify(error));
    }
  });

  /**
   * ? Evento emitido quando a marcação do arquivo é atualizada
   */
  socket.on('FILE-UPDATE-TAG', async (
    room: string[],
    groupId: PrivilegesSystem[],
    userAuth: string,
    cid: string,
    tag: string
  ) => {
    const channel = 'FILE-UPDATE-TAG',
      channelSuccess = `${channel}-SUCCESS-${cid}`,
      channelError = `${channel}-ERROR-${cid}`;

    try {
      const
        filesController = new FilesController(),
        usersManagerDB = new UsersManagerDB(),
        files = await filesController.get({ cid }, 0, 1);

      if (files.length <= 0) {
        socket
          .emit(
            channelError,
            room,
            `Arquivo não foi encontrado`
          );
      } else {
        const file = files[0],
          { email } = await usersManagerDB.getInfo(userAuth);

        if (
          groupId.filter(name => file.checkGroupAccess({ name }, 'Write')).length > 0 ||
          file.checkUserAccess({ email }, 'Write')
        ) {
          await filesController.update(file.cid || "", { group: { name: 'administrador', permission: 'Write' } }, { name: file.name, description: file.description, tag })

          const updatedFile = await filesController.get({ cid }, 0, 1);

          io
            .emit(channelSuccess, room, socket.id, cid, updatedFile[0].tag, updatedFile[0].updated, updatedFile[0].lastAccess);
        } else {
          throw new Error(`Você não tem permissão para editar esse arquivo`);
        }
      }
    } catch (error) {
      socket
        .emit(channelError, room, error instanceof Error ? error.message : JSON.stringify(error));
    }
  });

  /**
   * ? Evento emitido quando um grupo é adicionado ao arquivo
   */
  socket.on('FILE-ADD-GROUP', async (
    room: string[],
    groupId: PrivilegesSystem[],
    userAuth: string,
    cid: string,
    group: GroupId
  ) => {
    const channel = 'FILE-ADD-GROUP',
      channelSuccess = `${channel}-SUCCESS-${cid}`,
      channelError = `${channel}-ERROR-${cid}`;

    try {
      const
        filesController = new FilesController(),
        usersManagerDB = new UsersManagerDB(),
        files = await filesController.get({ cid }, 0, 1);

      if (files.length <= 0) {
        socket
          .emit(
            channelError,
            room,
            `Arquivo não foi encontrado`
          );
      } else {
        const file = files[0],
          { email } = await usersManagerDB.getInfo(userAuth);

        if (
          groupId.filter(name => file.checkGroupAccess({ name }, 'Security')).length > 0 ||
          file.checkUserAccess({ email }, 'Security')
        ) {
          await filesController.insertGroupId(file.cid || "", { group: { name: 'administrador', permission: 'Security' } }, group);

          const updatedFile = await filesController.get({ cid }, 0, 1);

          if (!updatedFile[0].accessGroupId)
            updatedFile[0].accessGroupId = [];

          const updatedGroup = updatedFile[0].accessGroupId[updatedFile[0].accessGroupId.length - 1];

          io
            .emit(channelSuccess, room, cid, {
              name: updatedGroup.name,
              permissions: updatedGroup.permissions,
              alias: Privilege.alias(updatedGroup.name),
            }, updatedFile[0].updated, updatedFile[0].lastAccess);
        } else {
          throw new Error(`Você não tem permissão para adicionar um grupo na whitelist do arquivo`);
        }
      }
    } catch (error) {
      socket
        .emit(channelError, room, error instanceof Error ? error.message : JSON.stringify(error));
    }
  });

  /**
   * ? Evento emitido quando um usuário é adicionado ao arquivo
   */
  socket.on('FILE-ADD-USER', async (
    room: string[],
    groupId: PrivilegesSystem[],
    userAuth: string,
    cid: string,
    user: UserId
  ) => {
    const channel = 'FILE-ADD-USER',
      channelSuccess = `${channel}-SUCCESS-${cid}`,
      channelError = `${channel}-ERROR-${cid}`;

    try {
      const
        filesController = new FilesController(),
        usersManagerDB = new UsersManagerDB(),
        files = await filesController.get({ cid }, 0, 1),
        users = await usersManagerDB.get({ clearEmail: user.email }, 0, 1);

      if (files.length <= 0) {
        socket
          .emit(
            channelError,
            room,
            `Arquivo não foi encontrado`
          );
      } else if (users.length <= 0) {
        socket
          .emit(
            channelError,
            room,
            `usuário não foi encontrado`
          );
      } else {
        const file = files[0],
          { email } = await usersManagerDB.getInfo(userAuth);

        if (
          groupId.filter(name => file.checkGroupAccess({ name }, 'Security')).length > 0 ||
          file.checkUserAccess({ email }, 'Security')
        ) {
          await filesController.insertUserId(file.cid || "", { group: { name: 'administrador', permission: 'Security' } }, user);

          const updatedFile = await filesController.get({ cid }, 0, 1);

          if (!updatedFile[0].accessUsersId)
            updatedFile[0].accessUsersId = [];

          const updatedUser = updatedFile[0].accessUsersId[updatedFile[0].accessUsersId.length - 1];

          io
            .emit(channelSuccess, room, cid, {
              email: updatedUser.email,
              permissions: updatedUser.permissions,
            }, updatedFile[0].updated, updatedFile[0].lastAccess);
        } else {
          throw new Error(`Você não tem permissão para adicionar um usuário na whitelist do arquivo`);
        }
      }
    } catch (error) {
      socket
        .emit(channelError, room, error instanceof Error ? error.message : JSON.stringify(error));
    }
  });

  /**
   * ? Evento emitido quando um grupo é removido do arquivo
   */
  socket.on('FILE-REMOVE-GROUP', async (
    room: string[],
    groupId: PrivilegesSystem[],
    userAuth: string,
    cid: string,
    group: GroupId
  ) => {
    const channel = 'FILE-REMOVE-GROUP',
      channelSuccess = `${channel}-SUCCESS-${cid}`,
      channelError = `${channel}-ERROR-${cid}`;

    try {
      const
        filesController = new FilesController(),
        usersManagerDB = new UsersManagerDB(),
        files = await filesController.get({ cid }, 0, 1);

      if (files.length <= 0) {
        socket
          .emit(
            channelError,
            room,
            `Arquivo não foi encontrado`
          );
      } else {
        const file = files[0],
          { email } = await usersManagerDB.getInfo(userAuth);

        if (
          groupId.filter(name => file.checkGroupAccess({ name }, 'Security')).length > 0 ||
          file.checkUserAccess({ email }, 'Security')
        ) {
          await filesController.removeGroupId(file.cid || "", { group: { name: 'administrador', permission: 'Security' } }, group);

          const updatedFile = await filesController.get({ cid }, 0, 1);

          if (!updatedFile[0].accessGroupId)
            updatedFile[0].accessGroupId = [];

          io
            .emit(channelSuccess, room, cid, {
              name: group.name,
              permissions: group.permissions,
              alias: Privilege.alias(group.name),
            }, updatedFile[0].updated, updatedFile[0].lastAccess);
        } else {
          throw new Error(`Você não tem permissão para remover um grupo da whitelist do arquivo`);
        }
      }
    } catch (error) {
      socket
        .emit(channelError, room, error instanceof Error ? error.message : JSON.stringify(error));
    }
  });

  /**
   * ? Evento emitido quando um usuário é removido do arquivo
   */
  socket.on('FILE-REMOVE-USER', async (
    room: string[],
    groupId: PrivilegesSystem[],
    userAuth: string,
    cid: string,
    user: UserId
  ) => {
    const channel = 'FILE-REMOVE-USER',
      channelSuccess = `${channel}-SUCCESS-${cid}`,
      channelError = `${channel}-ERROR-${cid}`;

    try {
      const
        filesController = new FilesController(),
        usersManagerDB = new UsersManagerDB(),
        files = await filesController.get({ cid }, 0, 1);

      if (files.length <= 0) {
        socket
          .emit(
            channelError,
            room,
            `Arquivo não foi encontrado`
          );
      } else {
        const file = files[0],
          { email } = await usersManagerDB.getInfo(userAuth);

        if (
          groupId.filter(name => file.checkGroupAccess({ name }, 'Security')).length > 0 ||
          file.checkUserAccess({ email }, 'Security')
        ) {
          await filesController.removeUserId(file.cid || "", { group: { name: 'administrador', permission: 'Security' } }, user);

          const updatedFile = await filesController.get({ cid }, 0, 1);

          if (!updatedFile[0].accessGroupId)
            updatedFile[0].accessGroupId = [];

          io
            .emit(channelSuccess, room, cid, {
              email: user.email,
              permissions: user.permissions,
            }, updatedFile[0].updated, updatedFile[0].lastAccess);
        } else {
          throw new Error(`Você não tem permissão para remover um usuário da whitelist do arquivo`);
        }
      }
    } catch (error) {
      socket
        .emit(channelError, room, error instanceof Error ? error.message : JSON.stringify(error));
    }
  });

  /**
   * ? Evento emitido quando uma permissão é adicionada ao grupo no arquivo
   */
  socket.on('FILE-UPDATE-PERMISSION-GROUP', async (
    room: string[],
    groupId: PrivilegesSystem[],
    userAuth: string,
    cid: string,
    group: GroupId
  ) => {
    const channel = 'FILE-UPDATE-PERMISSION-GROUP',
      channelSuccess = `${channel}-SUCCESS-${cid}`,
      channelError = `${channel}-ERROR-${cid}`;

    try {
      const
        filesController = new FilesController(),
        usersManagerDB = new UsersManagerDB(),
        files = await filesController.get({ cid }, 0, 1);

      if (files.length <= 0) {
        socket
          .emit(
            channelError,
            room,
            `Arquivo não foi encontrado`
          );
      } else {
        const file = files[0],
          { email } = await usersManagerDB.getInfo(userAuth);

        if (
          groupId.filter(name => file.checkGroupAccess({ name }, 'Security')).length > 0 ||
          file.checkUserAccess({ email }, 'Security')
        ) {
          await filesController.insertPermissionInGroupId(file.cid || "", { group: { name: 'administrador', permission: 'Security' } }, group, group.permissions);

          const updatedFile = await filesController.get({ cid }, 0, 1);

          if (!updatedFile[0].accessGroupId)
            updatedFile[0].accessGroupId = [];

          io
            .emit(channelSuccess, room, cid, {
              name: group.name,
              permissions: updatedFile[0].accessGroupId.filter(_group => _group.name === group.name)[0].permissions,
              alias: Privilege.alias(group.name),
            }, updatedFile[0].updated, updatedFile[0].lastAccess);
        } else {
          throw new Error(`Você não tem permissão para adicionar uma permissão no grupo no arquivo`);
        }
      }
    } catch (error) {
      socket
        .emit(channelError, room, error instanceof Error ? error.message : JSON.stringify(error));
    }
  });

  /**
   * ? Evento emitido quando uma permissão é adicionada ao usuário no arquivo
   */
  socket.on('FILE-UPDATE-PERMISSION-USER', async (
    room: string[],
    groupId: PrivilegesSystem[],
    userAuth: string,
    cid: string,
    user: UserId
  ) => {
    const channel = 'FILE-UPDATE-PERMISSION-USER',
      channelSuccess = `${channel}-SUCCESS-${cid}`,
      channelError = `${channel}-ERROR-${cid}`;

    try {
      const
        filesController = new FilesController(),
        usersManagerDB = new UsersManagerDB(),
        files = await filesController.get({ cid }, 0, 1);

      if (files.length <= 0) {
        socket
          .emit(
            channelError,
            room,
            `Arquivo não foi encontrado`
          );
      } else {
        const file = files[0],
          { email } = await usersManagerDB.getInfo(userAuth);

        if (
          groupId.filter(name => file.checkGroupAccess({ name }, 'Security')).length > 0 ||
          file.checkUserAccess({ email }, 'Security')
        ) {
          await filesController.insertPermissionInUserId(file.cid || "", { group: { name: 'administrador', permission: 'Security' } }, user, user.permissions);

          const updatedFile = await filesController.get({ cid }, 0, 1);

          if (!updatedFile[0].accessUsersId)
            updatedFile[0].accessUsersId = [];

          io
            .emit(channelSuccess, room, cid, {
              email: user.email,
              permissions: updatedFile[0].accessUsersId.filter(_user => _user.email === user.email)[0].permissions,
            }, updatedFile[0].updated, updatedFile[0].lastAccess);
        } else {
          throw new Error(`Você não tem permissão para adicionar uma permissão do usuário no arquivo`);
        }
      }
    } catch (error) {
      socket
        .emit(channelError, room, error instanceof Error ? error.message : JSON.stringify(error));
    }
  });

  /**
   * ? Evento emitido quando uma permissão é removida do grupo no arquivo
   */
  socket.on('FILE-REMOVE-PERMISSION-GROUP', async (
    room: string[],
    groupId: PrivilegesSystem[],
    userAuth: string,
    cid: string,
    group: GroupId
  ) => {
    const channel = 'FILE-REMOVE-PERMISSION-GROUP',
      channelSuccess = `${channel}-SUCCESS-${cid}`,
      channelError = `${channel}-ERROR-${cid}`;

    try {
      const
        filesController = new FilesController(),
        usersManagerDB = new UsersManagerDB(),
        files = await filesController.get({ cid }, 0, 1);

      if (files.length <= 0) {
        socket
          .emit(
            channelError,
            room,
            `Arquivo não foi encontrado`
          );
      } else {
        const file = files[0],
          { email } = await usersManagerDB.getInfo(userAuth);

        if (
          groupId.filter(name => file.checkGroupAccess({ name }, 'Security')).length > 0 ||
          file.checkUserAccess({ email }, 'Security')
        ) {
          await filesController.removePermissionInGroupId(file.cid || "", { group: { name: 'administrador', permission: 'Security' } }, group, group.permissions);

          const updatedFile = await filesController.get({ cid }, 0, 1);

          if (!updatedFile[0].accessGroupId)
            updatedFile[0].accessGroupId = [];

          io
            .emit(channelSuccess, room, cid, {
              name: group.name,
              permissions: updatedFile[0].accessGroupId.filter(_group => _group.name === group.name)[0].permissions,
              alias: Privilege.alias(group.name),
            }, updatedFile[0].updated, updatedFile[0].lastAccess);
        } else {
          throw new Error(`Você não tem permissão para remover uma permissão do grupo no arquivo`);
        }
      }
    } catch (error) {
      socket
        .emit(channelError, room, error instanceof Error ? error.message : JSON.stringify(error));
    }
  });

  /**
   * ? Evento emitido quando uma permissão é removida do usuário no arquivo
   */
  socket.on('FILE-REMOVE-PERMISSION-USER', async (
    room: string[],
    groupId: PrivilegesSystem[],
    userAuth: string,
    cid: string,
    user: UserId
  ) => {
    const channel = 'FILE-REMOVE-PERMISSION-USER',
      channelSuccess = `${channel}-SUCCESS-${cid}`,
      channelError = `${channel}-ERROR-${cid}`;

    try {
      const
        filesController = new FilesController(),
        usersManagerDB = new UsersManagerDB(),
        files = await filesController.get({ cid }, 0, 1);

      if (files.length <= 0) {
        socket
          .emit(
            channelError,
            room,
            `Arquivo não foi encontrado`
          );
      } else {
        const file = files[0],
          { email } = await usersManagerDB.getInfo(userAuth);

        if (
          groupId.filter(name => file.checkGroupAccess({ name }, 'Security')).length > 0 ||
          file.checkUserAccess({ email }, 'Security')
        ) {
          await filesController.removePermissionInUserId(file.cid || "", { group: { name: 'administrador', permission: 'Security' } }, user, user.permissions);

          const updatedFile = await filesController.get({ cid }, 0, 1);

          if (!updatedFile[0].accessUsersId)
            updatedFile[0].accessUsersId = [];

          io
            .emit(channelSuccess, room, cid, {
              email: user.email,
              permissions: updatedFile[0].accessUsersId.filter(_user => _user.email === user.email)[0].permissions,
            }, updatedFile[0].updated, updatedFile[0].lastAccess);
        } else {
          throw new Error(`Você não tem permissão para remover uma permissão do usuário no arquivo`);
        }
      }
    } catch (error) {
      socket
        .emit(channelError, room, error instanceof Error ? error.message : JSON.stringify(error));
    }
  });

  /**
   * ? Evento emitido quando o arquivo é movido para a lixeira
   */
  socket.on('FILE-MOVE-TO-TRASH', async (
    room: string[],
    groupId: PrivilegesSystem[],
    userAuth: string,
    cid: string
  ) => {
    const channel = 'FILE-MOVE-TO-TRASH',
      channelSuccess = `${channel}-SUCCESS-${cid}`,
      channelError = `${channel}-ERROR-${cid}`;

    try {
      const
        filesController = new FilesController(),
        usersManagerDB = new UsersManagerDB(),
        files = await filesController.get({ cid }, 0, 1);

      if (files.length <= 0) {
        socket
          .emit(
            channelError,
            room,
            `Arquivo não foi encontrado`
          );
      } else {
        const file = files[0],
          { email } = await usersManagerDB.getInfo(userAuth);

        if (
          groupId.filter(name => file.checkGroupAccess({ name }, 'Delete')).length > 0 ||
          file.checkUserAccess({ email }, 'Delete')
        ) {
          await filesController.moveToGarbage(file.cid || "", { group: { name: 'administrador', permission: 'Security' } });

          const updatedFile = await filesController.get({ cid }, 0, 1);

          io
            .emit(channelSuccess, room, cid, updatedFile[0].trash, updatedFile[0].updated, updatedFile[0].lastAccess);
        } else {
          throw new Error(`Você não tem permissão para mover o arquivo para a lixeira`);
        }
      }
    } catch (error) {
      socket
        .emit(channelError, room, error instanceof Error ? error.message : JSON.stringify(error));
    }
  });

  /**
   * ? Evento emitido quando o arquivo é removido da lixeira
   */
  socket.on('FILE-REMOVE-OF-TRASH', async (
    room: string[],
    groupId: PrivilegesSystem[],
    userAuth: string,
    cid: string
  ) => {
    const channel = 'FILE-REMOVE-OF-TRASH',
      channelSuccess = `${channel}-SUCCESS-${cid}`,
      channelError = `${channel}-ERROR-${cid}`;

    try {
      const
        filesController = new FilesController(),
        usersManagerDB = new UsersManagerDB(),
        files = await filesController.get({ cid }, 0, 1);

      if (files.length <= 0) {
        socket
          .emit(
            channelError,
            room,
            `Arquivo não foi encontrado`
          );
      } else {
        const file = files[0],
          { email } = await usersManagerDB.getInfo(userAuth);

        if (
          groupId.filter(name => file.checkGroupAccess({ name }, 'Delete')).length > 0 ||
          file.checkUserAccess({ email }, 'Delete')
        ) {
          await filesController.removeOfGarbage(file.cid || "", { group: { name: 'administrador', permission: 'Security' } });

          const updatedFile = await filesController.get({ cid }, 0, 1);

          io
            .emit(channelSuccess, room, cid, updatedFile[0].updated, updatedFile[0].lastAccess);
        } else {
          throw new Error(`Você não tem permissão para mover o arquivo para a lixeira`);
        }
      }
    } catch (error) {
      socket
        .emit(channelError, room, error instanceof Error ? error.message : JSON.stringify(error));
    }
  });
}