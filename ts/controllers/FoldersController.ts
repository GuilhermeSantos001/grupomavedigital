/**
 * @description Gerenciamento de pastas
 * @author GuilhermeSantos001
 * @update 31/01/2022
 */

import { GroupId, UserId, folderInterface, folderModelInterface } from '@/schemas/FoldersSchema';
import { FoldersManagerDB, Access } from '@/database/FoldersManagerDB';
import { Access as AccessFile, BlockVerify } from '@/database/FilesManagerDB';
import { FilterQuery } from 'mongoose';

export interface ResponseDataFolder extends folderInterface, Pick<folderModelInterface, 'checkGroupAccess' | 'checkUserAccess' | 'inRoom' | 'getAuthorUsername' | 'getAuthorEmail'> { }

export class FoldersController {
    private foldersManagerDB: FoldersManagerDB;

    constructor() {
        this.foldersManagerDB = new FoldersManagerDB();
    }

    /**
     * @description Fecha a pasta após interação
     * @param cid {String} - CustomId da pasta
     * @param access {Access} - Propriedades do acesso
     */
    private async closeAfterInteraction(cid: string, access: Access): Promise<void> {
        try {
            await this.foldersManagerDB.close(cid, access);
        } catch (error) {
            throw new Error(error instanceof Error ? error.message : JSON.stringify(error))
        }
    }

    /**
     * @description Retorna uma lista de pastas
     * @param filter {Object} - Filtro Aplicado na busca
     * @param skip {Number} - Pular x itens iniciais no banco de dados
     * @param limit {Number} - Limite de itens a serem retornados
     */
    public async get(filter: FilterQuery<folderModelInterface>, skip: number, limit: number): Promise<ResponseDataFolder[]> {
        try {
            const folders = await this.foldersManagerDB.get(filter, skip, limit);

            return folders.map(folder => {
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
            });
        } catch (error) {
            throw new Error(error instanceof Error ? error.message : JSON.stringify(error))
        }
    }

    /**
     * @description Armazena a pasta
     * @param folder {folderInterface} - Propriedades da pasta.
     */
    public async newFolder(folder: folderInterface): Promise<folderModelInterface> {
        try {
            return await this.foldersManagerDB.save(folder);
        } catch (error) {
            throw new Error(error instanceof Error ? error.message : JSON.stringify(error))
        }
    }

    /**
     * @description Retorna o nome da pasta
     * @param cid {String} - CustomId da pasta
     */
    public async name(cid: string): Promise<string> {
        return await this.foldersManagerDB.name(cid);
    }

    /**
     * @description Remove a pasta.
     * @param cid {String} - CustomId da pasta
     * @param access {access} - Propriedades do acesso para pastas
     * @param accessFile {accessFile} - Propriedades do acesso para arquivos
     */
    public async delete(cid: string, access: Access, accessFile: AccessFile) {
        try {
            return await this.foldersManagerDB.delete(cid, access, accessFile);
        } catch (error) {
            await this.closeAfterInteraction(cid, access);
            throw new Error(error instanceof Error ? error.message : JSON.stringify(error));
        }
    }

    /**
     * @description Atualiza as propriedades da pasta
     * @param cid {String} - CustomId da pasta
     * @param access {Access} - Propriedades do acesso para pastas
     * @param props {Pick<folderInterface, 'name' | 'description' | 'tag' | 'type'>} - Propriedades a serem atualizadas
     */
    public async update(cid: string, access: Access, props: Pick<folderInterface, 'name' | 'description' | 'tag' | 'type'>) {
        try {
            await this.foldersManagerDB.update(cid, access, props);
            await this.foldersManagerDB.close(cid, access);

            return true;
        } catch (error) {
            await this.closeAfterInteraction(cid, access);
            throw new Error(error instanceof Error ? error.message : JSON.stringify(error));
        }
    }

    /**
     * @description Adiciona o grupo na whitelist da pasta.
     * @param cid {String} - CustomId da pasta
     * @param access {Access} - Propriedades do acesso
     * @param group {GroupId} - Grupo do usuário
     */
    public async insertGroupId(cid: string, access: Access, group: GroupId) {
        try {
            await this.foldersManagerDB.addGroupId(cid, access, group);
            await this.foldersManagerDB.close(cid, access);

            return true;
        } catch (error) {
            await this.closeAfterInteraction(cid, access);
            throw new Error(error instanceof Error ? error.message : JSON.stringify(error));
        }
    }

