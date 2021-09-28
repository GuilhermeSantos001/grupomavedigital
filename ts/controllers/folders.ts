/**
 * @description Gerenciamento de pastas
 * @author @GuilhermeSantos001
 * @update 23/08/2021
 * @version 1.13.13
 */

import { GroupId, UserId, folderInterface, folderModelInterface } from '@/mongo/folders-manager-mongo';
import FolderManagerDB, { Access } from '@/db/folders-db';
import { Access as AccessFile, BlockVerify } from '@/db/files-db';
class FolderController {

    constructor(
    ) { };

    /**
     * @description Fecha a pasta após interação
     * @param cid {String} - CustomId da pasta
     * @param access {Access} - Propriedades do acesso
     */
    private closeAfterInteraction(cid: string, access: Access) {
        return new Promise<void>(async (resolve, reject) => {
            try {
                await FolderManagerDB.close(cid, access);

                return resolve();
            } catch (error) {
                return resolve();
            };
        });
    };

    /**
     * @description Retorna uma lista de pastas
     * @param filter {Object} - Filtro Aplicado na busca
     * @param skip {Number} - Pular x itens iniciais no banco de dados
     * @param limit {Number} - Limite de itens a serem retornados
     */
    public get(filter: object, skip: number, limit: number) {
        return new Promise<folderInterface[]>(async (resolve, reject) => {
            try {
                const folders = await FolderManagerDB.get(filter, skip, limit);

                return resolve(folders.map(folder => {
                    return {
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
                        assignees: folder.assignees,
                        order: folder.order,
                        updated: folder.updated,
                        lastAccess: folder.lastAccess,
                        createdAt: folder.createdAt
                    };
                }));
            } catch (error) {
                return reject(error);
            };
        });
    };

    /**
     * @description Armazena a pasta
     * @param folder {folderInterface} - Propriedades da pasta.
     */
    public newFolder(folder: folderInterface) {
        return new Promise<folderModelInterface>(async (resolve, reject) => {
            try {
                return resolve(await FolderManagerDB.save(folder));
            } catch (error) {
                return reject(error);
            };
        });
    };

    /**
     * @description Retorna o nome da pasta
     * @param cid {String} - CustomId da pasta
     */
    public name(cid: string) {
        return new Promise<string>(async (resolve, reject) => {
            try {
                const name = await FolderManagerDB.name(cid);

                return resolve(name);
            } catch (error) {
                return reject(error);
            };
        });
    };

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

