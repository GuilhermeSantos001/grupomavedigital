/**
 * @description Gerenciador de informações com o banco de dados
 * @author @GuilhermeSantos001
 * @update 12/10/2021
 */

import { v4 as uuidv4 } from 'uuid';
import { FilterQuery } from 'mongoose';

import folderDB, { GroupId, UserId, FolderPermission, folderInterface, folderModelInterface } from '@/mongo/folders-manager-mongo';
import fileDB, { FileShare, FileProtected, FileBlocked } from '@/mongo/files-manager-mongo';
import { PrivilegesSystem } from "@/mongo/user-manager-mongo";
import fileManagerDB, { Access as AccessFile, trashDays, BlockVerify } from '@/db/files-db';
import Moment from '@/utils/moment';
import Random from '@/utils/random';

export interface Access {
    group?: {
        name: PrivilegesSystem;
        permission: FolderPermission;
    };
    user?: {
        email: string;
        permission: FolderPermission;
    };
}

class folderManagerDB {
    /**
     * @description Verifica se a pasta está protegida/bloqueada.
     */
    private _isProtectedOrBlocked(folder: folderModelInterface): boolean {
        return folder.protected || folder.blocked;
    }

    /**
     * @description Verifica se a pasta está disponível para há remoção.
     */
    private _isAvailableAndAllowsDelete(folder: folderModelInterface): boolean {
        return folder.available && folder.allowsDelete;
    }

    /**
     * @description Verifica se a pasta está disponível para há adição.
     */
    private _isAvailableAndAllowsAppending(folder: folderModelInterface): boolean {
        return folder.available && folder.allowsAppending;
    }

    /**
     * @description Verifica se a pasta está disponível para a proteção.
     */
    private _isAvailableAndAllowsProtect(folder: folderModelInterface): boolean {
        return folder.available && folder.allowsProtect;
    }

    /**
     * @description Verifica se a pasta está disponível para o compartilhamento.
     */
    private _isAvailableAndAllowsShare(folder: folderModelInterface): boolean {
        return folder.available && folder.allowsShare;
    }

    /**
     * @description Verifica se a pasta está disponível para as alterações de segurança.
     */
    private _isAvailableAndAllowsSecurity(folder: folderModelInterface): boolean {
        return folder.available && folder.allowsSecurity;
    }

    /**
     * @description Verifica se a pasta está disponível para o bloqueio.
     */
    private _isAvailableAndAllowsBlock(folder: folderModelInterface): boolean {
        return folder.available && folder.allowsBlock;
    }

    /**
     * @description Verifica se a pasta está em modo appending/removing.
     */
    private _isAppendingOrRemoving(folder: folderModelInterface): boolean {
        return folder.appending || folder.removing;
    }

    /**
     * @description Verifica se a pasta está disponível.
     */
    private _isAvailable(folder: folderModelInterface): boolean {
        return folder.available;
    }

    /**
     * @description Verifica se a pasta está protegida.
     */
    private _isProtected(folder: folderModelInterface): boolean {
        return folder.protected;
    }

    /**
     * @description Verifica se a pasta está protegida.
     */
    private _isBlocked(folder: folderModelInterface): boolean {
        return folder.blocked;
    }

    /**
     * @description Verifica se a pasta está compartilhada.
     */
    private _isShared(folder: folderModelInterface): boolean {
        return folder.shared;
    }

    /**
     * @description Verifica se a pasta está na lixeira.
     */
    private _isGarbage(folder: folderModelInterface): boolean {
        if (folder.recycle)
            return false;

        return folder.garbage;
    }

    /**
     * @description Verifica se a pasta está na lista de reciclagem
     */
    private _isRecycle(folder: folderModelInterface): boolean {
        return folder.status === 'Recycle';
    }

    /**
     * @description Verifica se a pasta está associado a uma pasta.
     */
    private _isAssociatedFolder(folder: folderModelInterface, folderId?: string): boolean {
        if (!folderId)
            return folder.isAssociatedFolder;

        return folder.folderId === folderId;
    }

    /**
     * @description Verifica a "Chave" e o "Texto Secreto" da proteção.
     */
    private _verifyProtected(folder: folderModelInterface, protect: FileProtected): boolean {
        if (folder.protect?.key === protect.key && folder.protect.passphrase === protect.passphrase) {
            return true;
        } else {
            return false;
        }
    }

    /**
     * @description Verifica o "Link" e o "Texto Secreto" do compartilhamento.
     */
    private _verifyShared(folder: folderModelInterface, share: Omit<FileShare, "title">): boolean {
        if (folder.share?.link === share.link && folder.share.secret === share.secret) {
            return true;
        } else {
            return false;
        }
    }

    /**
     * @description Reciclagem das pastas na lixeira
     */
    public async recycleGarbage(): Promise<string[]> {
        const
            folders = await folderDB.find({ trash: { $ne: undefined } }),
            itens: string[] = [];

        if (folders.length > 0) {
            for (const [index, folder] of folders.entries()) {
                if (folder.trash instanceof Date) {
                    const now = new Date();

                    /**
                     * @description Verifica se as pastas já podem ser reciclados
                     */
                    if (now > folder.trash && folder.status !== 'Recycle') {
                        folder.status = 'Recycle';

                        folder.recycle = true;

                        folder.updated = Moment.format();

                        await folder.save();

                        if (typeof folder.cid === 'string')
                            itens.push(folder.cid);
                    }
                    /**
                     * @description verifica se a pasta já está programado para reciclagem
                     */
                    else if (folder.status === 'Recycle') {
                        if (typeof folder.cid === 'string')
                            itens.push(folder.cid);
                    }

                    /**
                     * @description Verifica se a pasta é a última da lista
                     */
                    if (folders.length - 1 <= index)
                        break;
                } else {
                    break;
                }
            }

            return itens;
        } else {
            return itens;
        }
    }
    /**
         * @description Verifica se o grupo/usuário está na whitelist da pasta.
         * @param group { name: string; permission: FolderPermission} - Grupo do usuário e permissão
         * @param user { email: string; permission: FolderPermission} - Email do usuário e permissão
         */
    private verifyAccessByGroupAndUser(folder: folderModelInterface, access: Access): boolean {
        /**
         * @description Verifica se a pasta não tem nenhum grupo/usuário associado
         */
        if (!folder.isAssociatedGroup && !folder.isAssociatedUser) {
            return true;
        }

        if (!folder.accessGroupId)
            folder.accessGroupId = [];

        if (!folder.accessUsersId)
            folder.accessUsersId = [];

        const
            accessByGroup: boolean = folder.accessGroupId.filter((groupId: GroupId) => {
                if (
                    groupId.name === access.group?.name &&
                    groupId.permissions.includes(access.group.permission)
                ) {
                    return true;
                } else {
                    return false;
                }
            }).length > 0,
            accessByEmail: boolean = folder.accessUsersId.filter((usersId: UserId) => {
                if (
                    usersId.email === access.user?.email &&
                    usersId.permissions.includes(access.user.permission)
                ) {
                    return true;
                } else {
                    return false;
                }
            }).length > 0;

        return accessByGroup || accessByEmail;
    }

