/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable no-async-promise-executor */
/**
 * @description Gerenciamento de pastas
 * @author GuilhermeSantos001
 * @update 25/11/2021
 */

import { GroupId, UserId, folderInterface, folderModelInterface } from '@/mongo/folders-manager-mongo';
import FolderManagerDB, { Access } from '@/db/folders-db';
import { Access as AccessFile, BlockVerify } from '@/db/files-db';
import { FilterQuery } from 'mongoose';

export interface responseDataFolder extends folderInterface, Pick<folderModelInterface, 'checkGroupAccess' | 'checkUserAccess' | 'inRoom' | 'getAuthorUsername' | 'getAuthorEmail'> { }

class FolderController {
    /**
     * @description Fecha a pasta após interação
     * @param cid {String} - CustomId da pasta
     * @param access {Access} - Propriedades do acesso
     */
    private async closeAfterInteraction(cid: string, access: Access): Promise<void> {
        return new Promise(async (resolve, reject) => {
            try {
                await FolderManagerDB.close(cid, access);

                resolve();
            } catch (error: any) {
                reject(error.message);
            }
        });
    }

    /**
     * @description Retorna uma lista de pastas
     * @param filter {Object} - Filtro Aplicado na busca
     * @param skip {Number} - Pular x itens iniciais no banco de dados
     * @param limit {Number} - Limite de itens a serem retornados
     */
    public get(filter: FilterQuery<folderModelInterface>, skip: number, limit: number): Promise<responseDataFolder[]> {
        return new Promise(async (resolve, reject) => {
            try {
                const folders = await FolderManagerDB.get(filter, skip, limit);

                resolve(folders.map(folder => {
                    return {
                        cid: folder.cid,
                        room: folder.room,
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
                        assignees: folder.assignees,
                        order: folder.order,
                        updated: folder.updated,
                        lastAccess: folder.lastAccess,
                        createdAt: folder.createdAt,
                        checkGroupAccess: folder.checkGroupAccess,
                        checkUserAccess: folder.checkUserAccess,
                        inRoom: folder.inRoom,
                        getAuthorEmail: folder.getAuthorEmail,
                        getAuthorUsername: folder.getAuthorUsername
                    };
                }));
            } catch (error: any) {
                reject(error.message);
            }
        });
    }

    /**
     * @description Armazena a pasta
     * @param folder {folderInterface} - Propriedades da pasta.
     */
    public async newFolder(folder: folderInterface): Promise<folderModelInterface> {
        return new Promise(async (resolve, reject) => {
            try {
                resolve(await FolderManagerDB.save(folder));
            } catch (error: any) {
                reject(error.message);
            }
        });
    }

    /**
     * @description Retorna o nome da pasta
     * @param cid {String} - CustomId da pasta
     */
    public async name(cid: string): Promise<string> {
        return await FolderManagerDB.name(cid);
    }

    /**
     * @description Remove a pasta.
     * @param cid {String} - CustomId da pasta
     * @param access {access} - Propriedades do acesso para pastas
     * @param accessFile {accessFile} - Propriedades do acesso para arquivos
     */
    public delete(cid: string, access: Access, accessFile: AccessFile) {
        return new Promise<boolean>(async (resolve, reject) => {
            try {
                await FolderManagerDB.delete(cid, access, accessFile);

                resolve(true);
            } catch (error: any) {
                this.closeAfterInteraction(cid, access)
                    .then(() => reject(error.message))
                    .catch(_error => reject(_error));
            }
        });
    }

    /**
     * @description Atualiza as propriedades da pasta
     * @param cid {String} - CustomId da pasta
     * @param access {Access} - Propriedades do acesso para pastas
     * @param props {Pick<folderInterface, 'name' | 'description' | 'tag' | 'type'>} - Propriedades a serem atualizadas
     */
    public update(cid: string, access: Access, props: Pick<folderInterface, 'name' | 'description' | 'tag' | 'type'>) {
        return new Promise<boolean>(async (resolve, reject) => {
            try {
                await FolderManagerDB.update(cid, access, props);
                await FolderManagerDB.close(cid, access);

                resolve(true);
            } catch (error: any) {
                this.closeAfterInteraction(cid, access)
                    .then(() => reject(error.message))
                    .catch(_error => reject(_error));
            }
        });
    }

