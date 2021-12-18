/**
 * @description Websocket Router -> Hercules Storage -> Folders
 * @author @GuilhermeSantos001
 * @update 13/12/2021
 */

import { Server, Socket } from "socket.io";

import Folders, { responseDataFolder } from '@/controllers/folders';
import Files from '@/controllers/files';
import Users from '@/db/user-db';
import { PrivilegesSystem } from "@/mongo/user-manager-mongo";
import { folderModelInterface, GroupId, UserId } from "@/mongo/folders-manager-mongo";
import { matches } from '@/mongo/files-manager-mongo';
import Privilege from "@/utils/privilege";
import { decompressFromEncodedURIComponent } from "lz-string";

declare interface IItemAppend {
  cid: string
  name: string
  type?: string
  whichIs: 'folder' | 'file'
}

async function getFilesId(folder: folderModelInterface | responseDataFolder) {
  const items: IItemAppend[] = [];

  if (folder.filesId && folder.filesId.length > 0) {

    for (const cid of folder.filesId) {
      const files = await Files.get({ cid }, 0, 1);

      if (files.length > 0) {
        const file = files[0];

        items.push({
          cid: file.cid || "",
          name: file.name,
          type: file.type,
          whichIs: 'file'
        })
      }
    }
  }

  return items;
}

async function getFoldersId(folder: folderModelInterface | responseDataFolder) {
  const items: IItemAppend[] = [];

  if (folder.foldersId && folder.foldersId.length > 0) {

    for (const cid of folder.foldersId) {
      const folders = await Folders.get({ cid }, 0, 1);

      if (folders.length > 0) {
        const folder = folders[0];

        items.push({
          cid: folder.cid || "",
          name: folder.name,
          type: '',
          whichIs: 'folder'
        })
      }
    }
  }

  return items;
}

