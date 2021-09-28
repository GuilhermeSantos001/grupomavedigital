/**
 * @description Gerenciador de informações com o banco de dados
 * @author @GuilhermeSantos001
 * @update 09/09/2021
 * @version 1.31.14
 */

import { v4 as uuidv4 } from 'uuid';

import fileDB, { GroupId, UserId, Assignee, Order, OrderAnswer, FilePermission, fileInterface, fileModelInterface, FileShare, FileProtected, FileBlocked } from '@/mongo/files-manager-mongo';
import folderDB from '@/mongo/folders-manager-mongo';
import { PrivilegesSystem } from "@/mongo/user-manager-mongo";
import { HistoryFile } from '@/mongo/files-manager-mongo';
import { MetadataFile } from '@/drivers/file-gridfs';
import folderManagerDB, { Access as AccessFolder } from '@/db/folders-db';
import Moment from '@/utils/moment';
import Random from '@/utils/random';
import Jobs from '@/core/jobs';

export interface Access {
    group?: {
        name: PrivilegesSystem;
        permission: FilePermission;
    };
    user?: {
        email: string;
        permission: FilePermission;
    };
};

export interface FileRead {
    fileId: string,
    filename: string
};

export interface BlockVerify {
    block: boolean,
    message: string
};

export const trashDays: number = 30; // - Total de dias que os arquivos/pastas ficam na lixeira

export const orderDays: number = 7; // - Total de dias de validade dos pedidos

class fileManagerDB {

    constructor() { };

    /**
     * @description Verifica se o arquivo está protegido/bloqueado.
     */
    private _isProtectedOrBlocked(file: fileModelInterface): boolean {
        return file.protected || file.blocked;
    };

    /**
     * @description Verifica se o arquivo está disponível para há escrita.
     */
    private _isAvailableAndAllowsWrite(file: fileModelInterface): boolean {
        return file.available && file.allowsWrite;
    };

    /**
     * @description Verifica se o arquivo está disponível para há leitura.
     */
    private _isAvailableAndAllowsRead(file: fileModelInterface): boolean {
        return file.available && file.allowsRead;
    };

    /**
     * @description Verifica se o arquivo está disponível para há remoção.
     */
    private _isAvailableAndAllowsDelete(file: fileModelInterface): boolean {
        return file.available && file.allowsDelete;
    };

    /**
     * @description Verifica se o arquivo está disponível para a proteção.
     */
    private _isAvailableAndAllowsProtect(file: fileModelInterface): boolean {
        return file.available && file.allowsProtect;
    };

    /**
     * @description Verifica se o arquivo está disponível para o compartilhamento.
     */
    private _isAvailableAndAllowsShare(file: fileModelInterface): boolean {
        return file.available && file.allowsShare;
    };

    /**
     * @description Verifica se o arquivo está disponível para as alterações de segurança.
     */
    private _isAvailableAndAllowsSecurity(file: fileModelInterface): boolean {
        return file.available && file.allowsSecurity;
    };

    /**
     * @description Verifica se o arquivo está disponível para o bloqueio.
     */
    private _isAvailableAndAllowsBlock(file: fileModelInterface): boolean {
        return file.available && file.allowsBlock;
    };

    /**
     * @description Verifica se o arquivo está em modo escrita/leitura/remoção/atualização.
     */
    private _isWritingOrReadingOrRemovingOrUpdating(file: fileModelInterface): boolean {
        return file.writing || file.reading || file.removing || file.updating;
    };

    /**
     * @description Verifica se o arquivo está disponível.
     */
    private _isAvailable(file: fileModelInterface): boolean {
        return file.available;
    };

    /**
     * @description Verifica se o arquivo está em modo escrita.
     */
    private _isWriting(file: fileModelInterface): boolean {
        return file.writing;
    };

    /**
     * @description Verifica se o arquivo está protegido.
     */
    private _isProtected(file: fileModelInterface): boolean {
        return file.protected;
    };

    /**
     * @description Verifica se o arquivo está protegido.
     */
    private _isBlocked(file: fileModelInterface): boolean {
        return file.blocked;
    };

    /**
     * @description Verifica se o arquivo está compartilhado.
     */
    private _isShared(file: fileModelInterface): boolean {
        return file.shared;
    };

    /**
     * @description Verifica se o arquivo está na lixeira.
     */
    private _isGarbage(file: fileModelInterface): boolean {
        if (file.recycle)
            return false;

        return file.garbage;
    };

    /**
     * @description Verifica se o arquivo está na lista de reciclagem
     */
    private _isRecycle(file: fileModelInterface): boolean {
        return file.status === 'Recycle';
    };

    /**
     * @description Verifica se o arquivo está associado a uma pasta.
     */
    private _isAssociatedFolder(file: fileModelInterface, folderId?: string): boolean {
        if (!folderId)
            return file.isAssociatedFolder;

        return file.folderId === folderId;
    };

    /**
     * @description Verifica se o arquivo tem procuradores associados
     */
    private _isContainsAssignees(file: fileModelInterface): boolean {
        if (!file.assignees || file.assignees && file.assignees.length <= 0)
            return false;

        return true;
    };

    /**
     * @description Verifica a "Chave" e o "Texto Secreto" da proteção.
     */
    private _verifyProtected(file: fileModelInterface, protect: FileProtected): boolean {
        if (file.protect?.key === protect.key && file.protect.passphrase === protect.passphrase) {
            return true;
        } else {
            return false;
        };
    };

    /**
     * @description Verifica o "Link" e o "Texto Secreto" do compartilhamento.
     */
    private _verifyShared(file: fileModelInterface, share: Omit<FileShare, "title">): boolean {
        if (file.share?.link === share.link && file.share.secret === share.secret) {
            return true;
        } else {
            return false;
        };
    };

    /**
     * @description Verifica se o grupo/usuário está na whitelist do arquivo.
     * @param group { name: string; permission: PrivilegesSystem} - Grupo do usuário e permissão
     * @param user { email: string; permission: PrivilegesSystem} - Email do usuário e permissão
     */
    private verifyAccessByGroupAndUser(file: fileModelInterface, access: Access): boolean {
        /**
         * @description Verifica se o arquivo não tem nenhum grupo/usuário associado
         */
        if (!file.isAssociatedGroup && !file.isAssociatedUser) {
            return true;
        };

        if (!file.accessGroupId)
            file.accessGroupId = [];

        if (!file.accessUsersId)
            file.accessUsersId = [];

        let
            accessByGroup: boolean = file.accessGroupId.filter((groupId: GroupId) => {
                if (
                    groupId.name === access.group?.name &&
                    groupId.permissions.includes(access.group.permission)
                ) {
                    return true;
                } else {
                    return false;
                };
            }).length > 0,
            accessByEmail: boolean = file.accessUsersId.filter((usersId: UserId) => {
                if (
                    usersId.email === access.user?.email &&
                    usersId.permissions.includes(access.user.permission)
                ) {
                    return true;
                } else {
                    return false;
                };
            }).length > 0;

        return accessByGroup || accessByEmail;
    };

    /**
     * @description Reciclagem dos arquivos na lixeira
     */
    public recycleGarbage() {
        return new Promise<string[]>(async (resolve, reject) => {
            try {
                let
                    files = await fileDB.find({ trash: { $ne: undefined } }),
                    itens: string[] = [];

                if (files.length > 0) {
                    for (const [index, file] of files.entries()) {
                        if (file.trash instanceof Date) {
                            const now = new Date();

                            /**
                             * @description Verifica se os arquivos já podem ser reciclados
                             */
                            if (now > file.trash && file.status !== 'Recycle') {
                                file.status = 'Recycle';

                                file.recycle = true;

                                file.updated = Moment.format();

                                await file.save();

                                if (typeof file.cid === 'string')
                                    itens.push(file.cid);
                            }
                            /**
                             * @description verifica se o arquivo já está programado para reciclagem
                             */
                            else if (file.status === 'Recycle') {
                                if (typeof file.cid === 'string')
                                    itens.push(file.cid);
                            };

                            /**
                             * @description Verifica se o arquivo é o último da lista
                             */
                            if (files.length - 1 <= index) {
                                return resolve(itens);
                            }
                        } else {
                            return resolve(itens);
                        };
                    };
                } else {
                    return resolve(itens);
                };
            } catch (error) {
                return reject(error);
            };
        });
    };