    /**
     * @description Remove o grupo da whitelist da pasta.
     * @param cid {String} - CustomId da pasta
     * @param access {Access} - Propriedades do acesso
     * @param group {GroupId} - Grupo do usuário
     */
    public async removeGroupId(cid: string, access: Access, group: GroupId) {
        try {
            await this.foldersManagerDB.removeGroupId(cid, access, group);
            await this.foldersManagerDB.close(cid, access);

            return true;
        } catch (error) {
            await this.closeAfterInteraction(cid, access);
            throw new Error(error instanceof Error ? error.message : JSON.stringify(error));
        }
    }

    /**
     * @description Adiciona um usuário na whitelist
     * @param cid {String} - CustomId da pasta
     * @param access {Access} - Propriedades do acesso
     * @param user {UserId} - Propriedades do usuário
     */
    public async insertUserId(cid: string, access: Access, user: UserId) {
        try {
            await this.foldersManagerDB.addUserId(cid, access, user);
            await this.foldersManagerDB.close(cid, access);

            return true;
        } catch (error) {
            await this.closeAfterInteraction(cid, access);
            throw new Error(error instanceof Error ? error.message : JSON.stringify(error));
        }
    }

    /**
     * @description Remove o usuário da whitelist
     * @param cid {String} - CustomId da pasta
     * @param access {Access} - Propriedades do acesso
     * @param user {UserId} - Propriedades do usuário
     */
    public async removeUserId(cid: string, access: Access, user: UserId) {
        try {
            await this.foldersManagerDB.removeUserId(cid, access, user);
            await this.foldersManagerDB.close(cid, access);

            return true;
        } catch (error) {
            await this.closeAfterInteraction(cid, access);
            throw new Error(error instanceof Error ? error.message : JSON.stringify(error));
        }
    }

    /**
     * @description Adiciona o arquivo a pasta.
     * @param cid {String} - CustomId da pasta
     * @param access {Access} - Propriedades do acesso
     * @param fileId {String} - CustomId do arquivo
     * @param accessFile {accessFile} - Propriedades do acesso para arquivos
     */
    public async append(cid: string, access: Access, fileId: string, accessFile: AccessFile) {
        try {
            await this.foldersManagerDB.append(cid, access, fileId, accessFile);
            await this.foldersManagerDB.close(cid, access);

            return true;
        } catch (error) {
            await this.closeAfterInteraction(cid, access);
            throw new Error(error instanceof Error ? error.message : JSON.stringify(error));
        }
    }

    /**
     * @description Remove o arquivo na pasta
     * @param cid {String} - CustomId da pasta
     * @param access {Access} - Propriedades do acesso
     * @param fileId {String} - CustomId o arquivo
     * @param accessFile {accessFile} - Propriedades do acesso para arquivos
     */
    public async remove(cid: string, access: Access, fileId: string, accessFile: AccessFile) {
        try {
            await this.foldersManagerDB.remove(cid, access, fileId, accessFile);
            await this.foldersManagerDB.close(cid, access);

            return true;
        } catch (error) {
            await this.closeAfterInteraction(cid, access);
            throw new Error(error instanceof Error ? error.message : JSON.stringify(error));
        }
    }

    /**
     * @description Adiciona uma pasta a pasta
     * @param cid {String} - CustomId da pasta
     * @param access {Access} - Propriedades do acesso
     * @param folderId {String} - CustomId da pasta a ser adicionada
     */
    public async push(cid: string, access: Access, folderId: string) {
        try {
            await this.foldersManagerDB.push(cid, access, folderId);
            await this.foldersManagerDB.close(cid, access);

            return true;
        } catch (error) {
            await this.closeAfterInteraction(cid, access);
            throw new Error(error instanceof Error ? error.message : JSON.stringify(error));
        }
    }

    /**
     * @description Remove uma pasta da pasta
     * @param cid {String} - CustomId da pasta
     * @param access {Access} - Propriedades do acesso
     * @param folderId {String} - CustomId da pasta a ser adicionada
     */
    public async splice(cid: string, access: Access, folderId: string) {
        try {
            await this.foldersManagerDB.splice(cid, access, folderId);
            await this.foldersManagerDB.close(cid, access);

            return true;
        } catch (error) {
            await this.closeAfterInteraction(cid, access);
            throw new Error(error instanceof Error ? error.message : JSON.stringify(error));
        }
    }