    /**
     * @description Adiciona o grupo na whitelist da pasta.
     * @param cid {String} - CustomId da pasta
     * @param access {Access} - Propriedades do acesso
     * @param group {GroupId} - Grupo do usuário
     */
    public insertGroupId(cid: string, access: Access, group: GroupId) {
        return new Promise<boolean>(async (resolve, reject) => {
            try {
                await FolderManagerDB.addGroupId(cid, access, group);
                await FolderManagerDB.close(cid, access);

                resolve(true);
            } catch (error: any) {
                this.closeAfterInteraction(cid, access)
                    .then(() => reject(error.message))
                    .catch(_error => reject(_error));
            }
        });
    }

    /**
     * @description Remove o grupo da whitelist da pasta.
     * @param cid {String} - CustomId da pasta
     * @param access {Access} - Propriedades do acesso
     * @param group {GroupId} - Grupo do usuário
     */
    public removeGroupId(cid: string, access: Access, group: GroupId) {
        return new Promise<boolean>(async (resolve, reject) => {
            try {
                await FolderManagerDB.removeGroupId(cid, access, group);
                await FolderManagerDB.close(cid, access);

                resolve(true);
            } catch (error: any) {
                this.closeAfterInteraction(cid, access)
                    .then(() => reject(error.message))
                    .catch(_error => reject(_error));
            }
        });
    }

    /**
     * @description Adiciona um usuário na whitelist
     * @param cid {String} - CustomId da pasta
     * @param access {Access} - Propriedades do acesso
     * @param user {UserId} - Propriedades do usuário
     */
    public insertUserId(cid: string, access: Access, user: UserId) {
        return new Promise<boolean>(async (resolve, reject) => {
            try {
                await FolderManagerDB.addUserId(cid, access, user);
                await FolderManagerDB.close(cid, access);

                resolve(true);
            } catch (error: any) {
                this.closeAfterInteraction(cid, access)
                    .then(() => reject(error.message))
                    .catch(_error => reject(_error));
            }
        });
    }

    /**
     * @description Remove o usuário da whitelist
     * @param cid {String} - CustomId da pasta
     * @param access {Access} - Propriedades do acesso
     * @param user {UserId} - Propriedades do usuário
     */
    public removeUserId(cid: string, access: Access, user: UserId) {
        return new Promise<boolean>(async (resolve, reject) => {
            try {
                await FolderManagerDB.removeUserId(cid, access, user);
                await FolderManagerDB.close(cid, access);

                resolve(true);
            } catch (error: any) {
                this.closeAfterInteraction(cid, access)
                    .then(() => reject(error.message))
                    .catch(_error => reject(_error));
            }
        });
    }

    /**
     * @description Adiciona o arquivo a pasta.
     * @param cid {String} - CustomId da pasta
     * @param access {Access} - Propriedades do acesso
     * @param fileId {String} - CustomId do arquivo
     * @param accessFile {accessFile} - Propriedades do acesso para arquivos
     */
    public append(cid: string, access: Access, fileId: string, accessFile: AccessFile) {
        return new Promise<boolean>(async (resolve, reject) => {
            try {
                await FolderManagerDB.append(cid, access, fileId, accessFile);
                await FolderManagerDB.close(cid, access);

                resolve(true);
            } catch (error: any) {
                this.closeAfterInteraction(cid, access)
                    .then(() => reject(error.message))
                    .catch(_error => reject(_error));
            }
        });
    }

    /**
     * @description Remove o arquivo na pasta
     * @param cid {String} - CustomId da pasta
     * @param access {Access} - Propriedades do acesso
     * @param fileId {String} - CustomId o arquivo
     * @param accessFile {accessFile} - Propriedades do acesso para arquivos
     */
    public remove(cid: string, access: Access, fileId: string, accessFile: AccessFile) {
        return new Promise<boolean>(async (resolve, reject) => {
            try {
                await FolderManagerDB.remove(cid, access, fileId, accessFile);
                await FolderManagerDB.close(cid, access);

                resolve(true);
            } catch (error: any) {
                this.closeAfterInteraction(cid, access)
                    .then(() => reject(error.message))
                    .catch(_error => reject(_error));
            }
        });
    }

    /**
     * @description Adiciona uma pasta a pasta
     * @param cid {String} - CustomId da pasta
     * @param access {Access} - Propriedades do acesso
     * @param folderId {String} - CustomId da pasta a ser adicionada
     */
    public push(cid: string, access: Access, folderId: string) {
        return new Promise<boolean>(async (resolve, reject) => {
            try {
                await FolderManagerDB.push(cid, access, folderId);
                await FolderManagerDB.close(cid, access);

                resolve(true);
            } catch (error: any) {
                this.closeAfterInteraction(cid, access)
                    .then(() => reject(error.message))
                    .catch(_error => reject(_error));
            }
        });
    }