    /**
     * @description Verifica o bloqueio
     * @param cid {String} - CustomId do arquivo
     * @param access {Access} - Propriedades do acesso para arquivos
     */
    public verifyBlocked(cid: string, access: Access) {
        return new Promise<BlockVerify>(async (resolve, reject) => {
            try {
                const file = await fileDB.findOne({ cid });

                if (!file) {
                    return reject(`Arquivo com cid(${cid}) não existe no banco de dados.`);
                };

                /**
                 * @description Verifica se o arquivo está na lixeira.
                 */
                if (this._isGarbage(file)) {
                    return reject(`Arquivo com cid(${cid}) está na lixeira.`);
                };

                /**
                 * @description Verifica o acesso ao arquivo
                 */
                if (!this.verifyAccessByGroupAndUser(file, access)) {
                    return reject(`Grupo/Usuário(${JSON.stringify(access)}) não tem permissão para verificar o bloqueio do arquivo com cid(${cid}).`);
                };

                /**
                 * @description Verifica se o arquivo está bloqueado
                 */
                if (file.block) {
                    const now = new Date();

                    /**
                     * @description Verifica as condições do bloqueio
                     */
                    if (
                        file.block.type === 'Date'
                    ) {
                        if (
                            now.getFullYear() <= file.block.value.getFullYear() &&
                            now.getMonth() <= file.block.value.getMonth() &&
                            now.getDate() <= file.block.value.getDate() &&
                            now.getHours() <= file.block.value.getHours() &&
                            now.getMinutes() <= file.block.value.getMinutes()
                        ) {
                            return resolve({
                                block: true,
                                message: `O arquivo com cid(${cid}) está bloqueado até ${file.block.value.toLocaleDateString('pt-br')} às ${file.block.value.toLocaleTimeString('pt-br')}`
                            });
                        };
                    } else if (file.block.type === 'Month') {
                        if (
                            now.getMonth() === file.block.value.getMonth()
                        ) {
                            return resolve({
                                block: true,
                                message: `O arquivo com cid(${cid}) está bloqueado durante esse mês.`
                            });
                        };
                    } else if (file.block.type === 'Day Month') {
                        if (
                            now.getDate() === file.block.value.getDate()
                        ) {
                            return resolve({
                                block: true,
                                message: `O arquivo com cid(${cid}) está bloqueado durante esse dia do mês.`
                            });
                        };
                    } else if (file.block.type === 'Day Week') {
                        if (
                            now.getDay() === file.block.value.getDay()
                        ) {
                            return resolve({
                                block: true,
                                message: `O arquivo com cid(${cid}) está bloqueado durante esse dia da semana.`
                            });
                        };
                    } else if (file.block.type === 'Hour') {
                        if (
                            now.getHours() <= file.block.value.getHours()
                        ) {
                            return resolve({
                                block: true,
                                message: `O arquivo com cid(${cid}) está bloqueado até às ${file.block.value.toLocaleTimeString('pt-br')}.`
                            });
                        };
                    } else if (file.block.type === 'Minute') {
                        if (
                            now.getMinutes() <= file.block.value.getMinutes()
                        ) {
                            return resolve({
                                block: true,
                                message: `O arquivo com cid(${cid}) está bloqueado até às ${file.block.value.toLocaleTimeString('pt-br')}.`
                            });
                        };
                    };

                    /**
                     * @description Verifica se o bloqueio deve ser repetido
                     */
                    if (file.block.repeat) {
                        if (
                            file.block.type === 'Date' ||
                            file.block.type === 'Month'
                        ) {
                            file.block.value.setFullYear(file.block.value.getFullYear() + 1);
                        } else if (
                            file.block.type === 'Day Month'
                        ) {
                            file.block.value.setMonth(file.block.value.getMonth() + 1);
                        } else if (file.block.type === 'Day Week') {
                            file.block.value.setDate(file.block.value.getDate() + 7);
                        } else if (
                            file.block.type === 'Hour' ||
                            file.block.type === 'Minute'
                        ) {
                            file.block.value.setDate(file.block.value.getDate() + 1);
                        };
                    } else {
                        file.status = 'Available';

                        file.block = undefined;
                    };

                    await file.updateOne({ $set: { status: file.status, block: file.block, updated: Moment.format() } });

                    return resolve({
                        block: false,
                        message: `Arquivo com cid(${cid}) foi liberado.`
                    });
                } else {
                    return reject(`Arquivo com cid(${cid}) não está bloqueado.`);

                };
            } catch (error) {
                return reject(error);
            };
        });
    };

    /**
     * @description Retorna uma lista de arquivos
     * @param filter {Object} - Filtro Aplicado na busca
     * @param skip {Number} - Pular x itens iniciais no banco de dados
     * @param limit {Number} - Limite de itens a serem retornados
     */
    public get(filter: object, skip: number, limit: number) {
        return new Promise<fileModelInterface[]>(async (resolve, reject) => {
            try {
                if (skip > 9e3)
                    skip = 9e3;

                if (limit > 9e3)
                    limit = 9e3;

                const _files = await fileDB.find(filter, null, { skip, limit }).exec();

                if (_files.length < 0) {
                    return reject(`Nenhum arquivo foi encontrado.`);
                };

                return resolve(_files);
            } catch (error) {
                return reject(error);
            };
        });
    };

    /**
     * @description Armazena o arquivo
     * @param file {fileInterface} - Propriedades do arquivo.
     */
    public save(file: fileInterface) {
        return new Promise<fileModelInterface>(async (resolve, reject) => {
            try {
                const uuid = uuidv4();

                const _file = await fileDB.findOne({ name: file.name, type: file.type });

                if (_file) {
                    return reject(`Arquivo(${file.name}.${file.type}) já está registrado.`);
                };

                const
                    now = Moment.format(),
                    model = await fileDB.create({
                        ...file,
                        cid: uuid,
                        updated: now,
                        lastAccess: now,
                        createdAt: now
                    });

                await model.validate();
                await model.save();

                return resolve(model);
            } catch (error) {
                return reject(error);
            };
        });
    };

    /**
     * @description Atualiza as informações do arquivo
     * @param cid {String} - CustomId do arquivo
     * @param access {Access} - Propriedades do acesso para arquivos
     * @param data Pick<fileInterface, "name" | "description" | "tag"> - Propriedades a serem atualizadas do arquivo.
     */
    public update(cid: string, access: Access, data: Pick<fileInterface, "name" | "description" | "tag">) {
        return new Promise<boolean>(async (resolve, reject) => {
            try {
                let
                    file = await fileDB.findOne({ cid }),
                    _update = false;

                if (!file) {
                    return reject(`Arquivo com cid(${cid}) não existe no banco de dados.`);
                };

                /**
                 * @description Verifica se existe outro arquivo com o novo nome
                 */
                let _exist = await fileDB.findOne({ name: data.name, type: file.type });

                if (_exist && _exist.cid !== cid) {
                    return reject(`Já existe um arquivo com o mesmo nome: ${data.name}${file.type}`);
                };

                /**
                 * @description Verifica se o arquivo está na lixeira.
                 */
                if (this._isGarbage(file)) {
                    return reject(`Arquivo com cid(${cid}) está na lixeira.`);
                };

                /**
                 * @description Verifica se o arquivo está protegido/bloqueado.
                 */
                if (this._isProtectedOrBlocked(file) && !this.verifyAccessByGroupAndUser(file, access)) {
                    return reject(`Arquivo com cid(${cid}) está indisponível, o mesmo está protegido ou bloqueado.`);
                };

                /**
                 * @description Verifica o acesso ao arquivo
                 */
                if (!this.verifyAccessByGroupAndUser(file, access)) {
                    return reject(`Grupo/Usuário(${JSON.stringify(access)}) não tem permissão para escrever no arquivo com cid(${cid}).`);
                };

                /**
                 * @description Verifica o acesso caso o arquivo esteja protegido/bloqueado.
                 */
                if (this._isProtectedOrBlocked(file) && this.verifyAccessByGroupAndUser(file, access)) {
                    _update = true;
                }
                /**
                 * @description Verifica se o arquivo está disponível.
                 */
                else if (this._isAvailable(file)) {
                    _update = true;
                };

                if (_update) {
                    file.status = 'Updating';

                    file.name = data.name;
                    file.tag = data.tag;
                    file.description = data.description;

                    file.updated = Moment.format();

                    await file.save();

                    return resolve(true);
                } else {
                    return reject(`O arquivo com cid(${cid}) não está disponível no momento, para há atualização.`);
                };
            } catch (error) {
                return reject(error);
            };
        });
    };

    /**
     * @description Remove o arquivo
     * @param cid {String} - CustomId do arquivo
     * @param access {Access} - Propriedades do acesso para arquivos
     * @param accessFolder {accessFolder} - Propriedades do acesso para pastas
     */
    public delete(cid: string, access: Access, accessFolder: AccessFolder) {
        return new Promise<boolean>(async (resolve, reject) => {
            try {
                let
                    file = await fileDB.findOne({ cid }),
                    _delete = false;

                if (!file) {
                    return reject(`Arquivo com cid(${cid}) não existe no banco de dados.`);
                };

                /**
                 * @description Verifica se o arquivo está na lixeira.
                 */
                if (this._isGarbage(file)) {
                    return reject(`Arquivo com cid(${cid}) está na lixeira.`);
                };

                /**
                 * @description Verifica se o arquivo está protegido/bloqueado.
                 */
                if (this._isProtectedOrBlocked(file) && !this.verifyAccessByGroupAndUser(file, access)) {
                    return reject(`Arquivo com cid(${cid}) está indisponível, o mesmo está protegido ou bloqueado.`);
                };

                /**
                 * @description Verifica o acesso caso o arquivo esteja protegido/bloqueado.
                 */
                if (this._isProtectedOrBlocked(file) && this.verifyAccessByGroupAndUser(file, access)) {
                    _delete = true;
                }
                /**
                 * @description Verifica se o arquivo está sendo reciclado.
                 */
                else if (this._isRecycle(file)) {
                    _delete = true;
                }
                /**
                 * @description Verifica se o arquivo está disponível para há remoção.
                 */
                else if (this._isAvailableAndAllowsDelete(file)) {
                    _delete = true;
                };

                if (_delete) {
                    file.status = 'Removing';

                    /**
                     * @description Verifica se o arquivo está associado a uma pasta.
                     */
                    if (this._isAssociatedFolder(file)) {
                        try {
                            await folderManagerDB.remove(file.folderId || "", accessFolder, cid, access);
                            await folderManagerDB.close(file.folderId || "", accessFolder);
                        } catch (error) {
                            return reject(`A pasta(${file.folderId}) está protegida/bloqueada ou na lixeira, não é possível remover o arquivo no momento.`);
                        }
                    };

                    await file.save();

                    await file.remove();

                    return resolve(true);
                } else {
                    return reject(`Arquivo com cid(${cid}) não pode ser deletado no momento.`);
                };
            } catch (error) {
                return reject(error);
            };
        });
    };