    /**
     * @description Verifica o bloqueio
     * @param cid {String} - CustomId da pasta
     * @param access {Access} - Propriedades do acesso para pastas
     */
    public async verifyBlocked(cid: string, access: Access): Promise<BlockVerify> {
        const folder = await folderDB.findOne({ cid });

        if (!folder)
            throw new Error(`Pasta com cid(${cid}) não existe no banco de dados.`);

        /**
         * @description Verifica se a pasta está na lixeira.
         */
        if (this._isGarbage(folder))
            throw new Error(`Pasta com cid(${cid}) está na lixeira.`);

        /**
         * @description Verifica o acesso a pasta
         */
        if (!this.verifyAccessByGroupAndUser(folder, access))
            throw new Error(`Grupo/Usuário(${JSON.stringify(access)}) não tem permissão para verificar o bloqueio da pasta com cid(${cid}).`);

        /**
         * @description Verifica se a pasta está bloqueada
         */
        if (folder.block) {
            const now = new Date();

            /**
             * @description Verifica as condições do bloqueio
             */
            if (
                folder.block.type === 'Date'
            ) {
                if (
                    now.getFullYear() <= folder.block.value.getFullYear() &&
                    now.getMonth() <= folder.block.value.getMonth() &&
                    now.getDate() <= folder.block.value.getDate() &&
                    now.getHours() <= folder.block.value.getHours() &&
                    now.getMinutes() <= folder.block.value.getMinutes()
                ) {
                    return {
                        block: true,
                        message: `A pasta com cid(${cid}) está bloqueada até ${folder.block.value.toLocaleDateString('pt-br')} às ${folder.block.value.toLocaleTimeString('pt-br')}`
                    };
                }
            } else if (folder.block.type === 'Month') {
                if (
                    now.getMonth() === folder.block.value.getMonth()
                ) {
                    return {
                        block: true,
                        message: `A pasta com cid(${cid}) está bloqueada durante esse mês.`
                    };
                }
            } else if (folder.block.type === 'Day Month') {
                if (
                    now.getDate() === folder.block.value.getDate()
                ) {
                    return {
                        block: true,
                        message: `A pasta com cid(${cid}) está bloqueada durante esse dia do mês.`
                    };
                }
            } else if (folder.block.type === 'Day Week') {
                if (
                    now.getDay() === folder.block.value.getDay()
                ) {
                    return {
                        block: true,
                        message: `A pasta com cid(${cid}) está bloqueada durante esse dia da semana.`
                    };
                }
            } else if (folder.block.type === 'Hour') {
                if (
                    now.getHours() <= folder.block.value.getHours()
                ) {
                    return {
                        block: true,
                        message: `A pasta com cid(${cid}) está bloqueada até às ${folder.block.value.toLocaleTimeString('pt-br')}.`
                    };
                }
            } else if (folder.block.type === 'Minute') {
                if (
                    now.getMinutes() <= folder.block.value.getMinutes()
                ) {
                    return {
                        block: true,
                        message: `A pasta com cid(${cid}) está bloqueada até às ${folder.block.value.toLocaleTimeString('pt-br')}.`
                    };
                }
            }

            /**
             * @description Verifica se o bloqueio deve ser repetido
             */
            if (folder.block.repeat) {
                if (
                    folder.block.type === 'Date' ||
                    folder.block.type === 'Month'
                ) {
                    folder.block.value.setFullYear(folder.block.value.getFullYear() + 1);
                } else if (
                    folder.block.type === 'Day Month'
                ) {
                    folder.block.value.setMonth(folder.block.value.getMonth() + 1);
                } else if (folder.block.type === 'Day Week') {
                    folder.block.value.setDate(folder.block.value.getDate() + 7);
                } else if (
                    folder.block.type === 'Hour' ||
                    folder.block.type === 'Minute'
                ) {
                    folder.block.value.setDate(folder.block.value.getDate() + 1);
                }
            } else {
                folder.status = 'Available';

                folder.block = undefined;
            }

            folder.updated = Moment.format();

            await folder.updateOne({ $set: { block: folder.block } });

            return {
                block: false,
                message: `Pasta com cid(${cid}) foi liberada.`
            };
        } else {
            throw new Error(`Pasta com cid(${cid}) não está bloqueada.`);
        }
    }

    /**
     * @description Retorna uma lista de pastas
     * @param filter {Object} - Filtro Aplicado na busca
     * @param skip {Number} - Pular x itens iniciais no banco de dados
     * @param limit {Number} - Limite de itens a serem retornados
     */
    public async get(filter: FilterQuery<folderModelInterface>, skip: number, limit: number): Promise<folderModelInterface[]> {
        if (skip > 9e3)
            skip = 9e3;

        if (limit > 9e3)
            limit = 9e3;

        const _folders = await folderDB.find(filter, null, { skip, limit }).exec();

        if (_folders.length < 0)
            throw new Error(`Nenhuma pastas foi encontrada.`);

        return _folders;
    }

    /**
     * @description Retorna o nome da pasta
     * @param cid {String} - CustomId da pasta
     */
    public async name(cid: string): Promise<string> {
        const folder = await folderDB.findOne({ cid });

        if (!folder)
            throw new Error(`Pasta com cid(${cid}) não foi encontrada.`);

        return folder.name;
    }

    /**
     * @description Armazena a pasta
     * @param folder {folderInterface} - Propriedades da pasta.
     */
    public async save(folder: folderInterface): Promise<folderModelInterface> {
        const uuid = uuidv4();

        const _folder = await folderDB.findOne({ name: folder.name, type: folder.type });

        if (_folder)
            throw new Error(`Pasta(${folder.name}) com o tipo (${folder.type}) já está registrada.`);

        const
            now = Moment.format(),
            model = await folderDB.create({
                ...folder,
                cid: uuid,
                updated: now,
                lastAccess: now,
                createdAt: now
            });

        await model.validate();
        await model.save();

        return model;
    }