    /**
     * @description Abre a pasta e retorna os IDs dos arquivos
     * @param cid {String} - CustomId da pasta
     * @param access {Access} - Propriedades do acesso
     */
    public async open(cid: string, access: Access): Promise<string[]> {
        return await this.foldersManagerDB.open(cid, access);
    }

    /**
     * @description Fecha a pasta e estabelece o status "Disponível" para novas operações.
     * @param cid {String} - CustomId da pasta
     * @param access {Access} - Propriedades do acesso
     */
    public async close(cid: string, access: Access): Promise<boolean> {
        return await this.foldersManagerDB.close(cid, access);
    }

    /**
     * @description Protege a pasta.
     * @param cid {String} - CustomId da pasta
     * @param access {Access} - Propriedades do acesso
     * @param passphrase {string} - Texto secreto definido pelo usuário
     */
    public async protect(cid: string, access: Access, passphrase: string): Promise<string> {
        return await this.foldersManagerDB.protect(cid, access, passphrase);
    }

    /**
     * @description Desprotege a pasta.
     * @param cid {String} - CustomId da pasta
     * @param access {Access} - Propriedades do acesso
     * @param key {String} - Chave secreta do compartilhamento
     * @param passphrase {string} - Texto secreto definido pelo usuário
     */
    public async unProtect(cid: string, access: Access, key: string, passphrase: string): Promise<boolean> {
        return await this.foldersManagerDB.unProtect(cid, access, { key, passphrase });
    }

    /**
     * @description Libera o compartilhamento da pasta.
     * @param cid {String} - CustomId da pasta
     * @param access {Access} - Propriedades do acesso
     * @param title {String} - Texto personalizado usado na UI/UX.
     */
    public async share(cid: string, access: Access, title: string): Promise<{ link: string, secret: string }> {
        return await this.foldersManagerDB.share(cid, access, title);
    }

    /**
     * @description Remove o compartilhamento da pasta.
     * @param cid {String} - CustomId da pasta
     * @param access {Access} - Propriedades do acesso
     * @param link {String} - Link do compartilhamento
     * @param secret {String} - Texto secreto definido pelo usuário
     */
    public async unShare(cid: string, access: Access, link: string, secret: string): Promise<boolean> {
        return await this.foldersManagerDB.unShare(cid, access, { link, secret });
    }

    /**
     * @description Verifica o bloqueio da pasta.
     * @param cid {String} - CustomId da pasta
     * @param access {Access} - Propriedades do acesso
     */
    public async verifyBlocked(cid: string, access: Access): Promise<BlockVerify> {
        return await this.foldersManagerDB.verifyBlocked(cid, access);
    }

    /**
     * @description Desbloqueia a pasta.
     * @param cid {String} - CustomId da pasta
     * @param access {Access} - Propriedades do acesso
     */
    public async unBlocked(cid: string, access: Access): Promise<boolean> {
        return await this.foldersManagerDB.unBlocked(cid, access);
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

        return await this.foldersManagerDB.blocked(cid, access, {
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

        return await this.foldersManagerDB.blocked(cid, access, {
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

        return await this.foldersManagerDB.blocked(cid, access, {
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

        return await this.foldersManagerDB.blocked(cid, access, {
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

        return await this.foldersManagerDB.blocked(cid, access, {
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

        return await this.foldersManagerDB.blocked(cid, access, {
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
        return await this.foldersManagerDB.moveToGarbage(cid, access, accessFile);
    }

    /**
     * @description Retira a pasta da lixeira.
     * @param cid {String} - CustomId da pasta
     * @param access {Access} - Propriedades do acesso
     * @param accessFile {accessFile} - Propriedades do acesso para arquivos
     */
    public async removeOfGarbage(cid: string, access: Access, accessFile: AccessFile): Promise<boolean> {
        return await this.foldersManagerDB.removeOfGarbage(cid, access, accessFile);
    }

    /**
     * @description Reciclagem das pastas na lixeira
     */
    public async recycleGarbage() {
        try {
            const foldersId = await this.foldersManagerDB.recycleGarbage();

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
                    this.delete(folderId, access, accessFile);
                }

                return `${foldersId.length} pasta(s) da lixeira foram recicladas.`;
            } else {
                return `Nenhuma pasta da lixeira foi reciclada.`;
            }
        } catch (error) {
            throw new Error(error instanceof Error ? error.message : JSON.stringify(error));
        }
    }
}