    /**
     * @description Adiciona o arquivo na pasta.
     * @param cid {String} - CustomId do arquivo
     * @param access {Access} - Propriedades do acesso para arquivos
     * @param folderId {String} - CustomId da pasta
     */
    public joinFolder(cid: string, access: Access, folderId: string) {
        return new Promise<boolean>(async (resolve, reject) => {
            try {
                let
                    file = await fileDB.findOne({ cid }),
                    folder = await folderDB.findOne({ cid: folderId }),
                    _join = false;

                if (!file) {
                    return reject(`Arquivo com cid(${cid}) não existe no banco de dados.`);
                };

                if (!folder) {
                    return reject(`Pasta com cid(${folderId}) não existe no banco de dados.`);
                };

                /**
                 * @description Verifica se o arquivo está na lixeira.
                 */
                if (this._isGarbage(file)) {
                    return reject(`Arquivo com cid(${cid}) está na lixeira.`);
                };

                /**
                 * @description Verifica se o arquivo está protegido/bloqueado.
                 */
                if (this._isProtectedOrBlocked(file) && !this.verifyAccessByGroupAndUser(file, access)) {
                    return reject(`Arquivo com cid(${cid}) está indisponível, o mesmo está protegido ou bloqueado.`);
                };

                /**
                 * @description Verifica o acesso ao arquivo
                 */
                if (!this.verifyAccessByGroupAndUser(file, access)) {
                    return reject(`Grupo/Usuário(${JSON.stringify(access)}) não tem permissão para adicionar o arquivo com cid(${cid}) na pasta.`);
                };

                /**
                 * @description Verifica o acesso caso o arquivo esteja protegido/bloqueado.
                 */
                if (this._isProtectedOrBlocked(file) && this.verifyAccessByGroupAndUser(file, access)) {
                    _join = true;
                }
                /**
                 * @description Verifica se o arquivo está disponível.
                 */
                else if (this._isAvailable(file)) {
                    _join = true;
                };

                if (_join) {
                    /**
                     * @description Verifica se o arquivo está associado a uma pasta.
                     */
                    if (
                        file.folderId !== folder.folderId ||
                        !file.folderId && this._isAssociatedFolder(file)
                    ) {
                        return reject(`Arquivo com cid(${cid}) já está associado a uma pasta com o cid(${file.folderId}).`);
                    };

                    file.status = 'Updating';

                    file.folderId = folderId;

                    file.updated = Moment.format();

                    await file.save();

                    return resolve(true);
                } else {
                    return reject(`O arquivo com cid(${cid}) está em uso. Não é possível associá-lo a pasta com o cid(${folderId}) no momento.`);
                };
            } catch (error) {
                return reject(error);
            };
        });
    };

    /**
     * @description Retira o arquivo da pasta.
     * @param cid {String} - CustomId do arquivo
     * @param access {Access} - Propriedades do acesso para arquivos
     * @param folderId {String} - CustomId da pasta
     */
    public exitFolder(cid: string, access: Access, folderId: string) {
        return new Promise<boolean>(async (resolve, reject) => {
            try {
                let
                    file = await fileDB.findOne({ cid }),
                    folder = await folderDB.findOne({ cid: folderId }),
                    _exit = false;

                if (!file) {
                    return reject(`Arquivo com cid(${cid}) não existe no banco de dados.`);
                };

                if (!folder) {
                    return reject(`Pasta com cid(${folderId}) não existe no banco de dados.`);
                };

                /**
                 * @description Verifica se o arquivo está na lixeira.
                 */
                if (this._isGarbage(file)) {
                    return reject(`Arquivo com cid(${cid}) está na lixeira.`);
                };

                /**
                 * @description Verifica se o arquivo está protegido/bloqueado.
                 */
                if (this._isProtectedOrBlocked(file) && !this.verifyAccessByGroupAndUser(file, access)) {
                    return reject(`Arquivo com cid(${cid}) está indisponível, o mesmo está protegido ou bloqueado.`);
                };

                /**
                 * @description Verifica o acesso ao arquivo
                 */
                if (!this.verifyAccessByGroupAndUser(file, access)) {
                    return reject(`Grupo/Usuário(${JSON.stringify(access)}) não tem permissão para retirar o arquivo com cid(${cid}) da pasta.`);
                };

                /**
                 * @description Verifica o acesso caso o arquivo esteja protegido/bloqueado.
                 */
                if (this._isProtectedOrBlocked(file) && this.verifyAccessByGroupAndUser(file, access)) {
                    _exit = true;
                }
                /**
                 * @description Verifica se o arquivo está disponível.
                 */
                else if (this._isAvailable(file)) {
                    _exit = true;
                };

                if (_exit) {
                    /**
                     * @description Verifica se o arquivo está associado há pasta.
                     */
                    if (this._isAssociatedFolder(file, folderId)) {
                        file.status = 'Updating';

                        file.folderId = undefined;

                        file.updated = Moment.format();

                        await file.save();

                        return resolve(true);
                    } else {
                        return reject(`Arquivo com cid(${cid}) não está associado há pasta com o cid(${folderId}).`);
                    }
                } else {
                    return reject(`O arquivo com cid(${cid}) está em uso. Não é possível remove-lo da pasta com o cid(${folderId}) no momento.`);
                };
            } catch (error) {
                return reject(error);
            };
        });
    };

    /**
     * @description Adiciona um grupo na whitelist
     * @param cid {String} - CustomId do arquivo
     * @param access {Access} - Propriedades do acesso para arquivos
     * @param group {GroupId} - Grupo do usuário
     */
    public addGroupId(cid: string, access: Access, group: GroupId) {
        return new Promise<boolean>(async (resolve, reject) => {
            try {
                let
                    file = await fileDB.findOne({ cid }),
                    _addGroupId = false;

                if (!file) {
                    return reject(`Arquivo com cid(${cid}) não existe no banco de dados.`);
                };

                /**
                 * @description Verifica se o arquivo está na lixeira.
                 */
                if (this._isGarbage(file)) {
                    return reject(`Arquivo com cid(${cid}) está na lixeira.`);
                };

                /**
                 * @description Verifica se o arquivo está protegido/bloqueado.
                 */
                if (this._isProtectedOrBlocked(file) && !this.verifyAccessByGroupAndUser(file, access)) {
                    return reject(`Arquivo com cid(${cid}) está indisponível, o mesmo está protegido ou bloqueado.`);
                };

                /**
                 * @description Verifica o acesso ao arquivo
                 */
                if (!this.verifyAccessByGroupAndUser(file, access)) {
                    return reject(`Grupo/Usuário(${JSON.stringify(access)}) não tem permissão para adicionar o grupo na whitelist do arquivo com cid(${cid}).`);
                };

                /**
                 * @description Verifica o acesso caso o arquivo esteja protegido/bloqueado.
                 */
                if (this._isProtectedOrBlocked(file) && this.verifyAccessByGroupAndUser(file, access)) {
                    _addGroupId = true;
                }
                /**
                 * @description Verifica se o arquivo está disponível.
                 */
                else if (this._isAvailable(file)) {
                    _addGroupId = true;
                };

                /**
                 * @description Verifica se o arquivo está disponível.
                 */
                if (_addGroupId) {
                    /**
                     * @description Verifica se o arquivo está disponível para as alterações de segurança.
                     */
                    if (this._isAvailableAndAllowsSecurity(file)) {
                        file.status = 'Updating';

                        if (!file.accessGroupId)
                            file.accessGroupId = [];

                        const index = file.accessGroupId.filter((groupId: GroupId) => groupId.name === group.name).length > 0;

                        if (index) {
                            return reject(`Grupo(${group.name}) já está adicionado na whitelist do arquivo com cid(${cid})`);
                        };

                        file.accessGroupId.push(group);

                        file.updated = Moment.format();

                        await file.save();

                        return resolve(true);
                    } else {
                        return reject(`O arquivo com cid(${cid}) está em uso e/ou não será possível adicionar o grupo(${group.name}) na whitelist.`);
                    };
                } else {
                    return reject(`O arquivo com cid(${cid}) está em uso. Não é possível adicionar o grupo(${group.name}) na whitelist no momento.`);
                };
            } catch (error) {
                return reject(error);
            };
        });
    };

    /**
     * @description Remove um grupo de acesso da whitelist
     * @param cid {String} - CustomId do arquivo
     * @param access {Access} - Propriedades do acesso para arquivos
     * @param group {GroupId} - Grupo do usuário
     */
    public removeGroupId(cid: string, access: Access, group: Pick<GroupId, "name">) {
        return new Promise<boolean>(async (resolve, reject) => {
            try {
                let
                    file = await fileDB.findOne({ cid }),
                    _removeGroupId = false;

                if (!file) {
                    return reject(`Arquivo com cid(${cid}) não existe no banco de dados.`);
                };

                /**
                 * @description Verifica se o arquivo está na lixeira.
                 */
                if (this._isGarbage(file)) {
                    return reject(`Arquivo com cid(${cid}) está na lixeira.`);
                };

                /**
                 * @description Verifica se o arquivo está protegido/bloqueado.
                 */
                if (this._isProtectedOrBlocked(file) && !this.verifyAccessByGroupAndUser(file, access)) {
                    return reject(`Arquivo com cid(${cid}) está indisponível, o mesmo está protegido ou bloqueado.`);
                };

                /**
                 * @description Verifica o acesso ao arquivo
                 */
                if (!this.verifyAccessByGroupAndUser(file, access)) {
                    return reject(`Grupo/Usuário(${JSON.stringify(access)}) não tem permissão para remover o grupo na whitelist do arquivo com cid(${cid}).`);
                };

                /**
                 * @description Verifica o acesso caso o arquivo esteja protegido/bloqueado.
                 */
                if (this._isProtectedOrBlocked(file) && this.verifyAccessByGroupAndUser(file, access)) {
                    _removeGroupId = true;
                }
                /**
                 * @description Verifica se o arquivo está disponível.
                 */
                else if (this._isAvailable(file)) {
                    _removeGroupId = true;
                };

                if (_removeGroupId) {
                    /**
                     * @description Verifica se o arquivo está disponível para as alterações de segurança.
                     */
                    if (this._isAvailableAndAllowsSecurity(file)) {
                        file.status = 'Updating';

                        if (!file.accessGroupId)
                            file.accessGroupId = [];

                        const index = file.accessGroupId.filter((groupId: GroupId) => groupId.name === group.name).length > 0;

                        if (!index) {
                            return reject(`Grupo(${group.name}) não está na whitelist do arquivo com cid(${cid})`);
                        };

                        file.accessGroupId = file.accessGroupId.filter((groupId: GroupId) => groupId.name !== group.name);

                        file.updated = Moment.format();

                        await file.save();

                        return resolve(true);
                    } else {
                        return reject(`O arquivo com cid(${cid}) está em uso e/ou não será possível remover o grupo(${group.name}) da whitelist.`);
                    };
                } else {
                    return reject(`O arquivo com cid(${cid}) está em uso. Não é possível remover o grupo(${group.name}) da whitelist no momento.`);
                };
            } catch (error) {
                return reject(error);
            };
        });
    };