    /**
     * @description Remove a pasta
     * @param cid {String} - CustomId da pasta
     * @param access {Acess} - Propriedades do acesso para pastas
     * @param accessFile {AccessFile} - Propriedades do acesso para arquivos
     */
    public async delete(cid: string, access: Access, accessFile: AccessFile): Promise<boolean> {
        const
            folder = await folderDB.findOne({ cid });

        let _delete = false;

        if (!folder)
            throw new Error(`Pasta com cid(${cid}) não existe no banco de dados.`);

        /**
         * @description Verifica se a pasta está na lixeira.
         */
        if (this._isGarbage(folder))
            throw new Error(`Pasta com cid(${cid}) está na lixeira.`);

        /**
         * @description Verifica se a pasta está protegida/bloqueada.
         */
        if (this._isProtectedOrBlocked(folder) && !this.verifyAccessByGroupAndUser(folder, access))
            throw new Error(`Pasta com cid(${cid}) está indisponível, a mesma está protegida ou bloqueada.`);

        /**
         * @description Verifica o acesso caso a pasta esteja protegida/bloqueada.
         */
        if (this._isProtectedOrBlocked(folder) && this.verifyAccessByGroupAndUser(folder, access)) {
            _delete = true;
        }
        /**
         * @description Verifica se a pasta está sendo reciclada.
         */
        else if (this._isRecycle(folder)) {
            _delete = true;
        }
        /**
         * @description Verifica se a pasta está disponível para há remoção.
         */
        else if (this._isAvailableAndAllowsDelete(folder)) {
            _delete = true;
        }

        if (_delete) {
            folder.status = 'Removing';

            /**
             * @description Verifica se existe arquivos associados
             */
            if (folder.filesId instanceof Array && folder.filesId.length > 0) {
                let errors = 0;

                for (const fileId of folder.filesId) {
                    try {
                        await fileManagerDB.exitFolder(fileId, accessFile, cid);
                        await fileManagerDB.close(fileId, accessFile);
                    } catch (error) { errors++; }
                }

                if (errors > 0)
                    throw new Error(`Um ou mais arquivos estão na lixeira ou em uso e/ou protegidos/bloqueados, não é possível remover a pasta no momento.`);
            }

            /**
             * @description Verifica se existe pastas associadas
             */
            if (folder.foldersId instanceof Array && folder.foldersId.length > 0) {
                let errors = 0;

                for (const folderId of folder.foldersId) {
                    try {
                        await this.delete(folderId, access, accessFile);
                    } catch (error) { errors++; }
                }

                if (errors > 0)
                    throw new Error(`Uma ou mais pastas estão na lixeira ou em uso e/ou protegidas/bloqueadas, não é possível remover a pasta no momento.`);
            }

            await folder.save();

            await folder.remove();

            return true;
        } else {
            throw new Error(`Pasta com cid(${cid}) não pode ser deletada no momento.`);
        }
    }

    /**
     * @description Adiciona um grupo na whitelist
     * @param cid {String} - CustomId da pasta
     * @param access {Access} - Propriedades do acesso para pastas
     * @param group {GroupId} - Grupo do usuário
     */
    public async addGroupId(cid: string, access: Access, group: GroupId): Promise<boolean> {
        const
            folder = await folderDB.findOne({ cid });

        let _addGroupId = false;

        if (!folder)
            throw new Error(`Pasta com cid(${cid}) não existe no banco de dados.`);

        /**
         * @description Verifica se a pasta está na lixeira.
         */
        if (this._isGarbage(folder))
            throw new Error(`Pasta com cid(${cid}) está na lixeira.`);

        /**
         * @description Verifica se a pasta está protegida/bloqueada.
         */
        if (this._isProtectedOrBlocked(folder) && !this.verifyAccessByGroupAndUser(folder, access))
            throw new Error(`Pasta com cid(${cid}) está indisponível, a mesma está protegida ou bloqueada.`);

        /**
         * @description Verifica o acesso caso a pasta esteja protegida/bloqueada.
         */
        if (this._isProtectedOrBlocked(folder) && this.verifyAccessByGroupAndUser(folder, access)) {
            _addGroupId = true;
        }
        /**
         * @description Verifica se a pasta está disponível.
         */
        else if (this._isAvailable(folder)) {
            _addGroupId = true;
        }

        if (_addGroupId) {
            /**
             * @description Verifica se a pasta está disponível para as alterações de segurança.
             */
            if (this._isAvailableAndAllowsSecurity(folder)) {
                folder.status = 'Appending';

                if (!folder.accessGroupId)
                    folder.accessGroupId = [];

                const index = folder.accessGroupId.filter((groupId: GroupId) => groupId.name === group.name).length > 0;

                if (index)
                    throw new Error(`Grupo(${group.name}) já está adicionado a whitelist da pasta com cid(${cid})`);

                folder.accessGroupId.push(group);

                folder.updated = Moment.format();

                await folder.save();

                return true;
            } else {
                throw new Error(`A pasta com cid(${cid}) está em uso e/ou não é possível adicionar o grupo(${group.name}) na whitelist.`);
            }
        } else {
            throw new Error(`A pasta com cid(${cid}) está em uso. Não é possível adicionar o grupo(${group.name}) na whitelist no momento.`);
        }
    }

    /**
     * @description Remove um grupo de acesso da whitelist
     * @param cid {String} - CustomId da pasta
     * @param access {Acess} - Propriedades do acesso para pastas
     * @param group {GroupId} - Grupo do usuário
     */
    public async removeGroupId(cid: string, access: Access, group: GroupId): Promise<boolean> {
        const
            folder = await folderDB.findOne({ cid });

        let _removeGroupId = false;

        if (!folder)
            throw new Error(`Pata com cid(${cid}) não existe no banco de dados.`);

        /**
         * @description Verifica se a pasta está na lixeira.
         */
        if (this._isGarbage(folder))
            throw new Error(`Pasta com cid(${cid}) está na lixeira.`);

        /**
         * @description Verifica se a pasta está protegida/bloqueada.
         */
        if (this._isProtectedOrBlocked(folder) && !this.verifyAccessByGroupAndUser(folder, access))
            throw new Error(`Pasta com cid(${cid}) está indisponível, a mesma está protegida ou bloqueada.`);

        /**
         * @description Verifica o acesso caso a pasta esteja protegida/bloqueada.
         */
        if (this._isProtectedOrBlocked(folder) && this.verifyAccessByGroupAndUser(folder, access)) {
            _removeGroupId = true;
        }
        /**
         * @description Verifica se a pasta está disponível.
         */
        else if (this._isAvailable(folder)) {
            _removeGroupId = true;
        }

        if (_removeGroupId) {
            /**
             * @description Verifica se a pasta está disponível para as alterações de segurança.
             */
            if (this._isAvailableAndAllowsSecurity(folder)) {
                folder.status = 'Appending';

                if (!folder.accessGroupId)
                    folder.accessGroupId = [];

                const index = folder.accessGroupId.filter((groupId: GroupId) => groupId.name === group.name).length > 0;

                if (!index)
                    throw new Error(`Grupo(${group.name}) não está na whitelist da pasta com cid(${cid})`);

                folder.accessGroupId = folder.accessGroupId.filter((groupId: GroupId) => groupId.name !== group.name);

                folder.updated = Moment.format();

                await folder.save();

                return true;
            } else {
                throw new Error(`A pasta com cid(${cid}) está em uso. Não é possível remover o grupo(${group.name}) da whitelist no momento.`);
            }
        } else {
            throw new Error(`A pasta com cid(${cid}) está em uso. Não é possível remover o grupo(${group.name}) da whitelist no momento.`);
        }
    }