export default function routerHerculesFile(io: Server, socket: Socket): void {
  /**
   * ? Evento emitido quando uma pasta é criada
   */
  socket.on('CREATE-FOLDER', async (
    room: string[],
    groupId: PrivilegesSystem[],
    userAuth: string,
    // ? Dados da pasta
    name: string,
    description: string,
    tag: string,
    type: string,
  ) => {
    const
      channel = 'CREATE-FOLDER',
      channelError = `${channel}-ERROR`;

    try {
      const
        folderName = String(name).replace(matches.specialCharacters, ' ').replace(/\s{2,}/g, ' '),
        folderDescription = String(description).replace(matches.specialCharacters, ' ').replace(/\s{2,}/g, ' '),
        folderType = String(type).replace(matches.specialCharacters, ' ').replace(/\s{2,}/g, ' '),
        folderTag = String(tag).replace(matches.specialCharacters, ' ').replace(/\s{2,}/g, ' '),
        folders = await Folders.get({
          name: folderName
        }, 0, 1),
        { email } = await Users.getInfo(userAuth);

      if (folders.length <= 0) {
        const folder = await Folders.newFolder({
          room,
          authorId: userAuth,
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
                permissions: ['Append', 'Delete', 'Share', 'Security', 'Protect', 'Block']
              }));

              return data;
            }

            return undefined;
          })(),
          accessUsersId: [
            {
              email,
              permissions: ['Append', 'Delete', 'Share', 'Security', 'Protect', 'Block']
            }
          ],
          name: folderName,
          description: folderDescription,
          permission: ["Append", "Delete", "Share", "Security", "Protect", "Block"],
          status: "Available",
          type: folderType,
          tag: folderTag,
        });

        io
          .emit(
            'FOLDER-RENDER',
            room,
            folder.cid,
            folder.accessGroupId,
            folder.accessUsersId,
            await getFilesId(folder),
            await getFoldersId(folder),
            folder.folderId,
            await folder.getAuthorUsername(),
            await folder.getAuthorEmail(),
            folder.name,
            folder.description,
            folder.tag,
            folder.type,
            folder.createdAt,
            folder.updated,
            folder.lastAccess,
            folder.trash
          );
      } else {
        throw new TypeError(`A pasta já existe!`);
      }
    } catch (error) {
      socket
        .emit(channelError, room, error instanceof TypeError ? error.message : JSON.stringify(error));
    }
  });

  /**
   * ? Evento emitido quando as pastas de um quarto especifico são solicitados
   */
  socket.on('GET-FOLDERS-BY-ROOM', async (
    room: string[],
    groupId: PrivilegesSystem[],
    userAuth: string,
    limit: number,
    folderId?: string,
  ) => {
    const
      channel = 'GET-FOLDERS-BY-ROOM',
      channelError = `${channel}-ERROR`;

    try {
      const folders = await Folders.get({ room: { $all: room }, folderId: { $eq: !folderId ? undefined : folderId } }, 0, limit),
        { email } = await Users.getInfo(userAuth);

      if (folders.length > 0) {
        for (const folder of folders) {
          if (
            groupId.filter(name => folder.checkGroupAccess({ name }, 'Append')).length > 0 ||
            folder.checkUserAccess({ email }, 'Append')
          ) {
            if (folder.inRoom(room)) {
              socket
                .emit(
                  'FOLDER-RENDER',
                  room,
                  folder.cid,
                  folder.accessGroupId,
                  folder.accessUsersId,
                  await getFilesId(folder),
                  await getFoldersId(folder),
                  folder.folderId,
                  await folder.getAuthorUsername(),
                  await folder.getAuthorEmail(),
                  folder.name,
                  folder.description,
                  folder.tag,
                  folder.type,
                  folder.createdAt,
                  folder.updated,
                  folder.lastAccess,
                  folder.trash
                );
            }
          }
        }
      }
    } catch (error) {
      socket
        .emit(channelError, room, error instanceof TypeError ? error.message : JSON.stringify(error));
    }
  });

  /**
   * ? Evento emitido quando uma pasta é solicitada
   */
  socket.on('GET-FOLDER-BY-CID', async (
    room: string[],
    groupId: PrivilegesSystem[],
    userAuth: string,
    cid: string
  ) => {
    const
      channel = 'GET-FOLDER-BY-CID',
      channelError = `${channel}-ERROR`;

    try {
      const folders = await Folders.get({ cid }, 0, 1),
        { email } = await Users.getInfo(userAuth);

      if (folders.length > 0) {
        for (const folder of folders) {
          if (
            groupId.filter(name => folder.checkGroupAccess({ name }, 'Append')).length > 0 ||
            folder.checkUserAccess({ email }, 'Append')
          ) {
            if (folder.inRoom(room)) {
              socket
                .emit(
                  'FOLDER-RENDER',
                  room,
                  folder.cid,
                  folder.accessGroupId,
                  folder.accessUsersId,
                  await getFilesId(folder),
                  await getFoldersId(folder),
                  folder.folderId,
                  await folder.getAuthorUsername(),
                  await folder.getAuthorEmail(),
                  folder.name,
                  folder.description,
                  folder.tag,
                  folder.type,
                  folder.createdAt,
                  folder.updated,
                  folder.lastAccess,
                  folder.trash
                );
            }
          }
        }
      }
    } catch (error) {
      socket
        .emit(channelError, room, error instanceof TypeError ? error.message : JSON.stringify(error));
    }
  });

  /**
   * ? Evento emitido quando o nome da pasta é atualizado
   */
  socket.on('FOLDER-CHANGE-NAME', async (
    room: string[],
    groupId: PrivilegesSystem[],
    userAuth: string,
    cid: string,
    name: string
  ) => {
    const
      channel = `FOLDER-CHANGE-NAME-${cid}`,
      channelSuccess = `${channel}-SUCCESS`,
      channelError = `${channel}-ERROR`;

    try {
      const folders = await Folders.get({ cid }, 0, 1),
        exist = await Folders.get({ name }, 0, 1),
        { email } = await Users.getInfo(userAuth);

      if (folders.length <= 0)
        throw new TypeError(`A pasta não existe!`);

      if (exist.filter(folder => folder.cid !== cid).length > 0)
        throw new TypeError(`Já tem uma pasta com o mesmo nome!`);

      const folder = folders[0];

      if (
        groupId.filter(name => folder.checkGroupAccess({ name }, 'Security')).length > 0 ||
        folder.checkUserAccess({ email }, 'Security')
      ) {
        const newName = String(name).replace(matches.specialCharacters, ' ').replace(/\s{2,}/g, ' ');

        await Folders.update(cid, { group: { name: 'administrador', permission: 'Security' } }, {
          name: newName,
          description: folder.description,
          tag: folder.tag,
          type: folder.type
        });

        io
          .emit(
            channelSuccess,
            room,
            cid,
            newName
          );
      }
    } catch (error) {
      socket
        .emit(channelError, room, error instanceof TypeError ? error.message : JSON.stringify(error));
    }
  });

  /**
   * ? Evento emitido quando a descrição da pasta é atualizada
   */
  socket.on('FOLDER-CHANGE-DESCRIPTION', async (
    room: string[],
    groupId: PrivilegesSystem[],
    userAuth: string,
    cid: string,
    description: string
  ) => {
    const
      channel = `FOLDER-CHANGE-DESCRIPTION-${cid}`,
      channelSuccess = `${channel}-SUCCESS`,
      channelError = `${channel}-ERROR`;

    try {
      const folders = await Folders.get({ cid }, 0, 1),
        { email } = await Users.getInfo(userAuth);

      if (folders.length <= 0)
        throw new TypeError(`A pasta não existe!`);

      const folder = folders[0];

      if (
        groupId.filter(name => folder.checkGroupAccess({ name }, 'Security')).length > 0 ||
        folder.checkUserAccess({ email }, 'Security')
      ) {
        const newDescription = String(description).replace(matches.specialCharacters, ' ').replace(/\s{2,}/g, ' ');

        await Folders.update(cid, { group: { name: 'administrador', permission: 'Security' } }, {
          name: folder.name,
          description: newDescription,
          tag: folder.tag,
          type: folder.type
        });

        io
          .emit(
            channelSuccess,
            socket.id,
            room,
            cid,
            newDescription
          );
      }
    } catch (error) {
      socket
        .emit(channelError, room, error instanceof TypeError ? error.message : JSON.stringify(error));
    }
  });

  /**
   * ? Evento emitido quando a tag da pasta é atualizada
   */
  socket.on('FOLDER-CHANGE-TAG', async (
    room: string[],
    groupId: PrivilegesSystem[],
    userAuth: string,
    cid: string,
    tag: string
  ) => {
    const
      channel = `FOLDER-CHANGE-TAG-${cid}`,
      channelSuccess = `${channel}-SUCCESS`,
      channelError = `${channel}-ERROR`;

    try {
      const folders = await Folders.get({ cid }, 0, 1),
        { email } = await Users.getInfo(userAuth);

      if (folders.length <= 0)
        throw new TypeError(`A pasta não existe!`);

      const folder = folders[0];

      if (
        groupId.filter(name => folder.checkGroupAccess({ name }, 'Security')).length > 0 ||
        folder.checkUserAccess({ email }, 'Security')
      ) {
        const newTag = String(tag).replace(matches.specialCharacters, ' ').replace(/\s{2,}/g, ' ');

        await Folders.update(cid, { group: { name: 'administrador', permission: 'Security' } }, {
          name: folder.name,
          description: folder.description,
          tag: newTag,
          type: folder.type
        });

        io
          .emit(
            channelSuccess,
            room,
            cid,
            newTag
          );
      }
    } catch (error) {
      socket
        .emit(channelError, room, error instanceof TypeError ? error.message : JSON.stringify(error));
    }
  });

  /**
   * ? Evento emitido quando o tipo da pasta é atualizado
   */
  socket.on('FOLDER-CHANGE-TYPE', async (
    room: string[],
    groupId: PrivilegesSystem[],
    userAuth: string,
    cid: string,
    type: string
  ) => {
    const
      channel = `FOLDER-CHANGE-TYPE-${cid}`,
      channelSuccess = `${channel}-SUCCESS`,
      channelError = `${channel}-ERROR`;

    try {
      const folders = await Folders.get({ cid }, 0, 1),
        { email } = await Users.getInfo(userAuth);

      if (folders.length <= 0)
        throw new TypeError(`A pasta não existe!`);

      const folder = folders[0];

      if (
        groupId.filter(name => folder.checkGroupAccess({ name }, 'Security')).length > 0 ||
        folder.checkUserAccess({ email }, 'Security')
      ) {
        const newType = String(type).replace(matches.specialCharacters, ' ').replace(/\s{2,}/g, ' ');

        await Folders.update(cid, { group: { name: 'administrador', permission: 'Security' } }, {
          name: folder.name,
          description: folder.description,
          tag: folder.tag,
          type: newType
        });

        io
          .emit(
            channelSuccess,
            room,
            cid,
            newType
          );
      }
    } catch (error) {
      socket
        .emit(channelError, room, error instanceof TypeError ? error.message : JSON.stringify(error));
    }
  });

  /**
   * ? Evento emitido quando um item é adicionado na pasta
   */
  socket.on('FOLDER-APPEND-ITEMS', async (
    room: string[],
    groupId: PrivilegesSystem[],
    userAuth: string,
    cid: string,
    data: string
  ) => {
    const
      channel = `FOLDER-APPEND-ITEMS-${cid}`,
      channelSuccess = `${channel}-SUCCESS`,
      channelError = `${channel}-ERROR`;
    try {
      const folders = await Folders.get({ cid }, 0, 1),
        { email } = await Users.getInfo(userAuth);

      if (folders.length <= 0)
        throw new TypeError(`A pasta não existe!`);

      const folder = folders[0];

      if (
        groupId.filter(name => folder.checkGroupAccess({ name }, 'Append')).length > 0 ||
        folder.checkUserAccess({ email }, 'Append')
      ) {
        const items: { cid: string, whichIs: 'folder' | 'file' }[] = JSON.parse(decompressFromEncodedURIComponent(data || "") || "");

        if (items.length <= 0)
          throw new TypeError(`Não há pastas/arquivos a serem adicionados.`);

        for (const item of items) {
          if (item.whichIs === 'folder') {
            await Folders.push(cid, { group: { name: 'administrador', permission: 'Append' } }, item.cid);
          } else if (item.whichIs === 'file') {
            await Folders.append(cid, { group: { name: 'administrador', permission: 'Append' } }, item.cid, {
              group: {
                name: 'administrador',
                permission: 'Security'
              }
            });
          } else {
            throw new TypeError(`Não foi possível adicionar os itens.`);
          }
        }

        io
          .emit(
            channelSuccess,
            room,
            cid,
            data
          );
      }
    } catch (error) {
      socket
        .emit(channelError, room, error instanceof TypeError ? error.message : JSON.stringify(error));
    }
  });

  /**
   * ? Evento emitido quando um item é removido da pasta
   */
  socket.on('FOLDER-SPLICE-ITEMS', async (
    room: string[],
    groupId: PrivilegesSystem[],
    userAuth: string,
    cid: string,
    data: string
  ) => {
    const
      channel = `FOLDER-SPLICE-ITEMS-${cid}`,
      channelSuccess = `${channel}-SUCCESS`,
      channelError = `${channel}-ERROR`;
    try {
      const folders = await Folders.get({ cid }, 0, 1),
        { email } = await Users.getInfo(userAuth);

      if (folders.length <= 0)
        throw new TypeError(`A pasta não existe!`);

      const folder = folders[0];

      if (
        groupId.filter(name => folder.checkGroupAccess({ name }, 'Append')).length > 0 ||
        folder.checkUserAccess({ email }, 'Append')
      ) {
        const items: { cid: string, whichIs: 'folder' | 'file' }[] = JSON.parse(decompressFromEncodedURIComponent(data || "") || "");

        if (items.length <= 0)
          throw new TypeError(`Não há pastas/arquivos a serem removidos.`);

        for (const item of items) {
          if (item.whichIs === 'folder') {
            await Folders.splice(cid, { group: { name: 'administrador', permission: 'Append' } }, item.cid);
          } else if (item.whichIs === 'file') {
            await Folders.remove(cid, { group: { name: 'administrador', permission: 'Append' } }, item.cid, {
              group: {
                name: 'administrador',
                permission: 'Security'
              }
            });
          } else {
            throw new TypeError(`Não foi possível remover os itens.`);
          }
        }

        io
          .emit(
            channelSuccess,
            room,
            cid,
            data
          );
      }
    } catch (error) {
      socket
        .emit(channelError, room, error instanceof TypeError ? error.message : JSON.stringify(error));
    }
  });
}