    /**
     * @description Adiciona um usuário na whitelist
     * @param cid {String} - CustomId do arquivo
     * @param access {Access} - Propriedades do acesso para arquivos
     * @param user {UserId} - Propriedades do usuário
     */
    public addUserId(cid: string, access: Access, user: UserId) {
        return new Promise<boolean>(async (resolve, reject) => {
            try {
                let
                    file = await fileDB.findOne({ cid }),
                    _addUserId = false;

                if (!file) {
                    return reject(`Arquivo com cid(${cid}) não existe no banco de dados.`);
                };

                /**
                 * @description Verifica se o arquivo está na lixeira.
                 */
                if (this._isGarbage(file)) {
                    return reject(`Arquivo com cid(${cid}) está na lixeira.`);
                };

                /**
                 * @description Verifica se o arquivo está protegido/bloqueado.
                 */
                if (this._isProtectedOrBlocked(file) && !this.verifyAccessByGroupAndUser(file, access)) {
                    return reject(`Arquivo com cid(${cid}) está indisponível, o mesmo está protegido ou bloqueado.`);
                };

                /**
                 * @description Verifica o acesso ao arquivo
                 */
                if (!this.verifyAccessByGroupAndUser(file, access)) {
                    return reject(`Grupo/Usuário(${JSON.stringify(access)}) não tem permissão para adicionar o usuário na whitelist do arquivo com cid(${cid}).`);
                };

                /**
                 * @description Verifica o acesso caso o arquivo esteja protegido/bloqueado.
                 */
                if (this._isProtectedOrBlocked(file) && this.verifyAccessByGroupAndUser(file, access)) {
                    _addUserId = true;
                }
                /**
                 * @description Verifica se o arquivo está disponível.
                 */
                else if (this._isAvailable(file)) {
                    _addUserId = true;
                };

                if (_addUserId) {
                    /**
                     * @description Verifica se o arquivo está disponível para as alterações de segurança.
                     */
                    if (this._isAvailableAndAllowsSecurity(file)) {
                        file.status = 'Updating';

                        if (!file.accessUsersId)
                            file.accessUsersId = [];

                        const index = file.accessUsersId.filter((userId: UserId) => userId.email === user.email).length > 0;

                        if (index) {
                            return reject(`Email(${user.email}) já está adicionado na whitelist do arquivo com cid(${cid})`);
                        }

                        file.accessUsersId.push(user);

                        file.updated = Moment.format();

                        await file.save();

                        return resolve(true);
                    } else {
                        return reject(`O arquivo com cid(${cid}) está em uso e/ou não será possível adicionar o email(${user.email}) na whitelist.`);
                    };
                } else {
                    return reject(`O arquivo com cid(${cid}) está em uso. Não é possível adicionar o email(${user.email}) na whitelist no momento.`);
                };
            } catch (error) {
                return reject(error);
            };
        });
    };

    /**
     * @description Remove o usuário da whitelist
     * @param cid {String} - CustomId do arquivo
     * @param access {Access} - Propriedades do acesso para arquivos
     * @param user {UserId} - Propriedades do usuário
     */
    public removeUserId(cid: string, access: Access, user: Pick<UserId, "email">) {
        return new Promise<boolean>(async (resolve, reject) => {
            try {
                let
                    file = await fileDB.findOne({ cid }),
                    _removeUserId = false;

                if (!file) {
                    return reject(`Arquivo com cid(${cid}) não existe no banco de dados.`);
                };

                /**
                 * @description Verifica se o arquivo está na lixeira.
                 */
                if (this._isGarbage(file)) {
                    return reject(`Arquivo com cid(${cid}) está na lixeira.`);
                };

                /**
                 * @description Verifica se o arquivo está protegido/bloqueado.
                 */
                if (this._isProtectedOrBlocked(file) && !this.verifyAccessByGroupAndUser(file, access)) {
                    return reject(`Arquivo com cid(${cid}) está indisponível, o mesmo está protegido ou bloqueado.`);
                };

                /**
                 * @description Verifica o acesso ao arquivo
                 */
                if (!this.verifyAccessByGroupAndUser(file, access)) {
                    return reject(`Grupo/Usuário(${JSON.stringify(access)}) não tem permissão para remover o usuário na whitelist do arquivo com cid(${cid}).`);
                };

                /**
                 * @description Verifica o acesso caso o arquivo esteja protegido/bloqueado.
                 */
                if (this._isProtectedOrBlocked(file) && this.verifyAccessByGroupAndUser(file, access)) {
                    _removeUserId = true;
                }
                /**
                 * @description Verifica se o arquivo está disponível.
                 */
                else if (this._isAvailable(file)) {
                    _removeUserId = true;
                };

                if (_removeUserId) {
                    /**
                     * @description Verifica se o arquivo está disponível para as alterações de segurança.
                     */
                    if (this._isAvailableAndAllowsSecurity(file)) {
                        file.status = 'Updating';

                        if (!file.accessUsersId)
                            file.accessUsersId = [];

                        const index = file.accessUsersId.filter((userId: UserId) => userId.email === user.email).length > 0;

                        if (!index) {
                            return reject(`Email(${user.email}) não está na whitelist do arquivo com cid(${cid})`);
                        }

                        file.accessUsersId = file.accessUsersId.filter((userId: UserId) => userId.email !== user.email);

                        file.updated = Moment.format();

                        await file.save();

                        return resolve(true);
                    } else {
                        return reject(`O arquivo com cid(${cid}) está em uso. Não é possível remover o email(${user.email}) da whitelist no momento.`);

                    };
                } else {
                    return reject(`O arquivo com cid(${cid}) está em uso. Não é possível remover o email(${user.email}) da whitelist no momento.`);
                };
            } catch (error) {
                return reject(error);
            };
        });
    };

    /**
     * @description Adiciona um novo procurador
     * @param cid {String} - CustomId do arquivo
     * @param access {Access} - Propriedades do acesso
     * @param assignee {Assignee} - Propriedades do procurador
     */
    public addAssignee(cid: string, access: Access, assignee: Assignee) {
        return new Promise<boolean>(async (resolve, reject) => {
            try {
                let
                    file = await fileDB.findOne({ cid }),
                    _addAssignee = false;

                if (!file) {
                    return reject(`Arquivo com cid(${cid}) não existe no banco de dados.`);
                };

                /**
                 * @description Verifica se o arquivo está na lixeira.
                 */
                if (this._isGarbage(file)) {
                    return reject(`Arquivo com cid(${cid}) está na lixeira.`);
                };

                /**
                 * @description Verifica se o arquivo está protegido/bloqueado.
                 */
                if (this._isProtectedOrBlocked(file) && !this.verifyAccessByGroupAndUser(file, access)) {
                    return reject(`Arquivo com cid(${cid}) está indisponível, o mesmo está protegido ou bloqueado.`);
                };

                /**
                 * @description Verifica o acesso ao arquivo
                 */
                if (!this.verifyAccessByGroupAndUser(file, access)) {
                    return reject(`Grupo/Usuário(${JSON.stringify(access)}) não tem permissão para adicionar um procurador ao arquivo com cid(${cid}).`);
                };

                /**
                 * @description Verifica o acesso caso o arquivo esteja protegido/bloqueado.
                 */
                if (this._isProtectedOrBlocked(file) && this.verifyAccessByGroupAndUser(file, access)) {
                    _addAssignee = true;
                }
                /**
                 * @description Verifica se o arquivo está disponível.
                 */
                else if (this._isAvailable(file)) {
                    _addAssignee = true;
                };

                if (_addAssignee) {
                    /**
                     * @description Verifica se o arquivo está disponível para as alterações de segurança.
                     */
                    if (this._isAvailableAndAllowsSecurity(file)) {
                        file.status = 'Updating';

                        if (!file.assignees)
                            file.assignees = [];

                        const index = file.assignees.filter((_assignee: Assignee) => _assignee.email === assignee.email).length > 0;

                        if (index) {
                            return reject(`Procurador(${assignee.email}) já está associado ao arquivo com cid(${cid})`);
                        }

                        file.assignees.push(assignee);

                        file.updated = Moment.format();

                        await file.save();

                        return resolve(true);
                    } else {
                        return reject(`O arquivo com cid(${cid}) está em uso e/ou não será possível adicionar o procurador(${assignee.email}).`);
                    };
                } else {
                    return reject(`O arquivo com cid(${cid}) está em uso. Não é possível adicionar o procurador(${assignee.email}) no momento.`);
                };
            } catch (error) {
                return reject(error);
            };
        });
    };