                return resolve(true);
            } catch (error) {
                this.closeAfterInteraction(cid, access);

                return reject(error);
            };
        });
    };

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

                return resolve(true);
            } catch (error) {
                this.closeAfterInteraction(cid, access);

                return reject(error);
            };
        });
    };

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

                return resolve(true);
            } catch (error) {
                this.closeAfterInteraction(cid, access);

                return reject(error);
            };
        });
    };

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

                return resolve(true);
            } catch (error) {
                this.closeAfterInteraction(cid, access);

                return reject(error);
            };
        });
    };

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

                return resolve(true);
            } catch (error) {
                this.closeAfterInteraction(cid, access);

                return reject(error);
            };
        });
    };

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

                return resolve(true);
            } catch (error) {
                this.closeAfterInteraction(cid, access);

                return reject(error);
            };
        });
    };

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

                return resolve(true);
            } catch (error) {
                this.closeAfterInteraction(cid, access);

                return reject(error);
            };
        });
    };

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

                return resolve(true);
            } catch (error) {
                this.closeAfterInteraction(cid, access);

                return reject(error);
            };
        });
    };

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

                return resolve(true);
            } catch (error) {
                this.closeAfterInteraction(cid, access);

                return reject(error);
            };
        });
    };

    /**
     * @description Abre a pasta e retorna os IDs dos arquivos
     * @param cid {String} - CustomId da pasta
     * @param access {Access} - Propriedades do acesso
     */
    public open(cid: string, access: Access) {
        return new Promise<string[]>(async (resolve, reject) => {
            try {
                return resolve(await FolderManagerDB.open(cid, access));
            } catch (error) {
                return reject(error);
            };
        });
    };

    /**
     * @description Fecha a pasta e estabelece o status "Disponível" para novas operações.
     * @param cid {String} - CustomId da pasta
     * @param access {Access} - Propriedades do acesso
     */
    public close(cid: string, access: Access) {
        return new Promise<boolean>(async (resolve, reject) => {
            try {
                return resolve(await FolderManagerDB.close(cid, access));
            } catch (error) {
                return reject(error);
            };
        });
    };

    /**
     * @description Protege a pasta.
     * @param cid {String} - CustomId da pasta
     * @param access {Access} - Propriedades do acesso
     * @param passphrase {string} - Texto secreto definido pelo usuário
     */
    public protect(cid: string, access: Access, passphrase: string) {
        return new Promise<string>(async (resolve, reject) => {
            try {
                return resolve(await FolderManagerDB.protect(cid, access, passphrase));
            } catch (error) {
                return reject(error);
            };
        });
    };

    /**
     * @description Desprotege a pasta.
     * @param cid {String} - CustomId da pasta
     * @param access {Access} - Propriedades do acesso
     * @param key {String} - Chave secreta do compartilhamento
     * @param passphrase {string} - Texto secreto definido pelo usuário
     */
    public unProtect(cid: string, access: Access, key: string, passphrase: string) {
        return new Promise<boolean>(async (resolve, reject) => {
            try {
                return resolve(await FolderManagerDB.unProtect(cid, access, { key, passphrase }));
            } catch (error) {
                return reject(error);
            };
        });
    };

    /**
     * @description Libera o compartilhamento da pasta.
     * @param cid {String} - CustomId da pasta
     * @param access {Access} - Propriedades do acesso
     * @param title {String} - Texto personalizado usado na UI/UX.
     */
    public share(cid: string, access: Access, title: string) {
        return new Promise<{ link: string, secret: string }>(async (resolve, reject) => {
            try {
                return resolve(await FolderManagerDB.share(cid, access, title));
            } catch (error) {
                return reject(error);
            };
        });
    };

    /**
     * @description Remove o compartilhamento da pasta.
     * @param cid {String} - CustomId da pasta
     * @param access {Access} - Propriedades do acesso
     * @param link {String} - Link do compartilhamento
     * @param secret {String} - Texto secreto definido pelo usuário
     */
    public unShare(cid: string, access: Access, link: string, secret: string) {
        return new Promise<boolean>(async (resolve, reject) => {
            try {
                return resolve(await FolderManagerDB.unShare(cid, access, { link, secret }));
            } catch (error) {
                return reject(error);
            };
        });
    };

    /**
     * @description Verifica o bloqueio da pasta.
     * @param cid {String} - CustomId da pasta
     * @param access {Access} - Propriedades do acesso
     */
    public verifyBlocked(cid: string, access: Access) {
        return new Promise<BlockVerify>(async (resolve, reject) => {
            try {
                return resolve(await FolderManagerDB.verifyBlocked(cid, access));
            } catch (error) {
                return reject(error);
            };
        });
    };

    /**
     * @description Desbloqueia a pasta.
     * @param cid {String} - CustomId da pasta
     * @param access {Access} - Propriedades do acesso
     */
    public unBlocked(cid: string, access: Access) {
        return new Promise<boolean>(async (resolve, reject) => {
            try {
                return resolve(await FolderManagerDB.unBlocked(cid, access));
            } catch (error) {
                return reject(error);
            };
        });
    };

    /**
     * @description Bloqueia a pasta por data.
     * @param cid {String} - CustomId da pasta
     * @param access {Access} - Propriedades do acesso
     * @param repeat {Boolean} - Deve repetir esse bloqueio?
     * @param args {year, month, date} - Propriedades da data
     */
    public blockedByDate(cid: string, access: Access, repeat: boolean, args: {
        year: number;
        month: number;
        date: number;
        hour: number;
        minute: number;
    }) {
        return new Promise<boolean>(async (resolve, reject) => {
            try {
                const now = new Date();

                now.setFullYear(args.year, args.month, args.date);
                now.setHours(args.hour, args.minute);

                return resolve(await FolderManagerDB.blocked(cid, access, {
                    type: 'Date',
                    value: now,
                    repeat
                }));
            } catch (error) {
                return reject(error);
            };
        });
    };

    /**
     * @description Bloqueia a pasta por mês.
     * @param cid {String} - CustomId da pasta
     * @param access {Access} - Propriedades do acesso
     * @param repeat {Boolean} - Deve repetir esse bloqueio?
     * @param month {Number} - sequência começa em 0 até 11
     */
    public blockedByMonth(cid: string, access: Access, repeat: boolean, month: number) {
        return new Promise<boolean>(async (resolve, reject) => {
            try {
                const now = new Date();

                now.setMonth(month);

                return resolve(await FolderManagerDB.blocked(cid, access, {
                    type: 'Month',
                    value: now,
                    repeat
                }));
            } catch (error) {
                return reject(error);
            };
        });
    };

    /**
     * @description Bloqueia a pasta por dia do mês.
     * @param repeat {Boolean} - Deve repetir esse bloqueio?
     * @param access {Access} - Propriedades do acesso
     * @param cid {String} - CustomId da pasta
     */
    public blockedByDayMonth(cid: string, access: Access, repeat: boolean, day: number) {
        return new Promise<boolean>(async (resolve, reject) => {
            try {
                const now = new Date();

                now.setDate(day);

                return resolve(await FolderManagerDB.blocked(cid, access, {
                    type: 'Day Month',
                    value: now,
                    repeat
                }));
            } catch (error) {
                return reject(error);
            };
        });
    };

    /**
     * @description Bloqueia a pasta por dia da semana.
     * @param repeat {Boolean} - Deve repetir esse bloqueio?
     * @param access {Access} - Propriedades do acesso
     * @param cid {String} - CustomId da pasta
     */
    public blockedByDayWeek(cid: string, access: Access, repeat: boolean, day: number) {
        return new Promise<boolean>(async (resolve, reject) => {
            try {
                const now = new Date();

                now.setDate(day);

                return resolve(await FolderManagerDB.blocked(cid, access, {
                    type: 'Day Week',
                    value: now,
                    repeat
                }));
            } catch (error) {
                return reject(error);
            };
        });
    };

    /**
     * @description Bloqueia a pasta por hora.
     * @param repeat {Boolean} - Deve repetir esse bloqueio?
     * @param access {Access} - Propriedades do acesso
     * @param cid {String} - CustomId da pasta
     */
    public blockedByHour(cid: string, access: Access, repeat: boolean, hour: number) {
        return new Promise<boolean>(async (resolve, reject) => {
            try {
                const now = new Date();

                now.setHours(now.getHours() + hour);

                return resolve(await FolderManagerDB.blocked(cid, access, {
                    type: 'Hour',
                    value: now,
                    repeat
                }));
            } catch (error) {
                return reject(error);
            };
        });
    };

    /**
     * @description Bloqueia a pasta por minuto.
     * @param repeat {Boolean} - Deve repetir esse bloqueio?
     * @param access {Access} - Propriedades do acesso
     * @param cid {String} - CustomId da pasta
     */
    public blockedByMinute(cid: string, access: Access, repeat: boolean, minute: number) {
        return new Promise<boolean>(async (resolve, reject) => {
            try {
                const now = new Date();

                now.setMinutes(now.getMinutes() + minute);

                return resolve(await FolderManagerDB.blocked(cid, access, {
                    type: 'Minute',
                    value: now,
                    repeat
                }));
            } catch (error) {
                return reject(error);
            };
        });
    };

    /**
     * @description Coloca a pasta na lixeira.
     * @param cid {String} - CustomId da pasta
     * @param access {Access} - Propriedades do acesso
     * @param accessFile {accessFile} - Propriedades do acesso para arquivos
     */
    public moveToGarbage(cid: string, access: Access, accessFile: AccessFile) {
        return new Promise<boolean>(async (resolve, reject) => {
            try {
                return resolve(await FolderManagerDB.moveToGarbage(cid, access, accessFile));
            } catch (error) {
                return reject(error);
            };
        });
    };

    /**
     * @description Retira a pasta da lixeira.
     * @param cid {String} - CustomId da pasta
     * @param access {Access} - Propriedades do acesso
     * @param accessFile {accessFile} - Propriedades do acesso para arquivos
     */
    public removeOfGarbage(cid: string, access: Access, accessFile: AccessFile) {
        return new Promise<boolean>(async (resolve, reject) => {
            try {
                return resolve(await FolderManagerDB.removeOfGarbage(cid, access, accessFile));
            } catch (error) {
                return reject(error);
            };
        });
    };

    /**
     * @description Reciclagem das pastas na lixeira
     */
    public async recycleGarbage() {
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
                        await this.delete(folderId, access, accessFile);
                    };

                    return resolve(`${foldersId.length} pasta(s) da lixeira foram recicladas.`);
                } else {
                    return resolve(`Nenhuma pasta da lixeira foi reciclada.`);
                };
            } catch (error) {
                return reject(error);
            };
        });
    };
};

export default new FolderController();