    /**
     * @description Adiciona um usuário na whitelist
     * @param cid {String} - CustomId da pasta
     * @param access {Access} - Propriedades do acesso para pastas
     * @param user {UserId} - Propriedades do usuário
     */
    public async addUserId(cid: string, access: Access, user: UserId): Promise<boolean> {
        const
            folder = await folderDB.findOne({ cid });

        let _addUserId = false;

        if (!folder)
            throw new Error(`Pasta com cid(${cid}) não existe no banco de dados.`);

        /**
         * @description Verifica se a pasta está na lixeira.
         */
        if (this._isGarbage(folder))
            throw new Error(`Pasta com cid(${cid}) está na lixeira.`);

        /**
         * @description Verifica se a pasta está protegida/bloqueada.
         */
        if (this._isProtectedOrBlocked(folder) && !this.verifyAccessByGroupAndUser(folder, access))
            throw new Error(`Pasta com cid(${cid}) está indisponível, a mesma está protegida ou bloqueada.`);

        /**
         * @description Verifica o acesso caso a pasta esteja protegida/bloqueada.
         */
        if (this._isProtectedOrBlocked(folder) && this.verifyAccessByGroupAndUser(folder, access)) {
            _addUserId = true;
        }
        /**
         * @description Verifica se a pasta está disponível.
         */
        else if (this._isAvailable(folder)) {
            _addUserId = true;
        }

        if (_addUserId) {
            /**
             * @description Verifica se a pasta está disponível para as alterações de segurança.
             */
            if (this._isAvailableAndAllowsSecurity(folder)) {
                folder.status = 'Appending';

                if (!folder.accessUsersId)
                    folder.accessUsersId = [];

                const index = folder.accessUsersId.filter((userId: UserId) => userId.email === user.email).length > 0;

                if (index)
                    throw new Error(`Email(${user.email}) já está adicionado a whitelist da pasta com cid(${cid})`);

                folder.accessUsersId.push(user);

                folder.updated = Moment.format();

                await folder.save();

                return true;
            } else {
                throw new Error(`A pasta com cid(${cid}) está em uso e/ou não será possível adicionar o email(${user.email}) na whitelist.`);
            }
        } else {
            throw new Error(`A pasta com cid(${cid}) está em uso. Não é possível adicionar o email(${user.email}) na whitelist no momento.`);
        }
    }

    /**
     * @description Remove o usuário da whitelist
     * @param cid {String} - CustomId da pasta
     * @param access {Access} - Propriedades do acesso para pastas
     * @param user {UserId} - Propriedades do usuário
     */
    public async removeUserId(cid: string, access: Access, user: UserId): Promise<boolean> {
        const folder = await folderDB.findOne({ cid });

        let _removeUserId = false;

        if (!folder)
            throw new Error(`Pasta com cid(${cid}) não existe no banco de dados.`);

        /**
         * @description Verifica se a pasta está na lixeira.
         */
        if (this._isGarbage(folder))
            throw new Error(`Pasta com cid(${cid}) está na lixeira.`);

        /**
         * @description Verifica se a pasta está protegida/bloqueada.
         */
        if (this._isProtectedOrBlocked(folder) && !this.verifyAccessByGroupAndUser(folder, access))
            throw new Error(`Pasta com cid(${cid}) está indisponível, a mesma está protegida ou bloqueada.`);

        /**
         * @description Verifica o acesso caso a pasta esteja protegida/bloqueada.
         */
        if (this._isProtectedOrBlocked(folder) && this.verifyAccessByGroupAndUser(folder, access)) {
            _removeUserId = true;
        }
        /**
         * @description Verifica se a pasta está disponível.
         */
        else if (this._isAvailable(folder)) {
            _removeUserId = true;
        }

        if (_removeUserId) {
            /**
             * @description Verifica se a pasta está disponível para as alterações de segurança.
             */
            if (this._isAvailableAndAllowsSecurity(folder)) {
                folder.status = 'Appending';

                if (!folder.accessUsersId)
                    folder.accessUsersId = [];

                const index = folder.accessUsersId.filter((userId: UserId) => userId.email === user.email).length > 0;

                if (!index)
                    throw new Error(`Email(${user.email}) não está na whitelist da pasta com cid(${cid})`);

                folder.accessUsersId = folder.accessUsersId.filter((userId: UserId) => userId.email !== user.email);

                folder.updated = Moment.format();

                await folder.save();

                return true;
            } else {
                throw new Error(`A pasta com cid(${cid}) está em uso e/ou não será possível remover o email(${user.email}) da whitelist.`);
            }
        } else {
            throw new Error(`A pasta com cid(${cid}) está em uso. Não é possível remover o email(${user.email}) da whitelist no momento.`);
        }
    }

    /**
     * @description Adiciona o arquivo na pasta
     * @param cid {String} - CustomId da pasta
     * @param access {Access} - Propriedades do acesso para pastas
     * @param fileId {String} - CustomId do arquivo
     * @param accessFile {AccessFile} - Propriedades do acesso para arquivos
     */
    public async append(cid: string, access: Access, fileId: string, accessFile: AccessFile): Promise<boolean> {
        const
            folder = await folderDB.findOne({ cid }),
            file = await fileDB.findOne({ cid: fileId });

        let _append = false;

        if (!folder)
            throw new Error(`Pasta com cid(${cid}) não existe no banco de dados.`);

        if (!file)
            throw new Error(`Arquivo com cid(${fileId}) não existe no banco de dados.`);

        /**
         * @description Verifica se a pasta está na lixeira.
         */
        if (this._isGarbage(folder))
            throw new Error(`Pasta com cid(${cid}) está na lixeira.`);

        /**
         * @description Verifica se a pasta está protegida/bloqueada.
         */
        if (this._isProtectedOrBlocked(folder) && !this.verifyAccessByGroupAndUser(folder, access))
            throw new Error(`Pasta com cid(${cid}) está indisponível, a mesma está protegida ou bloqueada.`);

        /**
         * @description Verifica o acesso a pasta
         */
        if (!this.verifyAccessByGroupAndUser(folder, access))
            throw new Error(`Grupo/Usuário(${JSON.stringify(access)}) não tem permissão para adicionar arquivos na pasta com cid(${cid}).`);

        /**
         * @description Verifica o acesso caso a pasta esteja protegida/bloqueada.
         */
        if (this._isProtectedOrBlocked(folder) && this.verifyAccessByGroupAndUser(folder, access)) {
            _append = true;
        }
        /**
         * @description Verifica se a pasta está disponível para há adição.
         */
        else if (this._isAvailableAndAllowsAppending(folder)) {
            _append = true;
        }

        if (_append) {
            folder.status = 'Appending';

            if (!folder.filesId)
                folder.filesId = [];

            const index = folder.filesId.filter(_fileId => _fileId === fileId).length > 0;

            if (index)
                throw new Error(`Arquivo com cid(${fileId}) já está na pasta.`);

            try {
                await fileManagerDB.joinFolder(fileId, accessFile, cid);
                await fileManagerDB.close(fileId, accessFile);
            } catch (error) {
                throw new Error(JSON.stringify(error));
            }

            folder.filesId.push(fileId);

            folder.updated = Moment.format();

            await folder.save();

            return true;
        } else {
            throw new Error(`Pasta com cid(${cid}) não pode ter arquivos adicionados no momento.`);
        }
    }