    /**
     * @description Remove o procurador
     * @param cid {String} - CustomId do arquivo
     * @param access {Access} - Propriedades do acesso
     * @param assignee {Pick<Assignee, "email">} - Email do procurador
     */
    public removeAssignee(cid: string, access: Access, assignee: Pick<Assignee, "email">) {
        return new Promise<boolean>(async (resolve, reject) => {
            try {
                let
                    file = await fileDB.findOne({ cid }),
                    _removeAssignee = false;

                if (!file) {
                    return reject(`Arquivo com cid(${cid}) não existe no banco de dados.`);
                };

                /**
                 * @description Verifica se o arquivo está na lixeira.
                 */
                if (this._isGarbage(file)) {
                    return reject(`Arquivo com cid(${cid}) está na lixeira.`);
                };

                /**
                 * @description Verifica se o arquivo está protegido/bloqueado.
                 */
                if (this._isProtectedOrBlocked(file) && !this.verifyAccessByGroupAndUser(file, access)) {
                    return reject(`Arquivo com cid(${cid}) está indisponível, o mesmo está protegido ou bloqueado.`);
                };

                /**
                  * @description Verifica o acesso ao arquivo
                  */
                if (!this.verifyAccessByGroupAndUser(file, access)) {
                    return reject(`Grupo/Usuário(${JSON.stringify(access)}) não tem permissão para remover um procurador do arquivo com cid(${cid}).`);
                };

                /**
                 * @description Verifica o acesso caso o arquivo esteja protegido/bloqueado.
                 */
                if (this._isProtectedOrBlocked(file) && this.verifyAccessByGroupAndUser(file, access)) {
                    _removeAssignee = true;
                }
                /**
                 * @description Verifica se o arquivo está disponível.
                 */
                else if (this._isAvailable(file)) {
                    _removeAssignee = true;
                };

                if (_removeAssignee) {
                    /**
                     * @description Verifica se o arquivo está disponível para as alterações de segurança.
                     */
                    if (this._isAvailableAndAllowsSecurity(file)) {
                        file.status = 'Updating';

                        if (!file.assignees)
                            file.assignees = [];

                        const index = file.assignees.filter((_assignee: Assignee) => _assignee.email === assignee.email).length > 0;

                        if (!index) {
                            return reject(`Procurador(${assignee.email}) não está associado ao arquivo com cid(${cid})`);
                        };

                        file.assignees = file.assignees.filter((_assignee: Assignee) => _assignee.email !== assignee.email);

                        file.updated = Moment.format();

                        await file.save();

                        return resolve(true);
                    } else {
                        return reject(`O arquivo com cid(${cid}) está em uso. Não é possível remover o procurador(${assignee.email}) no momento.`);

                    };
                } else {
                    return reject(`O arquivo com cid(${cid}) está em uso. Não é possível remover o procurador(${assignee.email}) no momento.`);
                };
            } catch (error) {
                return reject(error);
            };
        });
    };

    /**
     * @description Adiciona o histórico da versão.
     * @param cid {String} - CustomId do arquivo
     * @param history {HistoryFile} - Propriedades da versão
     */
    public addHistory(cid: string, history: HistoryFile) {
        return new Promise<number>(async (resolve, reject) => {
            try {
                let file = await fileDB.findOne({ cid });

                if (!file) {
                    return reject(`Arquivo com cid(${cid}) não existe no banco de dados.`);
                };

                /**
                 * @description Verifica se o arquivo está na lixeira.
                 */
                if (this._isGarbage(file)) {
                    return reject(`Arquivo com cid(${cid}) está na lixeira.`);
                };

                /**
                 * @description Verifica se o arquivo está em modo escrita.
                 */
                if (this._isWriting(file)) {
                    if (!file.history)
                        file.history = [];

                    if (!file.version || file.version < 0)
                        file.version = 0;

                    file.history.push(history);
                    file.version++;
                    file.updated = Moment.format();

                    await file.save();

                    return resolve(file.history.length);
                } else {
                    return reject(`O arquivo com cid(${cid}) não está em modo de escrita, o historico da versão não pode ser armazenado.`);
                };
            } catch (error) {
                return reject(error);
            };
        });
    };

    /**
     * @description Remove o historico da versão.
     * @param cid {String} - CustomId do arquivo
     * @param access {Access} - Propriedades do acesso para arquivos
     * @param versions {Array<Number> | Undefined} - Versões a serem removidas. Se undefined remove todas as versões.
     */
    public removeHistory(cid: string, access: Access, versions: number[] | undefined) {
        return new Promise<string[]>(async (resolve, reject) => {
            try {
                let file = await fileDB.findOne({ cid });

                if (!file) {
                    return reject(`Arquivo com cid(${cid}) não existe no banco de dados.`);
                };

                /**
                 * @description Verifica se o arquivo está na lixeira.
                 */
                if (this._isGarbage(file)) {
                    return reject(`Arquivo com cid(${cid}) está na lixeira.`);
                };

                /**
                 * @description Verifica se o arquivo está disponível para há remoção.
                 */
                if (
                    this._isProtectedOrBlocked(file) && this.verifyAccessByGroupAndUser(file, access) ||
                    this._isAvailableAndAllowsDelete(file) ||
                    this._isRecycle(file)
                ) {
                    file.status = 'Removing';

                    if (!file.history)
                        file.history = [];

                    if (!file.version || file.version < 0)
                        file.version = 1;

                    let
                        fileIds: string[] = [];

                    if (versions instanceof Array) {
                        for (const version of versions) {
                            const history = file.history.filter(history => history.version === version)[0];

                            if (history) {
                                fileIds.push(history.fileId);

                                file.history.splice(file.history.indexOf(history), 1);

                                /**
                                 * @description Volta há última versão disponível.
                                 */
                                const previousVersion = file.history[file.history.length - 1];

                                if (previousVersion) {
                                    file.version = previousVersion.version;
                                } else {
                                    file.version = 0;
                                };
                            } else {
                                return reject(`Versão(${version}) do arquivo com o cid(${cid}) não está registrada.`);
                            };
                        };
                    } else {
                        file.history.map(history => fileIds.push(history.fileId));
                        file.history = [];
                        file.version = 0;
                    };

                    file.updated = Moment.format();

                    await file.save();

                    return resolve(fileIds);
                } else {
                    return reject(`O arquivo com cid(${cid}) não pode ter versões removidas.`);
                };
            } catch (error) {
                return reject(error);
            };
        });
    };

    /**
     * @description Prepara o arquivo para há escrita
     * @param cid {String} - CustomId do arquivo
     * @param access {Access} - Propriedades do acesso para arquivos
     */
    public write(cid: string, access: Access) {
        return new Promise<MetadataFile>(async (resolve, reject) => {
            try {
                let
                    file = await fileDB.findOne({ cid }),
                    _write = false;

                if (!file) {
                    return reject(`Arquivo com cid(${cid}) não existe no banco de dados.`);
                };

                /**
                 * @description Verifica se o arquivo está na lixeira.
                 */
                if (this._isGarbage(file)) {
                    return reject(`Arquivo com cid(${cid}) está na lixeira.`);
                };

                /**
                 * @description Verifica se o arquivo está protegido/bloqueado.
                 */
                if (this._isProtectedOrBlocked(file) && !this.verifyAccessByGroupAndUser(file, access)) {
                    return reject(`Arquivo com cid(${cid}) está indisponível, o mesmo está protegido ou bloqueado.`);
                };

                /**
                 * @description Verifica o acesso ao arquivo
                 */
                if (!this.verifyAccessByGroupAndUser(file, access)) {
                    return reject(`Grupo/Usuário(${JSON.stringify(access)}) não tem permissão para escrever no arquivo com cid(${cid}).`);
                };

                /**
                 * @description Verifica o acesso caso o arquivo esteja protegido/bloqueado.
                 */
                if (this._isProtectedOrBlocked(file) && this.verifyAccessByGroupAndUser(file, access)) {
                    _write = true;
                }
                /**
                 * @description Verifica se o arquivo está disponível para há escrita.
                 */
                else if (this._isAvailableAndAllowsWrite(file)) {
                    _write = true;
                };

                if (_write) {
                    file.status = 'Writing';

                    file.lastAccess = Moment.format();

                    await file.save();

                    return resolve({
                        filename: file.name,
                        fileType: file.type,
                        authorId: file.authorId,
                        version: typeof file.version === 'number' ? ++file.version : 1
                    });
                } else {
                    return reject(`O arquivo com cid(${cid}) não está disponível no momento, para há escrita.`);
                };
            } catch (error) {
                return reject(error);
            };
        });
    };

    /**
     * @description Prepara o arquivo para há leitura
     * @param cid {String} - CustomId do arquivo
     * @param access {Access} - Propriedades do acesso para arquivos
     * @param version {Number | Undefined} - Versão a ser lida
     * @param force {Boolean} - Executa a leitura do arquivo mesmo se ele estiver em outro modo
     */
    public read(cid: string, access: Access, version: number | undefined, force?: boolean) {
        return new Promise<FileRead>(async (resolve, reject) => {
            try {
                let
                    file = await fileDB.findOne({ cid }),
                    _read = false;

                if (!file) {
                    return reject(`Arquivo com cid(${cid}) não existe no banco de dados.`);
                };

                /**
                 * @description Verifica se o arquivo está na lixeira.
                 */
                if (this._isGarbage(file)) {
                    return reject(`Arquivo com cid(${cid}) está na lixeira.`);
                };

                /**
                 * @description Verifica se o arquivo está protegido/bloqueado.
                 */
                if (this._isProtectedOrBlocked(file) && !this.verifyAccessByGroupAndUser(file, access)) {
                    return reject(`Arquivo com cid(${cid}) está indisponível, o mesmo está protegido ou bloqueado.`);
                };

                /**
                 * @description Verifica o acesso ao arquivo
                 */
                if (!this.verifyAccessByGroupAndUser(file, access)) {
                    return reject(`Grupo/Usuário(${JSON.stringify(access)}) não tem permissão para ler o arquivo com cid(${cid}).`);
                };

                /**
                 * @description Verifica o acesso caso o arquivo esteja protegido/bloqueado.
                 */
                if (this._isProtectedOrBlocked(file) && this.verifyAccessByGroupAndUser(file, access)) {
                    _read = true;
                }
                /**
                 * @description Verifica se o arquivo está disponível para há leitura.
                 */
                else if (this._isAvailableAndAllowsRead(file)) {
                    _read = true;
                }
                /**
                 * @description Verifica se a leitura do arquivo está em modo forçado
                 */
                else if (force) {
                    _read = true;
                };

                if (_read) {
                    let fileId = "";

                    if (typeof version === 'number') {
                        if (!file.history)
                            file.history = [];

                        let _history = file.history.filter(history => history.version === version);

                        if (_history.length > 0) {
                            fileId = _history[0].fileId;
                        };
                    } else {
                        fileId = file.getActualFileId;
                    };

                    if (fileId.length <= 0) {
                        return reject(`A versão(${version}) para o arquivo com cid(${cid}) não está registrada.`);
                    };

                    file.status = 'Reading';

                    file.lastAccess = Moment.format();

                    await file.save();

                    return resolve({ fileId, filename: `${file.name}${file.type}.gz` });
                } else {
                    return reject(`O arquivo com cid(${cid}) não está disponível no momento, para há leitura.`);
                };
            } catch (error) {
                return reject(error);
            };
        });
    };