    /**
     * @description Remove uma pasta da pasta
     * @param cid {String} - CustomId da pasta
     * @param access {Access} - Propriedades do acesso
     * @param folderId {String} - CustomId da pasta a ser adicionada
     */
    public splice(cid: string, access: Access, folderId: string) {
        return new Promise<boolean>(async (resolve, reject) => {
            try {
                await FolderManagerDB.splice(cid, access, folderId);
                await FolderManagerDB.close(cid, access);

                resolve(true);
            } catch (error: any) {
                this.closeAfterInteraction(cid, access)
                    .then(() => reject(error.message))
                    .catch(_error => reject(_error));
            }
        });
    }

    /**
     * @description Abre a pasta e retorna os IDs dos arquivos
     * @param cid {String} - CustomId da pasta
     * @param access {Access} - Propriedades do acesso
     */
    public async open(cid: string, access: Access): Promise<string[]> {
        return await FolderManagerDB.open(cid, access);
    }

    /**
     * @description Fecha a pasta e estabelece o status "Disponível" para novas operações.
     * @param cid {String} - CustomId da pasta
     * @param access {Access} - Propriedades do acesso
     */
    public async close(cid: string, access: Access): Promise<boolean> {
        return await FolderManagerDB.close(cid, access);
    }

    /**
     * @description Protege a pasta.
     * @param cid {String} - CustomId da pasta
     * @param access {Access} - Propriedades do acesso
     * @param passphrase {string} - Texto secreto definido pelo usuário
     */
    public async protect(cid: string, access: Access, passphrase: string): Promise<string> {
        return await FolderManagerDB.protect(cid, access, passphrase);
    }

    /**
     * @description Desprotege a pasta.
     * @param cid {String} - CustomId da pasta
     * @param access {Access} - Propriedades do acesso
     * @param key {String} - Chave secreta do compartilhamento
     * @param passphrase {string} - Texto secreto definido pelo usuário
     */
    public async unProtect(cid: string, access: Access, key: string, passphrase: string): Promise<boolean> {
        return await FolderManagerDB.unProtect(cid, access, { key, passphrase });
    }

    /**
     * @description Libera o compartilhamento da pasta.
     * @param cid {String} - CustomId da pasta
     * @param access {Access} - Propriedades do acesso
     * @param title {String} - Texto personalizado usado na UI/UX.
     */
    public async share(cid: string, access: Access, title: string): Promise<{ link: string, secret: string }> {
        return await FolderManagerDB.share(cid, access, title);
    }

    /**
     * @description Remove o compartilhamento da pasta.
     * @param cid {String} - CustomId da pasta
     * @param access {Access} - Propriedades do acesso
     * @param link {String} - Link do compartilhamento
     * @param secret {String} - Texto secreto definido pelo usuário
     */
    public async unShare(cid: string, access: Access, link: string, secret: string): Promise<boolean> {
        return await FolderManagerDB.unShare(cid, access, { link, secret });
    }

    /**
     * @description Verifica o bloqueio da pasta.
     * @param cid {String} - CustomId da pasta
     * @param access {Access} - Propriedades do acesso
     */
    public async verifyBlocked(cid: string, access: Access): Promise<BlockVerify> {
        return await FolderManagerDB.verifyBlocked(cid, access);
    }

    /**
     * @description Desbloqueia a pasta.
     * @param cid {String} - CustomId da pasta
     * @param access {Access} - Propriedades do acesso
     */
    public async unBlocked(cid: string, access: Access): Promise<boolean> {
        return await FolderManagerDB.unBlocked(cid, access);
    }

    /**
     * @description Bloqueia a pasta por data.
     * @param cid {String} - CustomId da pasta
     * @param access {Access} - Propriedades do acesso
     * @param repeat {Boolean} - Deve repetir esse bloqueio?
     * @param args {year, month, date} - Propriedades da data
     */
    public async blockedByDate(cid: string, access: Access, repeat: boolean, args: {
        year: number;
        month: number;
        date: number;
        hour: number;
        minute: number;
    }): Promise<boolean> {
        const now = new Date();

        now.setFullYear(args.year, args.month, args.date);
        now.setHours(args.hour, args.minute);

        return await FolderManagerDB.blocked(cid, access, {
            type: 'Date',
            value: now,
            repeat
        });
    }