    /**
     * @description Remove o arquivo na pasta
     * @param cid {String} - CustomId da pasta
     * @param access {Access} - Propriedades do acesso para pastas
     * @param fileId {String} - CustomId do arquivo
     * @param accessFile {AccessFile} - Propriedades do acesso para arquivos
     */
    public async remove(cid: string, access: Access, fileId: string, accessFile: AccessFile): Promise<boolean> {
        const folder = await folderDB.findOne({ cid });

        let _remove = false;

        if (!folder)
            throw new Error(`Pasta com cid(${cid}) não existe no banco de dados.`);

        /**
         * @description Verifica se a pasta está na lixeira.
         */
        if (this._isGarbage(folder))
            throw new Error(`Pasta com cid(${cid}) está na lixeira.`);

        /**
         * @description Verifica se a pasta está protegida/bloqueada.
         */
        if (this._isProtectedOrBlocked(folder) && !this.verifyAccessByGroupAndUser(folder, access))
            throw new Error(`Pasta com cid(${cid}) está indisponível, a mesma está protegida ou bloqueada.`);

        /**
         * @description Verifica o acesso a pasta
         */
        if (!this.verifyAccessByGroupAndUser(folder, access))
            throw new Error(`Grupo/Usuário(${JSON.stringify(access)}) não tem permissão para remover os arquivos da pasta com cid(${cid}).`);

        /**
         * @description Verifica o acesso caso a pasta esteja protegida/bloqueada.
         */
        if (this._isProtectedOrBlocked(folder) && this.verifyAccessByGroupAndUser(folder, access)) {
            _remove = true;
        }
        /**
         * @description Verifica se a pasta está disponível para há remoção.
         */
        else if (this._isAvailableAndAllowsDelete(folder)) {
            _remove = true;
        }

        if (_remove) {
            folder.status = 'Removing';

            if (!folder.filesId)
                folder.filesId = [];

            const index = folder.filesId.filter(_fileId => _fileId === fileId).length > 0;

            if (!index)
                throw new Error(`Arquivo com cid(${fileId}) não está na pasta.`);

            folder.filesId = folder.filesId.filter(_fileId => _fileId !== fileId);

            try {
                await fileManagerDB.exitFolder(fileId, accessFile, cid);
                await fileManagerDB.close(fileId, accessFile);
            } catch (error) {
                throw new Error(JSON.stringify(error));
            }

            folder.updated = Moment.format();

            await folder.save();

            return true;
        } else {
            throw new Error(`Pasta com cid(${cid}) não pode ter os arquivos removidos no momento.`);
        }
    }

    /**
     * @description Adiciona uma pasta a pasta
     * @param cid {String} - CustomId da pasta
     * @param access {Access} - Propriedades do acesso para pastas
     * @param folderId {String} - CustomId da pasta a ser adicionada
     */
    public async push(cid: string, access: Access, folderId: string): Promise<boolean> {
        const
            folder = await folderDB.findOne({ cid }),
            folder2 = await folderDB.findOne({ cid: folderId });

        let _push = false;

        if (!folder)
            throw new Error(`Pasta com cid(${cid}) não existe no banco de dados.`);

        if (!folder2)
            throw new Error(`Pasta a ser associada com cid(${folderId}) não existe no banco de dados.`);

        /**
         * @description Verifica se a pasta está na lixera
         * ou a pasta a ser associada está na lixeira.
         */
        if (this._isGarbage(folder) || this._isGarbage(folder2))
            throw new Error(`Uma das pastas está na lixeira.`);

        /**
         * @description Verifica se a pasta está protegida/bloqueada
         * ou a pasta a ser associada está protegida/bloqueada.
         */
        if (
            this._isProtectedOrBlocked(folder) && !this.verifyAccessByGroupAndUser(folder, access) ||
            this._isProtectedOrBlocked(folder2) && !this.verifyAccessByGroupAndUser(folder2, access)
        )
            throw new Error(`Uma das pastas está protegida/bloqueada.`);

        /**
         * @description Verifica se a pasta está associada a uma pasta.
         */
        if (
            folder.folderId !== folder2.folderId ||
            !folder.folderId && this._isAssociatedFolder(folder2)
        )
            throw new Error(`Pasta com cid(${folderId}) já está associada a uma pasta.`);

        /**
         * @description Verifica o acesso a pasta e a pasta a ser associada
         */
        if (!this.verifyAccessByGroupAndUser(folder, access))
            throw new Error(`Grupo/Usuário(${JSON.stringify(access)}) não tem permissão para mover pastas para essa pasta com cid(${cid}).`);

        if (!this.verifyAccessByGroupAndUser(folder2, access))
            throw new Error(`Grupo/Usuário(${JSON.stringify(access)}) não tem permissão para mover a pasta com cid(${folderId}) para essa pasta com cid(${cid}).`);

        /**
         * @description Verifica o acesso caso a pasta esteja protegida/bloqueada.
         * ou a pasta a ser associada está protegida/bloqueada.
         */
        if (
            this._isProtectedOrBlocked(folder) && this.verifyAccessByGroupAndUser(folder, access) ||
            this._isProtectedOrBlocked(folder2) && this.verifyAccessByGroupAndUser(folder2, access)
        ) {
            _push = true;
        }
        /**
         * @description Verifica se a pasta está disponível para há adição
         * e a pasta a ser associada está disponível para há adição.
         */
        else if (
            this._isAvailableAndAllowsAppending(folder) ||
            this._isAvailableAndAllowsAppending(folder2)
        ) {
            _push = true;
        }

        if (_push) {
            folder.status = 'Appending';

            if (!folder.foldersId)
                folder.foldersId = [];

            const index = folder.foldersId.filter(_folderId => _folderId === folderId).length > 0;

            if (index)
                throw new Error(`Pasta com cid(${folderId}) já está na pasta.`);

            /**
             * @description Retira a pasta da matriz
             */
            if (folder2.folderId !== undefined) {
                try {
                    await this.splice(folder2.folderId, {
                        group: { name: "administrador", permission: "Delete" }
                    }, folderId);

                    await this.close(folder2.folderId, {
                        group: { name: "administrador", permission: "Delete" }
                    });
                } catch (error) {
                    throw new Error(JSON.stringify(error));
                }
            }

            folder.foldersId.push(folderId);
            folder2.folderId = cid;

            folder.updated = Moment.format();
            folder2.updated = Moment.format();

            await folder.save();
            await folder2.save();

            return true;
        } else {
            throw new Error(`Pasta com cid(${cid}) não pode ter pastas adicionadas no momento.`);
        }
    }