    /**
     * @description Renomea o arquivo.
     * @param cid {String} - CustomId do arquivo
     * @param access {Access} - Propriedades do acesso para arquivos
     * @param name {String} - Novo nome do arquivo
     */
    public rename(cid: string, access: Access, name: string) {
        return new Promise<{ filesID: string[], type: string } | boolean>(async (resolve, reject) => {
            try {
                let
                    file = await fileDB.findOne({ cid }),
                    _rename = false;

                if (!file) {
                    return reject(`Arquivo com cid(${cid}) não existe no banco de dados.`);
                };

                /**
                 * @description Verifica se existe outro arquivo com o novo nome
                 */
                let _exist = await fileDB.findOne({ name, type: file.type });

                if (_exist && _exist.cid !== cid) {
                    return reject(`Já existe um arquivo com o mesmo nome: ${name}${file.type}`);
                };

                /**
                 * @description Verifica se o arquivo está na lixeira.
                 */
                if (this._isGarbage(file)) {
                    return reject(`Arquivo com cid(${cid}) está na lixeira.`);
                };

                /**
                 * @description Verifica se o arquivo está protegido/bloqueado.
                 */
                if (this._isProtectedOrBlocked(file) && !this.verifyAccessByGroupAndUser(file, access)) {
                    return reject(`Arquivo com cid(${cid}) está indisponível, o mesmo está protegido ou bloqueado.`);
                };

                /**
                 * @description Verifica o acesso caso o arquivo esteja protegido/bloqueado.
                 */
                if (this._isProtectedOrBlocked(file) && this.verifyAccessByGroupAndUser(file, access)) {
                    _rename = true;
                }
                /**
                 * @description Verifica se o arquivo está disponível.
                 */
                else if (this._isAvailable(file)) {
                    _rename = true;
                };

                if (_rename) {
                    file.status = 'Updating';

                    file.name = name;

                    file.updated = Moment.format();

                    await file.save();

                    if (file.version === 0) {
                        return resolve(false);
                    } else {
                        return resolve({ filesID: file.getHistoryFilesId, type: file.type });
                    };
                } else {
                    return reject(`O arquivo com cid(${cid}) não está disponível no momento, para há renomeação.`);
                };
            } catch (error) {
                return reject(error);
            };
        });
    };

    /**
     * @description Volta o estado do arquivo para disponível
     * @param cid {String} - CustomId do arquivo
     * @param access {Access} - Propriedades do acesso para arquivos
     */
    public close(cid: string, access: Access) {
        return new Promise<boolean>(async (resolve, reject) => {
            try {
                let
                    file = await fileDB.findOne({ cid }),
                    _close = false;

                if (!file) {
                    return reject(`Arquivo com cid(${cid}) não existe no banco de dados.`);
                };

                /**
                 * @description Verifica se o arquivo está na lixeira.
                 */
                if (this._isGarbage(file)) {
                    return reject(`Arquivo com cid(${cid}) está na lixeira.`);
                };

                /**
                 * @description Verifica se o arquivo está protegido/bloqueado.
                 */
                if (this._isProtectedOrBlocked(file) && !this.verifyAccessByGroupAndUser(file, access)) {
                    return reject(`Arquivo com cid(${cid}) está indisponível, o mesmo está protegido ou bloqueado.`);
                };

                /**
                 * @description Verifica o acesso caso o arquivo esteja protegido/bloqueado.
                 */
                if (this._isProtectedOrBlocked(file) && this.verifyAccessByGroupAndUser(file, access)) {
                    _close = true;
                }
                /**
                 * @description Verifica se o arquivo está em modo escrita/leitura/remoção/atualização.
                 */
                else if (this._isWritingOrReadingOrRemovingOrUpdating(file)) {
                    _close = true;
                };

                if (_close) {
                    if (file.protected) {
                        file.status = 'Protected';
                    } else if (file.blocked) {
                        file.status = 'Blocked';
                    } else if (file.recycle) {
                        file.status = 'Recycle'
                    } else {
                        file.status = 'Available';
                    };

                    await file.save();

                    return resolve(true);
                } else {
                    return resolve(true);
                };
            } catch (error) {
                return reject(error);
            };
        });
    };

    /**
     * @description Cria uma proteção para o arquivo.
     * @param cid {String} - CustomId do arquivo
     * @param access {Access} - Propriedades do acesso para arquivos
     * @param passphrase {String} - Texto secreto definido pelo usuário
     */
    public protect(cid: string, access: Access, passphrase: string) {
        return new Promise<string>(async (resolve, reject) => {
            try {
                let file = await fileDB.findOne({ cid });

                if (!file) {
                    return reject(`Arquivo com cid(${cid}) não existe no banco de dados.`);
                };

                /**
                 * @description Verifica se o arquivo está na lixeira.
                 */
                if (this._isGarbage(file)) {
                    return reject(`Arquivo com cid(${cid}) está na lixeira.`);
                };

                /**
                 * @description Verifica se o arquivo está protegido/bloqueado.
                 */
                if (this._isProtectedOrBlocked(file)) {
                    return reject(`Arquivo com cid(${cid}) está indisponível, o mesmo está protegido ou bloqueado.`);
                };

                /**
                 * @description Verifica o acesso ao arquivo
                 */
                if (!this.verifyAccessByGroupAndUser(file, access)) {
                    return reject(`Grupo/Usuário(${JSON.stringify(access)}) não tem permissão para proteger o arquivo com cid(${cid}).`);
                };

                /**
                 * @description Verifica se o arquivo está em modo escrita/leitura/remoção/atualização.
                 */
                if (this._isWritingOrReadingOrRemovingOrUpdating(file)) {
                    return reject(`Arquivo com cid(${cid}) está em uso no momento, não será possível protege-lo agora.`);
                } else {
                    /**
                     * @description Verifica se o arquivo está disponível para a proteção.
                     */
                    if (this._isAvailableAndAllowsProtect(file)) {
                        const uuid = uuidv4();

                        file.status = 'Protected';

                        file.protect = {
                            key: uuid,
                            passphrase
                        };

                        file.updated = Moment.format();

                        await file.save();

                        return resolve(uuid);
                    } else {
                        return reject(`Arquivo com cid(${cid}) está em uso e/ou não será possível protege-lo.`);
                    };
                };
            } catch (error) {
                return reject(error);
            };
        });
    };

    /**
     * @description Remove a proteção do arquivo.
     * @param cid {String} - CustomId do arquivo
     * @param access {Access} - Propriedades do acesso para arquivos
     * @param protect {FileProtected} - Propriedades secretas da proteção do arquivo.
     */
    public unProtect(cid: string, access: Access, protect: FileProtected) {
        return new Promise<boolean>(async (resolve, reject) => {
            try {
                let file = await fileDB.findOne({ cid });

                if (!file) {
                    return reject(`Arquivo com cid(${cid}) não existe no banco de dados.`);
                };

                /**
                 * @description Verifica se o arquivo está na lixeira.
                 */
                if (this._isGarbage(file)) {
                    return reject(`Arquivo com cid(${cid}) está na lixeira.`);
                };

                /**
                 * @description Verifica o acesso ao arquivo
                 */
                if (!this.verifyAccessByGroupAndUser(file, access)) {
                    return reject(`Grupo/Usuário(${JSON.stringify(access)}) não tem permissão para desproteger o arquivo com cid(${cid}).`);
                };

                /**
                 * @description Verifica se o arquivo está protegido.
                 */
                if (this._isProtected(file)) {
                    /**
                     * @description Verifica a "Chave" e o "Texto Secreto" da proteção.
                     */
                    if (this._verifyProtected(file, protect)) {
                        file.status = 'Available';

                        file.protect = undefined;

                        file.updated = Moment.format();

                        await file.save();

                        return resolve(true);
                    } else {
                        return reject(`\"Chave\" e/ou \"Texto Secreto\" está invalido(a).`);
                    };
                } else {
                    return reject(`Arquivo com cid(${cid}) está não está protegido.`);
                };
            } catch (error) {
                return reject(error);
            };
        });
    };

