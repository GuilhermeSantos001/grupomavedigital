/**
 * @description Websocket Router -> Storage Hercules
 * @author @GuilhermeSantos001
 * @update 29/09/2021
 */

import { Server, Socket } from "socket.io";
import { compressToEncodedURIComponent, decompressFromEncodedURIComponent } from "lz-string";

// import { fileInterface } from '@/mongo/files-manager-mongo';
import { folderInterface } from "@/mongo/folders-manager-mongo";
import FileController from '@/controllers/files';
import FolderController from '@/controllers/folders';
// import userDB from '@/db/user-db';
// import Jobs from '@/core/jobs';

export default function WebSocketRouterHerculesStorage(io: Server, socket: Socket): void {
  const
    getItem = async (cid: string, type: string) => {
      let item: any = [];

      if (type === 'folder') {
        item = await FolderController.get({ cid }, 0, 1);
      } else if (type === 'file') {
        item = await FileController.get({ cid }, 0, 1);
      }

      return item.length > 0 ? item[0] : false;
    },
    getPermission = (permission: any, value: any) => {
      if (Object.keys(permission).includes('privilege')) {
        return { group: { name: Object.values(permission)[0], permission: value } };
      } else if (Object.keys(permission).includes('email')) {
        return { user: { email: Object.values(permission)[0], permission: value } };
      }
    },
    updateItem = async (cid: string, type: string) => {
      const item = await getItem(cid, type);

      io.emit('ITEM-UPDATE',
        compressToEncodedURIComponent(item.cid),
        compressToEncodedURIComponent(JSON.stringify(item))
      );

      return item;
    };

  /**
   * @description Eventos de transmissão para todos os ouvintes
   */
  socket.on('GLOBAL', async (channel: string, args: string[]) => {
    if (channel === 'APPEND-ITEM') {
      const
        cid = decompressFromEncodedURIComponent(args[0]) || "",
        type = decompressFromEncodedURIComponent(args[1]) || "";

      const item = await getItem(cid, type);

      if (item) {
        io.emit(channel,
          compressToEncodedURIComponent(JSON.stringify(item)),
          compressToEncodedURIComponent(type)
        );
      }
    }

    if (channel === 'ITEM-UPDATE-AND-UPDATE-VERSION') {
      const
        cid = decompressFromEncodedURIComponent(args[0]) || "",
        type = decompressFromEncodedURIComponent(args[1]) || "";

      const item = await getItem(cid, type);

      if (item) {
        io.emit('ITEM-UPDATE',
          compressToEncodedURIComponent(item.cid),
          compressToEncodedURIComponent(JSON.stringify(item))
        );

        io.emit('ITEM-CHANGE-WITH-PRIVILEGE',
          compressToEncodedURIComponent(cid),
          compressToEncodedURIComponent(JSON.stringify(item)),
          compressToEncodedURIComponent('available'),
        );

        io.emit('UPDATE-VERSION',
          compressToEncodedURIComponent(item.cid),
          compressToEncodedURIComponent(String(item.history.length)),
          compressToEncodedURIComponent(String(item.version))
        );
      }
    }

    if (channel === 'ITEM-UPDATE-AND-APPEND') {
      const
        cid = decompressFromEncodedURIComponent(args[0]) || "",
        type = decompressFromEncodedURIComponent(args[1]) || "";

      const item = await getItem(cid, type);

      if (item) {
        io.emit('ITEM-UPDATE',
          compressToEncodedURIComponent(item.cid),
          compressToEncodedURIComponent(JSON.stringify(item))
        );

        io.emit('APPEND-ITEM',
          compressToEncodedURIComponent(JSON.stringify(item)),
          compressToEncodedURIComponent(type)
        );
      }
    }
  });

  /**
   * @description Eventos de transmissão para todos os ouvintes exceto o remetente
   */
  socket.on('BROADCAST', async (channel: string, args: string[]) => {
    if (channel === 'ITEM-BUSY') {
      const
        cid = decompressFromEncodedURIComponent(args[0]) || "";

      return socket.broadcast.emit('ITEM-BUSY-HOLD', compressToEncodedURIComponent(cid));
    }
  });

  /**
   * @description Cria o arquivo
   */
  socket.on('CREATE-FILE', async (args: string[]) => {
    try {
      const {
        authorId,
        email,
        name,
        description,
        type,
        tag,
      } = JSON.parse(decompressFromEncodedURIComponent(args[0]) || "");

      const
        file = await FileController.newFile({
          authorId,
          permission: ['Write', 'Read', 'Delete', 'Protect', 'Share', 'Security', 'Block'],
          name,
          description,
          type,
          tag,
          status: 'Available'
        });

      const userId: any = { email, permissions: ["Write", "Read", "Delete", "Protect", "Share", "Security", "Block"] };

      await FileController.insertUserId(file.cid || "", { group: { name: "administrador", permission: "Security" } }, userId);

      file.accessUsersId?.push(userId);

      socket.emit('CREATE-FILE-SUCCESS', compressToEncodedURIComponent(JSON.stringify(file)));
    } catch (error: any) {
      socket.emit('CREATE-FILE-ERROR', compressToEncodedURIComponent(JSON.stringify(error.message || error)));
    }
  });

  /**
   * @description Atualiza as informações do arquivo
   */
  socket.on('UPDATE-FILE', async (args: string[]) => {
    try {
      const
        cid = decompressFromEncodedURIComponent(args[0]) || "",
        permission = JSON.parse(decompressFromEncodedURIComponent(args[1]) || ""),
        data = JSON.parse(decompressFromEncodedURIComponent(args[2]) || "");

      const usr_permission: any = getPermission(permission, "Write");

      if (!usr_permission)
        throw new Error(`Você não tem permissão para executar essa tarefa.`);

      await FileController.update(cid, usr_permission, {
        name: data.name,
        description: data.description,
        tag: data.tag
      });

      socket.emit('UPDATE-FILE-SUCCESS',
        compressToEncodedURIComponent(cid),
        compressToEncodedURIComponent(data.name),
        compressToEncodedURIComponent(data.description),
        compressToEncodedURIComponent(data.tag)
      );
    } catch (error: any) {
      socket.emit('UPDATE-FILE-ERROR', compressToEncodedURIComponent(JSON.stringify(error.message || error)));
    }
  });

  /**
   * @description Cria a pasta
   */
  socket.on('CREATE-FOLDER', async (args: string[]) => {
    const {
      authorId,
      email,
      name,
      description,
      type,
      tag,
    } = JSON.parse(decompressFromEncodedURIComponent(args[0]) || "");

    try {
      const
        folder = await FolderController.newFolder({
          authorId,
          name,
          description,
          permission: ["Append", "Delete", "Share", "Protect", "Security", "Block"],
          tag,
          type,
          status: "Available"
        }),
        response: folderInterface = {
          cid: folder.cid,
          authorId: folder.authorId,
          accessGroupId: folder.accessGroupId,
          accessUsersId: folder.accessUsersId,
          name: folder.name,
          description: folder.description,
          status: folder.status,
          type: folder.type,
          tag: folder.tag,
          permission: folder.permission,
          filesId: folder.filesId,
          foldersId: folder.foldersId,
          folderId: folder.folderId,
          share: folder.share,
          protect: folder.protect,
          block: folder.block,
          trash: folder.trash,
          recycle: folder.recycle,
          updated: folder.updated,
          lastAccess: folder.lastAccess,
          createdAt: folder.createdAt
        };

      await FolderController.insertUserId(response.cid || "", { group: { name: "administrador", permission: "Security" } }, { email, permissions: ["Append", "Delete", "Protect", "Share", "Security", "Block"] });

      socket.emit('CREATE-FOLDER-SUCCESS', compressToEncodedURIComponent(JSON.stringify(response)));
    } catch (error: any) {
      socket.emit('CREATE-FOLDER-ERROR', compressToEncodedURIComponent(JSON.stringify(error.message || error)), compressToEncodedURIComponent(name));
    }
  });

  /**
   * @description Adiciona um novo grupo a whitelist do aquivo/pasta
   */
  socket.on('WHITELIST-GROUP-UPDATE', async (args: string[]) => {
    try {
      const
        cid = decompressFromEncodedURIComponent(args[0]) || "",
        permission = JSON.parse(decompressFromEncodedURIComponent(args[1]) || ""),
        type = decompressFromEncodedURIComponent(args[2]) || "",
        groupName = decompressFromEncodedURIComponent(args[3]) || "",
        permissions = JSON.parse(decompressFromEncodedURIComponent(args[4]) || "");

      const group: any = { name: groupName, permissions };

      const usr_permission: any = getPermission(permission, "Security");

      if (!usr_permission)
        throw new Error(`Você não tem permissão para executar essa tarefa.`);

      if (type === 'folder') {
        await FolderController.insertGroupId(cid, usr_permission, group);
      } else if (type === 'file') {
        await FileController.insertGroupId(cid, usr_permission, group);
      }

      const item = await updateItem(cid, type);

      io.emit('ITEM-CHANGE-WITH-PRIVILEGE',
        compressToEncodedURIComponent(cid),
        compressToEncodedURIComponent(JSON.stringify(item)),
        compressToEncodedURIComponent('available'),
      );

      io.emit('WHITELIST-GROUP-UPDATE-SUCCESS', compressToEncodedURIComponent(cid), compressToEncodedURIComponent(groupName), compressToEncodedURIComponent(JSON.stringify(group)));
    } catch (error: any) {
      socket.emit('WHITELIST-GROUP-UPDATE-ERROR', compressToEncodedURIComponent(JSON.stringify(error.message || error)));
    }
  });

  /**
   * @description Adiciona um novo email a whitelist de usuários do arquivo/pasta
   */
  socket.on('WHITELIST-USER-UPDATE', async (args: string[]) => {
    try {
      const
        cid = decompressFromEncodedURIComponent(args[0]) || "",
        permission = JSON.parse(decompressFromEncodedURIComponent(args[1]) || ""),
        type = decompressFromEncodedURIComponent(args[2]) || "",
        userEmail = decompressFromEncodedURIComponent(args[3]) || "",
        permissions = JSON.parse(decompressFromEncodedURIComponent(args[4]) || "");

      const userId: any = { email: userEmail, permissions };

      const usr_permission: any = getPermission(permission, "Security");

      if (!usr_permission)
        throw new Error(`Você não tem permissão para executar essa tarefa.`);

      if (type === 'folder') {
        await FolderController.insertUserId(cid, usr_permission, userId);
      } else if (type === 'file') {
        await FileController.insertUserId(cid, usr_permission, userId);
      }

      const item = await updateItem(cid, type);

      io.emit('ITEM-CHANGE-WITH-PRIVILEGE',
        compressToEncodedURIComponent(cid),
        compressToEncodedURIComponent(JSON.stringify(item)),
        compressToEncodedURIComponent('available'),
      );

      io.emit('WHITELIST-USER-UPDATE-SUCCESS', compressToEncodedURIComponent(cid), compressToEncodedURIComponent(JSON.stringify(userId)));
    } catch (error: any) {
      socket.emit('WHITELIST-USER-UPDATE-ERROR', compressToEncodedURIComponent(JSON.stringify(error.message || error)));
    }
  });

  /**
   * @description Remove um grupo da whitelist do arquivo/pasta
   */
  socket.on('WHITELIST-GROUP-REMOVE', async (args: string[]) => {
    try {
      const
        cid = decompressFromEncodedURIComponent(args[0]) || "",
        permission = JSON.parse(decompressFromEncodedURIComponent(args[1]) || ""),
        type = decompressFromEncodedURIComponent(args[2]) || "",
        itemsId = decompressFromEncodedURIComponent(args[3]) || "",
        groupsName = JSON.parse(decompressFromEncodedURIComponent(args[4]) || "");

      const usr_permission: any = getPermission(permission, "Security");

      if (!usr_permission)
        throw new Error(`Você não tem permissão para executar essa tarefa.`);

      for (const groupName of groupsName) {
        const group: any = { name: groupName };

        if (type === 'folder') {
          await FolderController.removeGroupId(cid, usr_permission, group);
        } else if (type === 'file') {
          await FileController.removeGroupId(cid, usr_permission, group);
        }
      }

      const item = await updateItem(cid, type);

      io.emit('ITEM-CHANGE-WITH-PRIVILEGE',
        compressToEncodedURIComponent(cid),
        compressToEncodedURIComponent(JSON.stringify(item)),
        compressToEncodedURIComponent('available'),
      );

      io.emit('WHITELIST-GROUP-REMOVE-SUCCESS', compressToEncodedURIComponent(socket.id), compressToEncodedURIComponent(cid), compressToEncodedURIComponent(itemsId), compressToEncodedURIComponent(JSON.stringify(groupsName)));
    } catch (error: any) {
      socket.emit('WHITELIST-GROUP-REMOVE-ERROR', compressToEncodedURIComponent(JSON.stringify(error.message || error)));
    }
  });

  /**
   * @description Remove o email da whitelist de usuários do arquivo/pasta
   */
  socket.on('WHITELIST-USER-REMOVE', async (args: string[]) => {
    try {
      const
        cid = decompressFromEncodedURIComponent(args[0]) || "",
        permission = JSON.parse(decompressFromEncodedURIComponent(args[1]) || ""),
        type = decompressFromEncodedURIComponent(args[2]) || "",
        itemsId = decompressFromEncodedURIComponent(args[3]) || "",
        usersEmail = JSON.parse(decompressFromEncodedURIComponent(args[4]) || "");

      const usr_permission: any = getPermission(permission, "Security");

      if (!usr_permission)
        throw new Error(`Você não tem permissão para executar essa tarefa.`);

      for (const userEmail of usersEmail) {
        const user: any = { email: userEmail };

        if (type === 'folder') {
          await FolderController.removeUserId(cid, usr_permission, user);
        } else if (type === 'file') {
          await FileController.removeUserId(cid, usr_permission, user);
        }
      }

      const item = await updateItem(cid, type);

      io.emit('ITEM-CHANGE-WITH-PRIVILEGE',
        compressToEncodedURIComponent(cid),
        compressToEncodedURIComponent(JSON.stringify(item)),
        compressToEncodedURIComponent('available'),
      );

      io.emit('WHITELIST-USER-REMOVE-SUCCESS', compressToEncodedURIComponent(socket.id), compressToEncodedURIComponent(cid), compressToEncodedURIComponent(itemsId), compressToEncodedURIComponent(JSON.stringify(usersEmail)));
    } catch (error: any) {
      socket.emit('WHITELIST-USER-REMOVE-ERROR', compressToEncodedURIComponent(JSON.stringify(error.message || error)));
    }
  });

  /**
   * @description Move pasta/arquivo para a lixeira.
   */
  socket.on('MOVE-TO-TRASH', async (args: string[]) => {
    const
      cid = decompressFromEncodedURIComponent(args[0]) || "",
      permission = JSON.parse(decompressFromEncodedURIComponent(args[1]) || ""),
      type = decompressFromEncodedURIComponent(args[2]) || "",
      key = decompressFromEncodedURIComponent(args[3]) || "";

    try {
      const usr_permission: any = getPermission(permission, "Delete");

      if (!usr_permission)
        throw new Error(`Você não tem permissão para executar essa tarefa.`);

      if (type === 'file') {
        await FileController.moveToGarbage(cid, usr_permission);
      } else if (type === 'folder') {
        await FolderController.moveToGarbage(cid, usr_permission, usr_permission);
      } else {
        throw new Error(`O tipo(${type}) não está valido. Fale com o administrador do sistema`);
      }

      const item = await updateItem(cid, type);

      io.emit('ITEM-CHANGE-WITH-PRIVILEGE',
        compressToEncodedURIComponent(cid),
        compressToEncodedURIComponent(JSON.stringify(item)),
        compressToEncodedURIComponent('trash'),
      );

      io.emit('MOVE-TO-TRASH-SUCCESS', compressToEncodedURIComponent(socket.id), compressToEncodedURIComponent(key), compressToEncodedURIComponent(cid), compressToEncodedURIComponent(type));
    } catch (error: any) {
      socket.emit('MOVE-TO-TRASH-ERROR', compressToEncodedURIComponent(JSON.stringify(error.message || error)), compressToEncodedURIComponent(cid), compressToEncodedURIComponent(key));
      socket.broadcast.emit('ITEM-BUSY-RELEASE', compressToEncodedURIComponent(cid), compressToEncodedURIComponent('available'));
    }
  });

  /**
   * @description Recupera a pasta/arquivo da lixeira.
   */
  socket.on('TRASH-RECOVERY', async (args: string[]) => {
    const
      cid = decompressFromEncodedURIComponent(args[0]) || "",
      permission = JSON.parse(decompressFromEncodedURIComponent(args[1]) || ""),
      type = decompressFromEncodedURIComponent(args[2]) || "";

    try {
      const usr_permission: any = getPermission(permission, "Delete");

      if (!usr_permission)
        throw new Error(`Você não tem permissão para executar essa tarefa.`);

      if (type === 'file') {
        await FileController.removeOfGarbage(cid, usr_permission);
      } else if (type === 'folder') {
        await FolderController.removeOfGarbage(cid, usr_permission, usr_permission);
      } else {
        throw new Error(`O tipo(${type}) não está valido. Fale com o administrador do sistema`);
      }

      const item = await updateItem(cid, type);

      io.emit('ITEM-CHANGE-WITH-PRIVILEGE',
        compressToEncodedURIComponent(cid),
        compressToEncodedURIComponent(JSON.stringify(item)),
        compressToEncodedURIComponent('available'),
      );

      io.emit('TRASH-RECOVERY-SUCCESS', compressToEncodedURIComponent(socket.id), compressToEncodedURIComponent(cid), compressToEncodedURIComponent(type));
    } catch (error: any) {
      socket.emit('TRASH-RECOVERY-ERROR', compressToEncodedURIComponent(JSON.stringify(error.message || error)), compressToEncodedURIComponent(cid));
      socket.broadcast.emit('ITEM-BUSY-RELEASE', compressToEncodedURIComponent(cid), compressToEncodedURIComponent('trash'));
    }
  });

  /**
   * @description Remove a versão do arquivo
   */
  socket.on('FILE-VERSION-REMOVE', async (args: string[]) => {
    const
      cid = decompressFromEncodedURIComponent(args[0]) || "",
      permission = JSON.parse(decompressFromEncodedURIComponent(args[1]) || ""),
      versions = JSON.parse(decompressFromEncodedURIComponent(args[2]) || "");

    try {
      const usr_permission: any = getPermission(permission, "Delete");

      if (!usr_permission)
        throw new Error(`Você não tem permissão para executar essa tarefa.`);

      await FileController.remove(cid, usr_permission, versions);

      const item = await updateItem(cid, 'file');

      io.emit('FILE-VERSION-REMOVE-SUCCESS', compressToEncodedURIComponent(cid), compressToEncodedURIComponent(JSON.stringify(versions)));

      io.emit('UPDATE-VERSION',
        compressToEncodedURIComponent(item.cid),
        compressToEncodedURIComponent(String(item.history.length)),
        compressToEncodedURIComponent(String(item.version))
      );

      io.emit('ITEM-CHANGE-WITH-PRIVILEGE',
        compressToEncodedURIComponent(cid),
        compressToEncodedURIComponent(JSON.stringify(item)),
        compressToEncodedURIComponent('available'),
      );

      socket.broadcast.emit('ITEM-BUSY-RELEASE', compressToEncodedURIComponent(cid), compressToEncodedURIComponent('available'));
    } catch (error: any) {
      socket.emit('FILE-VERSION-REMOVE-ERROR', compressToEncodedURIComponent(JSON.stringify(error.message || error)), compressToEncodedURIComponent(cid));
      socket.broadcast.emit('ITEM-BUSY-RELEASE', compressToEncodedURIComponent(cid), compressToEncodedURIComponent('available'));
    }
  });

  /**
   * @description Move o arquivo para a pasta
   */
  socket.on('MOVE-FILE-FOR-FOLDER', async (args: string[]) => {
    const
      cid_file = decompressFromEncodedURIComponent(args[0]) || "",
      cid_folder = decompressFromEncodedURIComponent(args[1]) || "",
      permissionFolder = JSON.parse(decompressFromEncodedURIComponent(args[2]) || ""),
      permissionFile = JSON.parse(decompressFromEncodedURIComponent(args[3]) || "");

    try {
      const
        folder_permission: any = getPermission(permissionFolder, "Append"),
        file_permission: any = getPermission(permissionFile, "Write");

      if (!folder_permission || !file_permission)
        throw new Error(`Você não tem permissão para executar essa tarefa.`);

      await FolderController.append(cid_folder, folder_permission, cid_file, file_permission);

      const
        file = await updateItem(cid_file, 'file'),
        folder = await updateItem(cid_folder, 'folder');

      io.emit('MOVE-FILE-FOR-FOLDER-SUCCESS', compressToEncodedURIComponent(socket.id), compressToEncodedURIComponent(JSON.stringify(file)), compressToEncodedURIComponent(JSON.stringify(folder)), compressToEncodedURIComponent(JSON.stringify(false)));
    } catch (error: any) {
      socket.emit('MOVE-FILE-FOR-FOLDER-ERROR', compressToEncodedURIComponent(JSON.stringify(error.message || error)), compressToEncodedURIComponent(cid_file));
      socket.broadcast.emit('ITEM-BUSY-RELEASE', compressToEncodedURIComponent(cid_file), compressToEncodedURIComponent('available'));
    }
  });

  /**
   * @description Move a pasta para a pasta
   */
  socket.on('MOVE-FOLDER-FOR-FOLDER', async (args: string[]) => {
    const
      cid_folderSecondary = decompressFromEncodedURIComponent(args[0]) || "",
      cid_folderPrimary = decompressFromEncodedURIComponent(args[1]) || "",
      permission = JSON.parse(decompressFromEncodedURIComponent(args[2]) || "");

    try {
      const
        usr_permission: any = getPermission(permission, "Append");

      if (!usr_permission)
        throw new Error(`Você não tem permissão para executar essa tarefa.`);

      await FolderController.push(cid_folderPrimary, usr_permission, cid_folderSecondary);

      const
        folderSecondary = await updateItem(cid_folderSecondary, 'folder'),
        folderPrimary = await updateItem(cid_folderPrimary, 'folder');

      io.emit('MOVE-FOLDER-FOR-FOLDER-SUCCESS', compressToEncodedURIComponent(socket.id), compressToEncodedURIComponent(JSON.stringify(folderSecondary)), compressToEncodedURIComponent(JSON.stringify(folderPrimary)), compressToEncodedURIComponent(JSON.stringify(false)));
    } catch (error: any) {
      socket.emit('MOVE-FOLDER-FOR-FOLDER-ERROR', compressToEncodedURIComponent(JSON.stringify(error.message || error)), compressToEncodedURIComponent(cid_folderSecondary));
      socket.broadcast.emit('ITEM-BUSY-RELEASE', compressToEncodedURIComponent(cid_folderSecondary), compressToEncodedURIComponent('available'));
    }
  });

  /**
   * @description Retira a associação do arquivo há pasta
   */
  socket.on('MOVE-FILE-FOR-PUBLIC', async (args: string[]) => {
    const
      cid = decompressFromEncodedURIComponent(args[0]) || "",
      permission = JSON.parse(decompressFromEncodedURIComponent(args[1]) || "");

    try {
      const
        usr_permission: any = getPermission(permission, "Delete");

      if (!usr_permission)
        throw new Error(`Você não tem permissão para executar essa tarefa.`);

      const item = await getItem(cid, 'file');

      if (!item.folderId)
        throw new Error(`Arquivo(${item.name}${item.type}) não está associado há uma pasta.`);

      await FolderController.remove(item.folderId, { group: { name: "administrador", permission: "Delete" } }, cid, usr_permission);

      const
        file = await updateItem(cid, 'file'),
        folder = await updateItem(item.folderId, 'folder');

      io.emit('MOVE-FILE-FOR-FOLDER-SUCCESS', compressToEncodedURIComponent(socket.id), compressToEncodedURIComponent(JSON.stringify(file)), compressToEncodedURIComponent(JSON.stringify(folder)), compressToEncodedURIComponent(JSON.stringify(true)));
    } catch (error: any) {
      socket.emit('MOVE-FILE-FOR-FOLDER-ERROR', compressToEncodedURIComponent(JSON.stringify(error.message || error)), compressToEncodedURIComponent(cid));
      socket.broadcast.emit('ITEM-BUSY-RELEASE', compressToEncodedURIComponent(cid), compressToEncodedURIComponent('available'));
    }
  });

  /**
   * @description Retira a associação da pasta com outra pasta
   */
  socket.on('MOVE-FOLDER-FOR-PUBLIC', async (args: string[]) => {
    const
      cid = decompressFromEncodedURIComponent(args[0]) || "",
      permission = JSON.parse(decompressFromEncodedURIComponent(args[1]) || "");

    try {
      const
        usr_permission: any = getPermission(permission, "Append");

      if (!usr_permission)
        throw new Error(`Você não tem permissão para executar essa tarefa.`);

      const item = await getItem(cid, 'folder');

      if (!item.folderId)
        throw new Error(`Pasta(${item.name}) não está associada há uma pasta.`);

      await FolderController.splice(item.folderId, usr_permission, cid);

      const
        folderSecondary = await updateItem(cid, 'folder'),
        folderPrimary = await updateItem(item.folderId, 'folder');

      io.emit('MOVE-FOLDER-FOR-FOLDER-SUCCESS', compressToEncodedURIComponent(socket.id), compressToEncodedURIComponent(JSON.stringify(folderSecondary)), compressToEncodedURIComponent(JSON.stringify(folderPrimary)), compressToEncodedURIComponent(JSON.stringify(true)));
    } catch (error: any) {
      socket.emit('MOVE-FOLDER-FOR-FOLDER-ERROR', compressToEncodedURIComponent(JSON.stringify(error.message || error)), compressToEncodedURIComponent(cid));
      socket.broadcast.emit('ITEM-BUSY-RELEASE', compressToEncodedURIComponent(cid), compressToEncodedURIComponent('available'));
    }
  });
}