    /**
     * @description Remove uma pasta da pasta
     * @param cid {String} - CustomId da pasta
     * @param access {Access} - Propriedades do acesso para pastas
     * @param folderId {String} - CustomId da pasta a ser adicionada
     */
    public async splice(cid: string, access: Access, folderId: string): Promise<boolean> {
        const
            folder = await folderDB.findOne({ cid }),
            folder2 = await folderDB.findOne({ cid: folderId });

        let _splice = false;

        if (!folder)
            throw new Error(`Pasta com cid(${cid}) não existe no banco de dados.`);

        if (!folder2)
            throw new Error(`Pasta a ser associada com cid(${folderId}) não existe no banco de dados.`);

        /**
         * @description Verifica se a pasta está na lixera
         * ou a pasta a ser associada está na lixeira.
         */
        if (this._isGarbage(folder) || this._isGarbage(folder2))
            throw new Error(`Uma das pastas está na lixeira.`);

        /**
         * @description Verifica se a pasta está protegida/bloqueada
         * ou a pasta a ser associada está protegida/bloqueada.
         */
        if (
            this._isProtectedOrBlocked(folder) && !this.verifyAccessByGroupAndUser(folder, access) ||
            this._isProtectedOrBlocked(folder2) && !this.verifyAccessByGroupAndUser(folder2, access)
        )
            throw new Error(`Uma das pastas está protegida/bloqueada.`);

        /**
         * @description Verifica se a pasta está associada há a pasta.
         */
        if (!this._isAssociatedFolder(folder2, cid))
            throw new Error(`Pasta com cid(${folderId}) não está associada há pasta.`);

        /**
         * @description Verifica o acesso a pasta e a pasta a ser associada
         */
        if (!this.verifyAccessByGroupAndUser(folder, access))
            throw new Error(`Grupo/Usuário(${JSON.stringify(access)}) não tem permissão para remover pastas dessa pasta com cid(${cid}).`);

        if (!this.verifyAccessByGroupAndUser(folder2, access))
            throw new Error(`Grupo/Usuário(${JSON.stringify(access)}) não tem permissão para remover a pasta com cid(${folderId}) dessa pasta com cid(${cid}).`);

        /**
         * @description Verifica o acesso caso a pasta esteja protegida/bloqueada.
         * ou a pasta a ser associada está protegida/bloqueada.
         */
        if (
            this._isProtectedOrBlocked(folder) && this.verifyAccessByGroupAndUser(folder, access) ||
            this._isProtectedOrBlocked(folder2) && this.verifyAccessByGroupAndUser(folder2, access)
        ) {
            _splice = true;
        }
        /**
         * @description Verifica se a pasta está disponível para há remoção
         * e a pasta a ser associada está disponível para há remoção.
         */
        else if (
            this._isAvailableAndAllowsDelete(folder) ||
            this._isAvailableAndAllowsDelete(folder2)
        ) {
            _splice = true;
        }

        if (_splice) {
            folder.status = 'Removing';

            if (!folder.foldersId)
                folder.foldersId = [];

            const index = folder.foldersId.filter(_folderId => _folderId === folderId).length > 0;

            if (!index)
                throw new Error(`Pasta com cid(${folderId}) não está na pasta.`);

            folder.foldersId = folder.foldersId.filter(_folderId => _folderId !== folderId);
            folder2.folderId = undefined;

            folder.updated = Moment.format();
            folder2.updated = Moment.format();

            await folder.save();
            await folder2.save();

            return true;
        } else {
            throw new Error(`Pasta com cid(${cid}) não pode ter pastas removidas no momento.`);
        }
    }

    /**
     * @description Abre a pasta e retorna os IDs dos arquivos
     * @param cid {String} - CustomId da pasta
     * @param access {Access} - Propriedades do acesso para pastas
     */
    public async open(cid: string, access: Access): Promise<string[]> {
        const
            folder = await folderDB.findOne({ cid });

        if (!folder)
            throw new Error(`Pasta com cid(${cid}) não existe no banco de dados.`);

        /**
         * @description Verifica se a pasta está na lixeira.
         */
        if (this._isGarbage(folder))
            throw new Error(`Pasta com cid(${cid}) está na lixeira.`);

        /**
         * @description Verifica se a pasta está protegida/bloqueada.
         */
        if (this._isProtectedOrBlocked(folder) && !this.verifyAccessByGroupAndUser(folder, access))
            throw new Error(`Pasta com cid(${cid}) está indisponível, a mesma está protegida ou bloqueada.`);

        /**
         * @description Verifica se a pasta está em modo appending/removing.
         */
        if (this._isAppendingOrRemoving(folder))
            throw new Error(`Pasta com cid(${cid}) está em uso no momento, não será possível acessar seu conteúdo agora.`);

        /**
         * @description Verifica o acesso caso a pasta esteja protegida/bloqueada.
         */
        if (
            !this._isProtectedOrBlocked(folder) ||
            this._isProtectedOrBlocked(folder) &&
            this.verifyAccessByGroupAndUser(folder, access)
        ) {
            if (!folder.filesId)
                folder.filesId = [];

            if (folder.filesId.length <= 0)
                throw new Error(`Pasta com cid(${cid}) está vazia.`);

            folder.lastAccess = Moment.format();

            await folder.save();

            return folder.filesId;
        } else {
            throw new Error(`Grupo/Usuário(${JSON.stringify(access)}) não tem permissão para abrir a pasta com cid(${cid}).`);
        }
    }

    /**
     * @description Volta o estado da pasta para disponível
     * @param cid {String} - CustomId da pasta
     * @param access {Access} - Propriedades do acesso para pastas
     */
    public async close(cid: string, access: Access): Promise<boolean> {
        const folder = await folderDB.findOne({ cid });

        let _close = false;

        if (!folder)
            throw new Error(`Pasta com cid(${cid}) não existe no banco de dados.`);

        /**
         * @description Verifica se a pasta está na lixeira.
         */
        if (this._isGarbage(folder))
            throw new Error(`Pasta com cid(${cid}) está na lixeira.`);

        /**
         * @description Verifica se a pasta está protegida/bloqueada.
         */
        if (this._isProtectedOrBlocked(folder) && !this.verifyAccessByGroupAndUser(folder, access))
            throw new Error(`Pasta com cid(${cid}) está indisponível, a mesma está protegida ou bloqueada.`);

        /**
         * @description Verifica o acesso caso a pasta esteja protegida/bloqueada.
         */
        if (this._isProtectedOrBlocked(folder) && this.verifyAccessByGroupAndUser(folder, access)) {
            _close = true;
        }
        /**
         * @description Verifica se a pasta está em modo appending/removing.
         */
        else if (this._isAppendingOrRemoving(folder)) {
            _close = true;
        }

        if (_close) {
            if (folder.protected) {
                folder.status = 'Protected';
            } else if (folder.blocked) {
                folder.status = 'Blocked';
            } else if (folder.recycle) {
                folder.status = 'Recycle';
            } else {
                folder.status = 'Available';
            }

            await folder.save();

            return true;
        } else {
            return true;
        }
    }