    /**
     * @description Cria o compartilhamento do arquivo.
     * @param cid {String} - CustomId do arquivo
     * @param access {Access} - Propriedades do acesso para arquivos
     * @param title {String} - Texto personalizado usado na UI/UX.
     */
    public share(cid: string, access: Access, title: string) {
        return new Promise<{ link: string, secret: string }>(async (resolve, reject) => {
            try {
                let file = await fileDB.findOne({ cid });

                if (!file) {
                    return reject(`Arquivo com cid(${cid}) não existe no banco de dados.`);
                };

                /**
                 * @description Verifica se o arquivo está na lixeira.
                 */
                if (this._isGarbage(file)) {
                    return reject(`Arquivo com cid(${cid}) está na lixeira.`);
                };

                /**
                 * @description Verifica se o arquivo está protegido/bloqueado.
                 */
                if (this._isProtectedOrBlocked(file)) {
                    return reject(`Arquivo com cid(${cid}) está indisponível, o mesmo está protegido ou bloqueado.`);
                };

                /**
                 * @description Verifica se o arquivo está compartilhado.
                 */
                if (this._isShared(file)) {
                    return reject(`Arquivo com cid(${cid}) já está compartilhado.`);
                };

                /**
                 * @description Verifica o acesso ao arquivo
                 */
                if (!this.verifyAccessByGroupAndUser(file, access)) {
                    return reject(`Grupo/Usuário(${JSON.stringify(access)}) não tem permissão para compartilhar o arquivo com cid(${cid}).`);
                };

                /**
                 * @description Verifica se o arquivo está disponível para o compartilhamento.
                 */
                if (this._isAvailableAndAllowsShare(file)) {
                    /**
                     * @description Verifica se o arquivo está em modo escrita/leitura/remoção/atualização.
                     */
                    if (this._isWritingOrReadingOrRemovingOrUpdating(file)) {
                        return reject(`Arquivo com cid(${cid}) está em uso no momento, não será possível compartilhá-lo agora.`);
                    } else {
                        const
                            link = Random.HASH(8, 'hex'),
                            uuid = uuidv4();

                        file.share = {
                            link,
                            secret: uuid,
                            title
                        };

                        file.updated = Moment.format();

                        await file.save();

                        return resolve({ link, secret: uuid });
                    };
                } else {
                    return reject(`Arquivo com cid(${cid}) não pode ser compartilhado.`);
                };
            } catch (error) {
                return reject(error);
            };
        });
    };

    /**
     * @description Remove o compartilhamento do arquivo.
     * @param cid {String} - CustomId do arquivo
     * @param access {Access} - Propriedades do acesso para arquivos
     * @param share {FileShare} - Propriedades secretas do compartilhamento do arquivo.
     */
    public unShare(cid: string, access: Access, share: Omit<FileShare, "title">) {
        return new Promise<boolean>(async (resolve, reject) => {
            try {
                let file = await fileDB.findOne({ cid });

                if (!file) {
                    return reject(`Arquivo com cid(${cid}) não existe no banco de dados.`);
                };

                /**
                 * @description Verifica se o arquivo está na lixeira.
                 */
                if (this._isGarbage(file)) {
                    return reject(`Arquivo com cid(${cid}) está na lixeira.`);
                };

                /**
                 * @description Verifica se o arquivo está protegido/bloqueado.
                 */
                if (this._isProtectedOrBlocked(file)) {
                    return reject(`Arquivo com cid(${cid}) está indisponível, o mesmo está protegido ou bloqueado.`);
                };

                /**
                 * @description Verifica o acesso ao arquivo
                 */
                if (!this.verifyAccessByGroupAndUser(file, access)) {
                    return reject(`Grupo/Usuário(${JSON.stringify(access)}) não tem permissão para remover o compartilhamento do arquivo com cid(${cid}).`);
                };

                /**
                 * @description Verifica se o arquivo está compartilhado.
                 */
                if (this._isShared(file)) {
                    /**
                     * @description Verifica se o arquivo está em modo escrita/leitura/remoção/atualização.
                     */
                    if (this._isWritingOrReadingOrRemovingOrUpdating(file)) {
                        return reject(`Arquivo com cid(${cid}) está em uso no momento, não será possível remover o compartilhamento agora.`);
                    } else {
                        if (this._verifyShared(file, share)) {
                            file.share = undefined;

                            file.updated = Moment.format();

                            await file.save();

                            return resolve(true);
                        } else {
                            return reject(`\"Link\" e/ou \"Texto Secreto\" está invalido.`);
                        }
                    };
                } else {
                    return reject(`Arquivo com cid(${cid}) não está compartilhado.`);
                };
            } catch (error) {
                return reject(error);
            };
        });
    };

    /**
     * @description Bloqueia o arquivo.
     * @param cid {String} - CustomId do arquivo
     * @param access {Access} - Propriedades do acesso para arquivos
     * @param block {FileBlocked} - Propriedades do bloqueio
     */
    public blocked(cid: string, access: Access, block: FileBlocked) {
        return new Promise<boolean>(async (resolve, reject) => {
            try {
                let file = await fileDB.findOne({ cid });

                if (!file) {
                    return reject(`Arquivo com cid(${cid}) não existe no banco de dados.`);
                };

                /**
                 * @description Verifica se o arquivo está na lixeira.
                 */
                if (this._isGarbage(file)) {
                    return reject(`Arquivo com cid(${cid}) está na lixeira.`);
                };

                /**
                 * @description Verifica se o arquivo está protegido/bloqueado.
                 */
                if (this._isProtectedOrBlocked(file)) {
                    return reject(`Arquivo com cid(${cid}) está indisponível, o mesmo está protegido ou bloqueado.`);
                };

                /**
                 * @description Verifica o acesso ao arquivo
                 */
                if (!this.verifyAccessByGroupAndUser(file, access)) {
                    return reject(`Grupo/Usuário(${JSON.stringify(access)}) não tem permissão para bloquear o arquivo com cid(${cid}).`);
                };

                /**
                 * @description Verifica se o arquivo está disponível para o bloqueio.
                 */
                if (this._isAvailableAndAllowsBlock(file)) {
                    file.status = 'Blocked';

                    file.block = block;

                    file.updated = Moment.format();

                    await file.save();

                    return resolve(true);
                } else {
                    return reject(`Arquivo com cid(${cid}) está em uso e/ou não será possível bloqueá-lo.`);
                };
            } catch (error) {
                return reject(error);
            };
        });
    };

    /**
     * @description Desbloqueia o arquivo.
     * @param cid {String} - CustomId do arquivo
     * @param access {Access} - Propriedades do acesso para arquivos
     */
    public unBlocked(cid: string, access: Access) {
        return new Promise<boolean>(async (resolve, reject) => {
            try {
                let file = await fileDB.findOne({ cid });

                if (!file) {
                    return reject(`Arquivo com cid(${cid}) não existe no banco de dados.`);
                };

                /**
                 * @description Verifica se o arquivo está na lixeira.
                 */
                if (this._isGarbage(file)) {
                    return reject(`Arquivo com cid(${cid}) está na lixeira.`);
                };

                /**
                 * @description Verifica se o arquivo está protegido.
                 */
                if (this._isProtected(file)) {
                    return reject(`Arquivo com cid(${cid}) está indisponível, o mesmo está protegido.`);
                };

                /**
                 * @description Verifica o acesso ao arquivo
                 */
                if (!this.verifyAccessByGroupAndUser(file, access)) {
                    return reject(`Grupo/Usuário(${JSON.stringify(access)}) não tem permissão para desbloquear o arquivo com cid(${cid}).`);
                };

                /**
                 * @description Verifica se o arquivo está bloqueado.
                 */
                if (this._isBlocked(file)) {
                    file.status = 'Available';

                    file.block = undefined;

                    file.updated = Moment.format();

                    await file.save();

                    return resolve(true);
                } else {
                    return reject(`Arquivo com cid(${cid}) não está bloqueado.`);
                };
            } catch (error) {
                return reject(error);
            };
        });
    };

    /**
     * @description Coloca o arquivo na lixeira
     * @param cid {String} - CustomId do arquivo
     * @param access {Access} - Propriedades do acesso para arquivos
     */
    public moveToGarbage(cid: string, access: Access) {
        return new Promise<boolean>(async (resolve, reject) => {
            try {
                let file = await fileDB.findOne({ cid });

                if (!file) {
                    return reject(`Arquivo com cid(${cid}) não existe no banco de dados.`);
                };

                /**
                 * @description Verifica se o arquivo está na lixeira.
                 */
                if (this._isGarbage(file)) {
                    return reject(`Arquivo com cid(${cid}) está na lixeira.`);
                };

                /**
                 * @description Verifica se o arquivo está protegido/bloqueado.
                 */
                if (this._isProtectedOrBlocked(file)) {
                    return reject(`Arquivo com cid(${cid}) está indisponível, o mesmo está protegido ou bloqueado.`);
                };

                /**
                 * @description Verifica o acesso ao arquivo
                 */
                if (!this.verifyAccessByGroupAndUser(file, access)) {
                    return reject(`Grupo/Usuário(${JSON.stringify(access)}) não tem permissão para colocar o arquivo com cid(${cid}) na lixeira.`);
                };

                /**
                 * @description Verifica se o arquivo está disponível.
                 */
                if (this._isAvailable(file)) {
                    let now = new Date();

                    now.setDate(now.getDate() + trashDays);

                    await file.updateOne({ $set: { status: 'Trash', trash: now, updated: Moment.format() } });

                    return resolve(true);
                } else {
                    return reject(`Arquivo com cid(${cid}) está em uso no momento, não será possível coloca-lo na lixeira agora.`);
                };
            } catch (error) {
                return reject(error);
            };
        });
    };