    /**
     * @description Bloqueia a pasta por mês.
     * @param cid {String} - CustomId da pasta
     * @param access {Access} - Propriedades do acesso
     * @param repeat {Boolean} - Deve repetir esse bloqueio?
     * @param month {Number} - sequência começa em 0 até 11
     */
    public async blockedByMonth(cid: string, access: Access, repeat: boolean, month: number): Promise<boolean> {
        const now = new Date();

        now.setMonth(month);

        return await FolderManagerDB.blocked(cid, access, {
            type: 'Month',
            value: now,
            repeat
        });
    }

    /**
     * @description Bloqueia a pasta por dia do mês.
     * @param repeat {Boolean} - Deve repetir esse bloqueio?
     * @param access {Access} - Propriedades do acesso
     * @param cid {String} - CustomId da pasta
     */
    public async blockedByDayMonth(cid: string, access: Access, repeat: boolean, day: number): Promise<boolean> {
        const now = new Date();

        now.setDate(day);

        return await FolderManagerDB.blocked(cid, access, {
            type: 'Day Month',
            value: now,
            repeat
        });
    }

    /**
     * @description Bloqueia a pasta por dia da semana.
     * @param repeat {Boolean} - Deve repetir esse bloqueio?
     * @param access {Access} - Propriedades do acesso
     * @param cid {String} - CustomId da pasta
     */
    public async blockedByDayWeek(cid: string, access: Access, repeat: boolean, day: number): Promise<boolean> {
        const now = new Date();

        now.setDate(day);

        return await FolderManagerDB.blocked(cid, access, {
            type: 'Day Week',
            value: now,
            repeat
        });
    }

    /**
     * @description Bloqueia a pasta por hora.
     * @param repeat {Boolean} - Deve repetir esse bloqueio?
     * @param access {Access} - Propriedades do acesso
     * @param cid {String} - CustomId da pasta
     */
    public async blockedByHour(cid: string, access: Access, repeat: boolean, hour: number): Promise<boolean> {
        const now = new Date();

        now.setHours(now.getHours() + hour);

        return await FolderManagerDB.blocked(cid, access, {
            type: 'Hour',
            value: now,
            repeat
        });
    }

    /**
     * @description Bloqueia a pasta por minuto.
     * @param repeat {Boolean} - Deve repetir esse bloqueio?
     * @param access {Access} - Propriedades do acesso
     * @param cid {String} - CustomId da pasta
     */
    public async blockedByMinute(cid: string, access: Access, repeat: boolean, minute: number): Promise<boolean> {
        const now = new Date();

        now.setMinutes(now.getMinutes() + minute);

        return await FolderManagerDB.blocked(cid, access, {
            type: 'Minute',
            value: now,
            repeat
        });
    }

    /**
     * @description Coloca a pasta na lixeira.
     * @param cid {String} - CustomId da pasta
     * @param access {Access} - Propriedades do acesso
     * @param accessFile {accessFile} - Propriedades do acesso para arquivos
     */
    public async moveToGarbage(cid: string, access: Access, accessFile: AccessFile): Promise<boolean> {
        return await FolderManagerDB.moveToGarbage(cid, access, accessFile);
    }

    /**
     * @description Retira a pasta da lixeira.
     * @param cid {String} - CustomId da pasta
     * @param access {Access} - Propriedades do acesso
     * @param accessFile {accessFile} - Propriedades do acesso para arquivos
     */
    public async removeOfGarbage(cid: string, access: Access, accessFile: AccessFile): Promise<boolean> {
        return await FolderManagerDB.removeOfGarbage(cid, access, accessFile);
    }

    /**
     * @description Reciclagem das pastas na lixeira
     */
    public recycleGarbage() {
        return new Promise<string>(async (resolve, reject) => {
            try {
                const foldersId = await FolderManagerDB.recycleGarbage();

                if (foldersId.length > 0) {
                    const
                        access: Access = {
                            group: {
                                name: "administrador",
                                permission: "Delete"
                            }
                        },
                        accessFile: AccessFile = {
                            group: {
                                name: "administrador",
                                permission: "Delete"
                            }
                        };

                    for (const folderId of foldersId) {
                        this.delete(folderId, access, accessFile).catch(error => reject(error.message));
                    }

                    return resolve(`${foldersId.length} pasta(s) da lixeira foram recicladas.`);
                } else {
                    return resolve(`Nenhuma pasta da lixeira foi reciclada.`);
                }
            } catch (error: any) {
                reject(error.message)
            }
        });
    }
}

export default new FolderController();