    /**
     * @description Cria uma proteção para a pasta.
     * @param cid {String} - CustomId da pasta
     * @param access {Access} - Propriedades do acesso para pastas
     * @param passphrase {String} - Texto secreto definido pelo usuário
     */
    public async protect(cid: string, access: Access, passphrase: string): Promise<string> {
        const folder = await folderDB.findOne({ cid });

        if (!folder)
            throw new Error(`Pasta com cid(${cid}) não existe no banco de dados.`);

        /**
         * @description Verifica se a pasta está na lixeira.
         */
        if (this._isGarbage(folder))
            throw new Error(`Pasta com cid(${cid}) está na lixeira.`);

        /**
         * @description Verifica se a pasta está protegida/bloqueada.
         */
        if (this._isProtectedOrBlocked(folder))
            throw new Error(`Pasta com cid(${cid}) está indisponível, a mesma está protegida ou bloqueada.`);

        /**
         * @description Verifica o acesso a pasta
         */
        if (!this.verifyAccessByGroupAndUser(folder, access))
            throw new Error(`Grupo/Usuário(${JSON.stringify(access)}) não tem permissão para proteger a pasta com cid(${cid}).`);

        /**
         * @description Verifica se a pasta está em modo appending/removing.
         */
        if (this._isAppendingOrRemoving(folder)) {
            throw new Error(`Pasta com cid(${cid}) está em uso no momento, não será possível protegê-la agora.`);
        } else {
            /**
             * @description Verifica se a pasta está disponível para a proteção.
             */
            if (this._isAvailableAndAllowsProtect(folder)) {
                const uuid = uuidv4();

                folder.status = 'Protected';

                folder.protect = {
                    key: uuid,
                    passphrase
                };

                folder.updated = Moment.format();

                await folder.save();

                return uuid;
            } else {
                throw new Error(`Pasta com cid(${cid}) está em uso e/ou não será possível protegê-la.`);
            }
        }
    }

    /**
     * @description Remove a proteção da pasta.
     * @param cid {String} - CustomId da pasta
     * @param access {Access} - Propriedades do acesso para pastas
     * @param protect {FileProtected} - Propriedades secretas da proteção da pasta.
     */
    public async unProtect(cid: string, access: Access, protect: FileProtected): Promise<boolean> {
        const folder = await folderDB.findOne({ cid });

        if (!folder)
            throw new Error(`Pasta com cid(${cid}) não existe no banco de dados.`);

        /**
         * @description Verifica se a pasta está na lixeira.
         */
        if (this._isGarbage(folder))
            throw new Error(`Pasta com cid(${cid}) está na lixeira.`);

        /**
         * @description Verifica o acesso a pasta
         */
        if (!this.verifyAccessByGroupAndUser(folder, access))
            throw new Error(`Grupo/Usuário(${JSON.stringify(access)}) não tem permissão para desproteger a pasta com cid(${cid}).`);

        /**
         * @description Verifica se a pasta está protegida.
         */
        if (this._isProtected(folder)) {
            /**
             * @description Verifica a "Chave" e o "Texto Secreto" da proteção.
             */
            if (this._verifyProtected(folder, protect)) {
                folder.status = 'Available';

                folder.protect = undefined;

                folder.updated = Moment.format();

                await folder.save();

                return true;
            } else {
                throw new Error(`Chave e/ou Texto Secreto está invalido(a).`);
            }
        } else {
            throw new Error(`Pasta com cid(${cid}) está não está protegida.`);
        }
    }

    /**
     * @description Cria o compartilhamento da pasta.
     * @param cid {String} - CustomId da pasta
     * @param access {Access} - Propriedades do acesso para pastas
     * @param title {String} - Texto personalizado usado na UI/UX.
     */
    public async share(cid: string, access: Access, title: string): Promise<{ link: string, secret: string }> {
        const folder = await folderDB.findOne({ cid });

        if (!folder)
            throw new Error(`Pasta com cid(${cid}) não existe no banco de dados.`);

        /**
         * @description Verifica se a pasta está na lixeira.
         */
        if (this._isGarbage(folder))
            throw new Error(`Pasta com cid(${cid}) está na lixeira.`);

        /**
         * @description Verifica se a pasta está protegida/bloqueada.
         */
        if (this._isProtectedOrBlocked(folder))
            throw new Error(`Pasta com cid(${cid}) está indisponível, a mesma está protegida ou bloqueada.`);

        /**
         * @description Verifica se a pasta está compartilhada.
         */
        if (this._isShared(folder))
            throw new Error(`Pasta com cid(${cid}) já está compartilhada.`);

        /**
         * @description Verifica o acesso a pasta
         */
        if (!this.verifyAccessByGroupAndUser(folder, access))
            throw new Error(`Grupo/Usuário(${JSON.stringify(access)}) não tem permissão para compartilhar a pasta com cid(${cid}).`);

        /**
         * @description Verifica se a pasta está disponível para o compartilhamento.
         */
        if (this._isAvailableAndAllowsShare(folder)) {
            /**
             * @description Verifica se a pasta está em modo appending/removing.
             */
            if (this._isAppendingOrRemoving(folder)) {
                throw new Error(`Pasta com cid(${cid}) está em uso no momento, não será possível compartilhá-la agora.`);
            } else {
                const
                    link = Random.HASH(8, 'hex'),
                    uuid = uuidv4();

                folder.share = {
                    link,
                    secret: uuid,
                    title
                };

                folder.updated = Moment.format();

                await folder.save();

                return { link, secret: uuid };
            }
        } else {
            throw new Error(`Pasta com cid(${cid}) não pode ser compartilhada.`);
        }
    }

    /**
     * @description Remove o compartilhamento da pasta.
     * @param cid {String} - CustomId da pasta
     * @param access {Access} - Propriedades do acesso para pastas
     * @param share {FileShare} - Propriedades secretas do compartilhamento da pasta.
     */
    public async unShare(cid: string, access: Access, share: Omit<FileShare, "title">): Promise<boolean> {
        const folder = await folderDB.findOne({ cid });

        if (!folder)
            throw new Error(`Pasta com cid(${cid}) não existe no banco de dados.`);

        /**
         * @description Verifica se a pasta está na lixeira.
         */
        if (this._isGarbage(folder))
            throw new Error(`Pasta com cid(${cid}) está na lixeira.`);

        /**
         * @description Verifica se a pasta está protegida/bloqueada.
         */
        if (this._isProtectedOrBlocked(folder))
            throw new Error(`Pasta com cid(${cid}) está indisponível, a mesma está protegida ou bloqueada.`);

        /**
         * @description Verifica o acesso a pasta
         */
        if (!this.verifyAccessByGroupAndUser(folder, access))
            throw new Error(`Grupo/Usuário(${JSON.stringify(access)}) não tem permissão para remover o compartilhamento da pasta com cid(${cid}).`);

        /**
         * @description Verifica se a pasta está compartilhada.
         */
        if (this._isShared(folder)) {
            /**
             * @description Verifica se a pasta está em modo appending/removing.
             */
            if (this._isAppendingOrRemoving(folder)) {
                throw new Error(`Pasta com cid(${cid}) está em uso no momento, não será possível remover o compartilhamento agora.`);
            } else {
                if (this._verifyShared(folder, share)) {
                    folder.share = undefined;

                    folder.updated = Moment.format();

                    await folder.save();

                    return true;
                } else {
                    throw new Error(`Link e/ou Texto Secreto está invalido.`);
                }
            }
        } else {
            throw new Error(`Pasta com cid(${cid}) não está compartilhada.`);
        }
    }