    /**
     * @description Retira o arquivo da lixeira
     * @param cid {String} - CustomId do arquivo
     * @param access {Access} - Propriedades do acesso para arquivos
     */
    public removeOfGarbage(cid: string, access: Access) {
        return new Promise<boolean>(async (resolve, reject) => {
            try {
                let file = await fileDB.findOne({ cid });

                if (!file) {
                    return reject(`Arquivo com cid(${cid}) não existe no banco de dados.`);
                };

                /**
                 * @description Verifica se o arquivo está protegido/bloqueado.
                 */
                if (this._isProtectedOrBlocked(file)) {
                    return reject(`Arquivo com cid(${cid}) está indisponível, o mesmo está protegido ou bloqueado.`);
                };

                /**
                 * @description Verifica o acesso ao arquivo
                 */
                if (!this.verifyAccessByGroupAndUser(file, access)) {
                    return reject(`Grupo/Usuário(${JSON.stringify(access)}) não tem permissão para retirar o arquivo com cid(${cid}) da lixeira.`);
                };

                /**
                 * @description Verifica se o arquivo está na lixeira.
                 */
                if (this._isGarbage(file)) {
                    file.status = 'Available';

                    file.trash = undefined;

                    file.recycle = undefined;

                    file.updated = Moment.format();

                    await file.save();

                    return resolve(true);
                } else {
                    return reject(`Arquivo com cid(${cid}) não está na lixeira.`);
                };
            } catch (error) {
                return reject(error);
            };
        });
    };

    /**
     * @description Gera um pedido aos procuradores para mover o arquivo para a lixeira
     * @param cid {String} - CustomId do arquivo
     * @param access {Access} - Propriedades do acesso
     * @param order {Order} - Propriedades do pedido
     */
    public orderMoveToGarbage(cid: string, access: Access, order: Order) {
        return new Promise<boolean>(async (resolve, reject) => {
            try {
                let file = await fileDB.findOne({ cid });

                if (!file) {
                    return reject(`Arquivo com cid(${cid}) não existe no banco de dados.`);
                };

                /**
                 * @description Verifica se o arquivo está na lixeira.
                 */
                if (this._isGarbage(file)) {
                    return reject(`Arquivo com cid(${cid}) está na lixeira.`);
                };

                /**
                 * @description Verifica se o arquivo está protegido/bloqueado.
                 */
                if (this._isProtectedOrBlocked(file)) {
                    return reject(`Arquivo com cid(${cid}) está indisponível, o mesmo está protegido ou bloqueado.`);
                };

                /**
                 * @description Verifica o acesso ao arquivo
                 */
                if (!this.verifyAccessByGroupAndUser(file, access)) {
                    return reject(`Grupo/Usuário(${JSON.stringify(access)}) não tem permissão para gerar um pedido para mover o arquivo com cid(${cid}) para a lixeira.`);
                };

                /**
                 * @description Verifica se o arquivo tem procuradores associados
                 */
                if (!this._isContainsAssignees(file)) {
                    return reject(`Arquivo com cid(${cid}) não possui procuradores.`);
                };

                /**
                 * @description Verifica se o arquivo está disponível.
                 */
                if (this._isAvailable(file)) {
                    let now = new Date();

                    now.setDate(now.getDate() + orderDays);

                    order.fileId = cid;
                    order.type = 'Garbage';
                    order.timelapse = now;
                    order.link = Random.HASH(12, 'hex');

                    if (!file.assignees)
                        file.assignees = [];

                    for (const assignee of file.assignees) {
                        // Cria um job para o envio de email com o pedido aos procuradores do arquivo
                        await Jobs.append({
                            name: `sending an e-mail with the request to move the file(${file.name}) to the Recycle Bin`,
                            type: 'mailsend',
                            priority: 'High',
                            args: {
                                email: assignee.email,
                                username: assignee.name,
                                title: `Procurador(a) ${order.assignee.name} quer mover o arquivo(${file.name}) para a lixeira`,
                                description: [
                                    `Um pedido para mover o arquivo(${file.name}) para a lixeira foi emitido por ${order.assignee.name}`,
                                    `Você concorda ou discorda disso?`
                                ].join('\n'),
                                link: order.link,
                                order: true,
                                clientAddress: 'System'
                            },
                            status: 'Available'
                        });
                    };

                    await file.updateOne({ $set: { order, updated: Moment.format() } });

                    return resolve(true);
                } else {
                    return reject(`Arquivo com cid(${cid}) está em uso no momento, não será possível criar um pedido para coloca-lo na lixeira agora.`);
                };
            } catch (error) {
                return reject(error);
            };
        });
    };

    /**
     * @description Remove o pedido enviado aos procuradores
     * @param cid {String} - CustomId do arquivo
     * @param access {Access} - Propriedades do acesso
     */
    public orderRemove(cid: string, access: Access) {
        return new Promise<boolean>(async (resolve, reject) => {
            try {
                let file = await fileDB.findOne({ cid });

                if (!file) {
                    return reject(`Arquivo com cid(${cid}) não existe no banco de dados.`);
                };

                /**
                 * @description Verifica se o arquivo está protegido/bloqueado.
                 */
                if (this._isProtectedOrBlocked(file)) {
                    return reject(`Arquivo com cid(${cid}) está indisponível, o mesmo está protegido ou bloqueado.`);
                };

                /**
                 * @description Verifica o acesso ao arquivo
                 */
                if (!this.verifyAccessByGroupAndUser(file, access)) {
                    return reject(`Grupo/Usuário(${JSON.stringify(access)}) não tem permissão para remover o pedido enviado aos procuradores do arquivo com cid(${cid}).`);
                };

                /**
                 * @description Verifica se o arquivo tem um pedido definido
                 */
                if (file.order) {
                    file.order = undefined;

                    file.updated = Moment.format();

                    await Jobs.removeJobByName(`sending an e-mail with the request to move the file(${file.name}) to the Recycle Bin`);

                    await file.save();

                    return resolve(true);
                } else {
                    return reject(`Arquivo com cid(${cid}) não tem um pedido definido.`);
                };
            } catch (error) {
                return reject(error);
            };
        });
    };

    /**
     * @description Responde o pedido enviado ao procurador
     * @param cid {String} - CustomId do arquivo
     * @param access {Access} - Propriedades do acesso
     * @param answer {OrderAnswer} Resposta do procurador
     */
    public orderAssigneeSetDecision(cid: string, access: Access, answer: OrderAnswer) {
        return new Promise<boolean>(async (resolve, reject) => {
            try {
                let file = await fileDB.findOne({ cid });

                if (!file) {
                    return reject(`Arquivo com cid(${cid}) não existe no banco de dados.`);
                };

                /**
                 * @description Verifica se o arquivo está protegido/bloqueado.
                 */
                if (this._isProtectedOrBlocked(file)) {
                    return reject(`Arquivo com cid(${cid}) está indisponível, o mesmo está protegido ou bloqueado.`);
                };

                /**
                 * @description Verifica o acesso ao arquivo
                 */
                if (!this.verifyAccessByGroupAndUser(file, access)) {
                    return reject(`Grupo/Usuário(${JSON.stringify(access)}) não tem permissão para processar o pedido enviado aos procuradores do arquivo com cid(${cid}).`);
                };

                /**
                 * @description Verifica se o arquivo tem um pedido definido
                 */
                if (file.order) {
                    /**
                     * @description Verifica se o tempo para responder o pedido expirou
                     */
                    if (file.orderTimelapseExpired()) {
                        return reject(`O prazo para responder a solicitação ${file.order.title} do arquivo com cid(${cid}) expirou.`);
                    } else {
                        if (!file.order.answers) {
                            file.order.answers = [answer];
                        } else {
                            const index = file.orderAnswerIndex(answer);

                            file.order.answers[index] = answer;
                        };

                        file.updated = Moment.format();

                        await file.save();

                        return resolve(true);
                    };
                } else {
                    return reject(`Arquivo com cid(${cid}) não tem um pedido definido.`);
                };
            } catch (error) {
                return reject(error);
            };
        });
    };

    /**
     * @description Processa o pedido enviado aos procuradores
     * @param cid {String} - CustomId do arquivo
     * @param access {Access} - Propriedades do acesso
     */
    public orderProcess(cid: string, access: Access) {
        return new Promise<boolean>(async (resolve, reject) => {
            try {
                let file = await fileDB.findOne({ cid });

                if (!file) {
                    return reject(`Arquivo com cid(${cid}) não existe no banco de dados.`);
                };

                /**
                 * @description Verifica se o arquivo está protegido/bloqueado.
                 */
                if (this._isProtectedOrBlocked(file)) {
                    return reject(`Arquivo com cid(${cid}) está indisponível, o mesmo está protegido ou bloqueado.`);
                };

                /**
                 * @description Verifica o acesso ao arquivo
                 */
                if (!this.verifyAccessByGroupAndUser(file, access)) {
                    return reject(`Grupo/Usuário(${JSON.stringify(access)}) não tem permissão para processar o pedido enviado aos procuradores do arquivo com cid(${cid}).`);
                };

                /**
                 * @description Verifica se o arquivo tem um pedido definido
                 */
                if (file.order) {
                    /**
                     * @description Verifica se o tempo para responder o pedido expirou
                     */
                    if (file.orderTimelapseExpired()) {
                        file.order = undefined;

                        file.updated = Moment.format();

                        await file.save();

                        return resolve(false);
                    } else {
                        /**
                         * @description Verifica se todos os procuradores aprovaram a solicitação
                        */

                        const orderAllAssigneesApproved = file.orderAllAssigneesApproved();

                        if (orderAllAssigneesApproved) {
                            if (file.orderTypeIs('Garbage')) {
                                try {
                                    await this.moveToGarbage(cid, { group: { name: 'administrador', permission: 'Delete' } });
                                } catch {
                                    return resolve(false);
                                };
                            };
                        };

                        file.order = undefined;

                        file.updated = Moment.format();

                        await file.save();

                        return resolve(orderAllAssigneesApproved);
                    };
                } else {
                    return reject(`Arquivo com cid(${cid}) não tem um pedido definido.`);
                };
            } catch (error) {
                return reject(error);
            };
        });
    };
};

export default new fileManagerDB();