    /**
     * @description Bloqueia a pasta.
     * @param cid {String} - CustomId da pasta
     * @param access {Access} - Propriedades do acesso para pastas
     * @param block {FileBlocked} - Propriedades do bloqueio
     */
    public async blocked(cid: string, access: Access, block: FileBlocked): Promise<boolean> {
        const folder = await folderDB.findOne({ cid });

        if (!folder)
            throw new Error(`Pasta com cid(${cid}) não existe no banco de dados.`);

        /**
         * @description Verifica se a pasta está na lixeira.
         */
        if (this._isGarbage(folder))
            throw new Error(`Pasta com cid(${cid}) está na lixeira.`);

        /**
         * @description Verifica se a pasta está protegido/bloqueado.
         */
        if (this._isProtectedOrBlocked(folder))
            throw new Error(`Pasta com cid(${cid}) está indisponível, a mesma está protegida ou bloqueada.`);

        /**
         * @description Verifica o acesso a pasta
         */
        if (!this.verifyAccessByGroupAndUser(folder, access))
            throw new Error(`Grupo/Usuário(${JSON.stringify(access)}) não tem permissão para bloquear a pasta com cid(${cid}).`);

        /**
         * @description Verifica se a pasta está disponível para o bloqueio.
         */
        if (this._isAvailableAndAllowsBlock(folder)) {
            folder.status = 'Blocked';

            folder.block = block;

            folder.updated = Moment.format();

            await folder.save();

            return true;
        } else {
            throw new Error(`Pasta com cid(${cid}) está em uso e/ou não será possível bloqueá-la.`);
        }
    }

    /**
     * @description Desbloqueia a pasta.
     * @param cid {String} - CustomId da pasta
     * @param access {Access} - Propriedades do acesso para pastas
     */
    public async unBlocked(cid: string, access: Access): Promise<boolean> {
        const folder = await folderDB.findOne({ cid });

        if (!folder)
            throw new Error(`Pasta com cid(${cid}) não existe no banco de dados.`);

        /**
         * @description Verifica se a pasta está na lixeira.
         */
        if (this._isGarbage(folder))
            throw new Error(`Pasta com cid(${cid}) está na lixeira.`);

        /**
         * @description Verifica se a pasta está protegido.
         */
        if (this._isProtected(folder))
            throw new Error(`Pasta com cid(${cid}) está indisponível, a mesma está protegida.`);

        /**
         * @description Verifica o acesso a pasta
         */
        if (!this.verifyAccessByGroupAndUser(folder, access))
            throw new Error(`Grupo/Usuário(${JSON.stringify(access)}) não tem permissão para desbloquear a pasta com cid(${cid}).`);

        /**
         * @description Verifica se a pasta está bloqueada.
         */
        if (this._isBlocked(folder)) {
            folder.status = 'Available';

            folder.block = undefined;

            folder.updated = Moment.format();

            await folder.save();

            return true;
        } else {
            throw new Error(`Pasta com cid(${cid}) não está bloqueada.`);
        }
    }

    /**
     * @description Coloca a pasta na lixeira
     * @param cid {String} - CustomId da lixeira
     * @param access {Access} - Propriedades do acesso para pastas
     * @param accessFile {AccessFile} - Propriedades do acesso para arquivos
     */
    public async moveToGarbage(cid: string, access: Access, accessFile: AccessFile): Promise<boolean> {
        const folder = await folderDB.findOne({ cid });

        if (!folder)
            throw new Error(`Pasta com cid(${cid}) não existe no banco de dados.`);

        /**
         * @description Verifica se a pasta está na lixeira.
         */
        if (this._isGarbage(folder))
            throw new Error(`Pasta com cid(${cid}) está na lixeira.`);

        /**
         * @description Verifica se a pasta está protegido/bloqueado.
         */
        if (this._isProtectedOrBlocked(folder))
            throw new Error(`Pasta com cid(${cid}) está indisponível, a mesma está protegida ou bloqueada.`);

        /**
         * @description Verifica se a pasta está disponível.
         */
        if (this._isAvailable(folder)) {
            const now = new Date();

            now.setDate(now.getDate() + trashDays);

            await folder.updateOne({ $set: { status: 'Trash', trash: now, updated: Moment.format() } });

            /**
             * @description Verifica se existe arquivos associados
             */
            if (folder.filesId instanceof Array && folder.filesId.length > 0) {
                let errors = 0;

                for (const fileId of folder.filesId) {
                    try {
                        await fileManagerDB.moveToGarbage(fileId, accessFile);
                    } catch (error) { errors++; }
                }

                if (errors > 0)
                    throw new Error(`Um ou mais arquivos estão na lixeira ou em uso e/ou protegidos/bloqueados, não é possível colocar a pasta na lixeira no momento.`);
            }

            /**
             * @description Verifica se existe pastas associadas
             */
            if (folder.foldersId instanceof Array && folder.foldersId.length > 0) {
                let errors = 0;

                for (const folderId of folder.foldersId) {
                    try {
                        await this.moveToGarbage(folderId, access, accessFile);
                    } catch (error) { errors++; }
                }

                if (errors > 0)
                    throw new Error(`Uma ou mais pastas estão na lixeira ou em uso e/ou protegidas/bloqueadas, não é possível colocar a pasta na lixeira no momento.`);
            }

            return true;
        } else {
            throw new Error(`Pasta com cid(${cid}) está em uso no momento, não será possível coloca-la na lixeira agora.`);
        }
    }

    /**
     * @description Retira a pasta da lixeira
     * @param cid {String} - CustomId da pasta
     * @param access {Access} - Propriedades do acesso para pastas
     * @param accessFile {AccessFile} - Propriedades do acesso para arquivos
     */
    public async removeOfGarbage(cid: string, access: Access, accessFile: AccessFile): Promise<boolean> {
        const folder = await folderDB.findOne({ cid });

        if (!folder)
            throw new Error(`Pasta com cid(${cid}) não existe no banco de dados.`);

        /**
         * @description Verifica se a pasta está protegido/bloqueado.
         */
        if (this._isProtectedOrBlocked(folder))
            throw new Error(`Pasta com cid(${cid}) está indisponível, a mesma está protegida ou bloqueada.`);

        /**
         * @description Verifica se a pasta está na lixeira.
         */
        if (this._isGarbage(folder)) {
            folder.status = 'Available';

            folder.trash = undefined;

            folder.recycle = undefined;

            folder.updated = Moment.format();

            /**
             * @description Verifica se existe arquivos associados
             */
            if (folder.filesId instanceof Array && folder.filesId.length > 0) {
                let errors = 0;

                for (const fileId of folder.filesId) {
                    try {
                        await fileManagerDB.removeOfGarbage(fileId, accessFile);
                    } catch (error) { errors++; }
                }

                if (errors > 0)
                    throw new Error(`Um ou mais arquivos protegidos/bloqueados, não é possível remover a pasta da lixeira no momento.`);
            }

            /**
             * @description Verifica se existe pastas associadas
             */
            if (folder.foldersId instanceof Array && folder.foldersId.length > 0) {
                let errors = 0;

                for (const folderId of folder.foldersId) {
                    try {
                        await this.removeOfGarbage(folderId, access, accessFile);
                    } catch (error) { errors++; }
                }

                if (errors > 0)
                    throw new Error(`Uma ou mais pastas estão protegidas/bloqueadas, não é possível remover a pasta da lixeira no momento.`);
            }

            await folder.save();

            return true;
        } else {
            throw new Error(`Pasta com cid(${cid}) não está na lixeira.`);
        }
    }
}

export default new folderManagerDB();