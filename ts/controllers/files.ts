/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable no-async-promise-executor */
/**
 * @description Gerenciamento de arquivos
 * @author @GuilhermeSantos001
 * @update 06/12/2021
 */

import { ReadStream, WriteStream } from 'fs-extra';
import { Response } from 'express';
import { ObjectId } from 'mongodb';
import { FilterQuery } from 'mongoose';

import { GroupId, UserId, Assignee, Order, OrderAnswer, fileInterface, fileModelInterface, FilePermission } from '@/mongo/files-manager-mongo';
import fileManagerDB, { Access, BlockVerify } from '@/db/files-db';
import { Access as AccessFolder } from '@/db/folders-db';
import FileGridFS from '@/drivers/file-gridfs';
import Archive, { Reader } from '@/utils/archive';

export interface responseDataFile extends fileInterface, Pick<fileModelInterface, 'checkGroupAccess' | 'checkUserAccess' | 'inRoom' | 'getAuthorUsername' | 'getAuthorEmail'> { }

class FileController {
    /**
     * @description Extensões de arquivo autorizadas
     */
    public readonly extensions: Array<string> =
        [
            '.txt', '.pdf', '.ppt', '.pptx',
            '.jpg', '.jpeg', '.xls', '.xlsx',
            '.doc', '.docx', '.csv', '.xlsb',
            '.psd', '.png', '.gif'
        ];

    /**
     * @description Tamanho máximo autorizado do arquivo
     */
    public readonly maxSize: number = 20000000; // 20 MB

    /**
     * @description Fecha o arquivo após interação
     * @param cid {String} - CustomId do arquivo
     * @param access {Access} - Propriedades do acesso
     */
    private closeAfterInteraction(cid: string, access: Access) {
        return new Promise<void>(async (resolve, reject) => {
            try {
                await fileManagerDB.close(cid, access);

                resolve();
            } catch(error: any) {
                reject(error.message);
            }
        });
    }

    /**
     * @description Retorna uma lista de arquivos
     * @param filter {Object} - Filtro Aplicado na busca
     * @param skip {Number} - Pular x itens iniciais no banco de dados
     * @param limit {Number} - Limite de itens a serem retornados
     */
    public get(filter: FilterQuery<fileModelInterface>, skip: number, limit: number): Promise<responseDataFile[]> {
        return new Promise(async (resolve, reject) => {
            try {
                const files = await fileManagerDB.get(filter, skip, limit);

                resolve(files.map(file => {
                    return {
                        cid: file.cid,
                        room: file.room,
                        authorId: file.authorId,
                        accessGroupId: file.accessGroupId,
                        accessUsersId: file.accessUsersId,
                        name: file.name,
                        description: file.description,
                        version: file.version,
                        history: file.history,
                        size: file.size,
                        compressedSize: file.compressedSize,
                        type: file.type,
                        tag: file.tag,
                        status: file.status,
                        permission: file.permission,
                        folderId: file.folderId,
                        share: file.share,
                        protect: file.protect,
                        block: file.block,
                        trash: file.trash,
                        recycle: file.recycle,
                        assignees: file.assignees,
                        order: file.order,
                        updated: file.updated,
                        lastAccess: file.lastAccess,
                        createdAt: file.createdAt,
                        checkGroupAccess: file.checkGroupAccess,
                        checkUserAccess: file.checkUserAccess,
                        inRoom: file.inRoom,
                        getAuthorUsername: file.getAuthorUsername,
                        getAuthorEmail: file.getAuthorEmail
                    };
                }));
            } catch(error: any) {
                reject(error.message);
            }
        });
    }

    /**
     * @description Cria um novo arquivo
     * @param file {fileInterface} - Propriedades do arquivo
     */
    public newFile(file: fileInterface) {
        return new Promise<fileModelInterface>(async (resolve, reject) => {
            try {
                resolve(await fileManagerDB.save(file));
            } catch(error: any) {
                reject(error.message);
            }
        });
    }

    /**
     * @description Atualiza as informações do arquivo
     * @param cid {String} - CustomId do arquivo
     * @param access {Access} - Propriedades do acesso para arquivos
     * @param data Pick<fileInterface, "name" | "description" | "tag"> - Propriedades a serem atualizadas do arquivo.
     */
    public update(cid: string, access: Access, data: Pick<fileInterface, "name" | "description" | "tag">) {
        return new Promise<boolean>(async (resolve, reject) => {
            try {
                await fileManagerDB.update(cid, access, data);
                await fileManagerDB.close(cid, access);

                resolve(await this.rename(cid, access, data.name));
            } catch(error: any) {
                this.closeAfterInteraction(cid, access)
                    .then(() => reject(error.message))
                    .catch(_error => reject(_error));
            }
        });
    }

    /**
     * @description Remove o arquivo.
     * @param cid {String} - CustomId do arquivo
     * @param access {Access} - Propriedades do acesso para arquivos
     * @param accessFolder {accessFolder} - Propriedades do acesso para pastas
     */
    public delete(cid: string, access: Access, accessFolder: AccessFolder) {
        return new Promise<boolean>(async (resolve, reject) => {
            try {
                await this.remove(cid, access, undefined);
                await fileManagerDB.delete(cid, access, accessFolder);

                resolve(true)
            } catch(error: any) {
                this.closeAfterInteraction(cid, access)
                    .then(() => reject(error.message))
                    .catch(_error => reject(_error));
            }
        });
    }

    /**
     * @description Adiciona o grupo na whitelist do arquivo.
     * @param cid {String} - CustomId do arquivo
     * @param access {Access} - Propriedades do acesso
     * @param group {GroupId} - Grupo do usuário
     */
    public insertGroupId(cid: string, access: Access, group: GroupId) {
        return new Promise<boolean>(async (resolve, reject) => {
            try {
                await fileManagerDB.addGroupId(cid, access, group);
                await fileManagerDB.close(cid, access);

                resolve(true);
            } catch(error: any) {
                this.closeAfterInteraction(cid, access)
                    .then(() => reject(error.message))
                    .catch(_error => reject(_error));
            }
        });
    }

    /**
     * @description Adiciona uma permissão ao grupo na whitelist
     * @param cid {String} - CustomId do arquivo
     * @param access {Access} - Propriedades do acesso para arquivos
     * @param group {GroupId} - Grupo do usuário
     * @param permissions {FilePermission[]} - Novas permissões do grupo
     */
    public insertPermissionInGroupId(cid: string, access: Access, group: GroupId, permissions: FilePermission[]) {
        return new Promise<boolean>(async (resolve, reject) => {
            try {
                await fileManagerDB.addPermissionGroupId(cid, access, group, permissions);
                await fileManagerDB.close(cid, access);

                resolve(true);
            } catch(error: any) {
                this.closeAfterInteraction(cid, access)
                    .then(() => reject(error.message))
                    .catch(_error => reject(_error));
            }
        });
    }

    /**
     * @description Adiciona uma permissão ao usuário na whitelist
     * @param cid {String} - CustomId do arquivo
     * @param access {Access} - Propriedades do acesso para arquivos
     * @param user {UserId} - Usuário a ser modificado
     * @param permissions {FilePermission[]} - Novas permissões do grupo
     */
    public insertPermissionInUserId(cid: string, access: Access, user: UserId, permissions: FilePermission[]) {
        return new Promise<boolean>(async (resolve, reject) => {
            try {
                await fileManagerDB.addPermissionUserId(cid, access, user, permissions);
                await fileManagerDB.close(cid, access);

                resolve(true);
            } catch(error: any) {
                this.closeAfterInteraction(cid, access)
                    .then(() => reject(error.message))
                    .catch(_error => reject(_error));
            }
        });
    }

    /**
     * @description Remove uma permissão do grupo na whitelist
     * @param cid {String} - CustomId do arquivo
     * @param access {Access} - Propriedades do acesso para arquivos
     * @param group {GroupId} - Grupo do usuário
     * @param permissions {FilePermission[]} - Permissões do grupo
     */
    public removePermissionInGroupId(cid: string, access: Access, group: GroupId, permissions: FilePermission[]) {
        return new Promise<boolean>(async (resolve, reject) => {
            try {
                await fileManagerDB.removePermissionGroupId(cid, access, group, permissions);
                await fileManagerDB.close(cid, access);

                resolve(true);
            } catch(error: any) {
                this.closeAfterInteraction(cid, access)
                    .then(() => reject(error.message))
                    .catch(_error => reject(_error));
            }
        });
    }

    /**
     * @description Remove uma permissão do usuário na whitelist
     * @param cid {String} - CustomId do arquivo
     * @param access {Access} - Propriedades do acesso para arquivos
     * @param user {UserId} - Usuário a ser modificado
     * @param permissions {FilePermission[]} - Permissões do grupo
     */
    public removePermissionInUserId(cid: string, access: Access, user: UserId, permissions: FilePermission[]) {
        return new Promise<boolean>(async (resolve, reject) => {
            try {
                await fileManagerDB.removePermissionUserId(cid, access, user, permissions);
                await fileManagerDB.close(cid, access);

                resolve(true);
            } catch(error: any) {
                this.closeAfterInteraction(cid, access)
                    .then(() => reject(error.message))
                    .catch(_error => reject(_error));
            }
        });
    }

    /**
     * @description Remove o grupo da whitelist do arquivo.
     * @param cid {String} - CustomId do arquivo
     * @param access {Access} - Propriedades do acesso
     * @param group {GroupId} - Grupo do usuário
     */
    public removeGroupId(cid: string, access: Access, group: Pick<GroupId, "name">) {
        return new Promise<boolean>(async (resolve, reject) => {
            try {
                await fileManagerDB.removeGroupId(cid, access, group);
                await fileManagerDB.close(cid, access);

                resolve(true);
            } catch(error: any) {
                this.closeAfterInteraction(cid, access)
                    .then(() => reject(error.message))
                    .catch(_error => reject(_error));
            }
        });
    }

    /**
     * @description Adiciona um usuário na whitelist
     * @param cid {String} - CustomId do arquivo
     * @param access {Access} - Propriedades do acesso
     * @param user {UserId} - Propriedades do usuário
     */
    public insertUserId(cid: string, access: Access, user: UserId) {
        return new Promise<boolean>(async (resolve, reject) => {
            try {
                await fileManagerDB.addUserId(cid, access, user);
                await fileManagerDB.close(cid, access);

                resolve(true);
            } catch(error: any) {
                this.closeAfterInteraction(cid, access)
                    .then(() => reject(error.message))
                    .catch(_error => reject(_error));
            }
        });
    }

    /**
     * @description Remove o usuário da whitelist
     * @param cid {String} - CustomId do arquivo
     * @param access {Access} - Propriedades do acesso
     * @param user {UserId} - Propriedades do usuário
     */
    public removeUserId(cid: string, access: Access, user: Pick<UserId, "email">) {
        return new Promise<boolean>(async (resolve, reject) => {
            try {
                await fileManagerDB.removeUserId(cid, access, user);
                await fileManagerDB.close(cid, access);

                resolve(true);
            } catch(error: any) {
                this.closeAfterInteraction(cid, access)
                    .then(() => reject(error.message))
                    .catch(_error => reject(_error));
            }
        });
    }

    /**
     * @description Adiciona um novo procurador
     * @param cid {String} - CustomId do arquivo
     * @param access {Access} - Propriedades do acesso
     * @param assignee {Assignee} - Propriedades do procurador
     */
    public insertAssignee(cid: string, access: Access, assignee: Assignee) {
        return new Promise<boolean>(async (resolve, reject) => {
            try {
                await fileManagerDB.addAssignee(cid, access, assignee);
                await fileManagerDB.close(cid, access);

                resolve(true);
            } catch(error: any) {
                this.closeAfterInteraction(cid, access)
                    .then(() => reject(error.message))
                    .catch(_error => reject(_error));
            }
        });
    }

    /**
     * @description Remove o procurador
     * @param cid {String} - CustomId do arquivo
     * @param access {Access} - Propriedades do acesso
     * @param assignee {Pick<Assignee, "email">} - Email do procurador
     */
    public removeAssignee(cid: string, access: Access, assignee: Pick<Assignee, "email">) {
        return new Promise<boolean>(async (resolve, reject) => {
            try {
                await fileManagerDB.removeAssignee(cid, access, assignee);
                await fileManagerDB.close(cid, access);

                resolve(true);
            } catch(error: any) {
                this.closeAfterInteraction(cid, access)
                    .then(() => reject(error.message))
                    .catch(_error => reject(_error));
            }
        });
    }

    /**
     * @description Renomeia o arquivo.
     * @param cid {String} - CustomId do arquivo
     * @param access {Access} - Propriedades do acesso
     * @param name {String} - Novo nome do arquivo
     */
    public rename(cid: string, access: Access, name: string) {
        return new Promise<boolean>(async (resolve, reject) => {
            try {
                const result = await fileManagerDB.rename(cid, access, name)

                if (typeof result === 'object') {
                    const
                        filesID = result.filesID,
                        type = result.type;


                    if (filesID.length > 0)
                        for (const fileID of filesID) {
                            await FileGridFS.rename(new ObjectId(fileID), `${name}${type}`);
                        }
                }

                await fileManagerDB.close(cid, access);

                resolve(true);
            } catch(error: any) {
                this.closeAfterInteraction(cid, access)
                    .then(() => reject(error.message))
                    .catch(_error => reject(_error));
            }
        });
    }

    /**
     * @description Escreve dados para o arquivo.
     * @param cid {String} - CustomId do arquivo
     * @param authorID {String} - ID do usuário que está escrevendo no arquivo
     * @param _size {Number} - Tamanho dos dados a serem escritos
     * @param access {Access} - Propriedades do acesso
     * @param stream {ReadStream} - ReadStream (Origem)
     */
    public write(cid: string, authorId: string, _size: number, access: Access, stream: ReadStream) {
        return new Promise<{ versions: number, version: number }>(async (resolve, reject) => {
            try {
                const
                    { filename, filetype, version, size, status } = await fileManagerDB.write(cid, _size, access),
                    history = await FileGridFS.openUploadStream(stream, {
                        filename,
                        filetype,
                        authorId,
                        version,
                        size,
                        status
                    }),
                    versions = await fileManagerDB.addHistory(cid, {
                        authorId,
                        uploadDate: new Date(),
                        size: _size,
                        ...history,
                    });

                resolve({ versions, version });
            } catch(error: any) {
                this.closeAfterInteraction(cid, access)
                    .then(() => reject(error.message))
                    .catch(_error => reject(_error));
            }
        });
    }

    /**
     * @description Insere uma nova versão ao arquivo.
     * @param cid {String} - CustomId do arquivo
     * @param authorID {String} - ID do usuário que está escrevendo no arquivo
     * @param size {Number} - Tamanho dos dados a serem escritos
     * @param compressedSize {Number} - Tamanho dos dados comprimidos
     * @param access {Access} - Propriedades do acesso
     */
    public insertVersion(cid: string, authorId: string, size: number, compressedSize: number, fileId: ObjectId, version: number, access: Access) {
        return new Promise<{ versions: number, version: number }>(async (resolve, reject) => {
            try {
                await fileManagerDB.write(cid, size, access);

                const versions = await fileManagerDB.addHistory(cid, {
                    authorId,
                    uploadDate: new Date(),
                    size,
                    compressedSize,
                    fileId,
                    version
                });

                await fileManagerDB.close(cid, access);

                resolve({ versions, version });
            } catch(error: any) {
                this.closeAfterInteraction(cid, access)
                    .then(() => reject(error.message))
                    .catch(_error => reject(_error));
            }
        });
    }

    /**
     * @description Remove dados do arquivo.
     * @param cid {String} - CustomId do arquivo
     * @param access {Access} - Propriedades do acesso
     * @param versions {Array<Number> | Undefined} - Versões a serem removidas. Se undefined remove todas as versões.
     */
    public remove(cid: string, access: Access, versions: number[] | undefined) {
        return new Promise<boolean>(async (resolve, reject) => {
            try {
                const fileIds = await fileManagerDB.removeHistory(cid, access, versions);

                fileIds.map(async (fileId) => await FileGridFS.deleteFile(new ObjectId(fileId)).catch(error => reject(error)))

                await fileManagerDB.close(cid, access);

                resolve(true);
            } catch(error: any) {
                this.closeAfterInteraction(cid, access)
                    .then(() => reject(error.message))
                    .catch(_error => reject(_error));
            }
        });
    }

    /**
     * @description Lê dados do arquivo.
     * @param cid {String} - CustomId do arquivo
     * @param access {Access} - Propriedades do acesso
     * @param version {Number | Undefined} - Versão a ser lida. Se undefined lê a versão atual.
     * @param stream {WriteStream | Response} - WriteStream (Destino)
     */
    public read(cid: string, access: Access, version: number | undefined, stream: WriteStream | Response) {
        return new Promise<string>(async (resolve, reject) => {
            try {
                const { fileId, filename } = await fileManagerDB.read(cid, access, version);

                FileGridFS.openDownloadStream(stream, new ObjectId(fileId))
                    .then(() =>
                        fileManagerDB.close(cid, access)
                            .then(() => resolve(filename))
                            .catch(error => reject(error))
                    )
                    .catch(error => reject(error))
            } catch(error: any) {
                this.closeAfterInteraction(cid, access)
                    .then(() => reject(error.message))
                    .catch(_error => reject(_error));
            }
        });
    }

    /**
     * @description Gera um compilado das versões do arquivo.
     * @param cid {String} - CustomId do arquivo
     * @param access {Access} - Propriedades do acesso
     * @param versions {Number[]} - Versões a serem lidas.
     * @param stream {WriteStream | Response} - WriteStream (Destino)
     */
    public async readCompile(cid: string, access: Access, versions: number[], stream: WriteStream | Response): Promise<boolean> {
        return new Promise<boolean>(async (resolve, reject) => {
            try {
                const readers: Reader[] = [];

                for (const version of versions) {
                    const { fileId, filename } = await fileManagerDB.read(cid, access, version, true),
                        gridFS = await FileGridFS.getDownloadStream(new ObjectId(fileId));

                    readers.push({
                        stream: gridFS,
                        filename,
                        version: String(version)
                    });
                }

                await Archive.joinWithReaders(stream, readers);

                await fileManagerDB.close(cid, access);

                resolve(true);
            } catch(error: any) {
                this.closeAfterInteraction(cid, access)
                    .then(() => reject(error.message))
                    .catch(_error => reject(_error));
            }
        });
    }

    /**
     * @description Fecha o arquivo e estabelece o status "Disponível" para novas operações.
     * @param cid {String} - CustomId do arquivo
     * @param access {Access} - Propriedades do acesso
     */
    public async close(cid: string, access: Access): Promise<boolean> {
        return await fileManagerDB.close(cid, access)
    }

    /**
     * @description Protege o arquivo.
     * @param cid {String} - CustomId do arquivo
     * @param access {Access} - Propriedades do acesso
     * @param passphrase {string} - Texto secreto definido pelo usuário
     */
    public async protect(cid: string, access: Access, passphrase: string): Promise<string> {
        return await fileManagerDB.protect(cid, access, passphrase);
    }

    /**
     * @description Desprotege o arquivo.
     * @param cid {String} - CustomId do arquivo
     * @param access {Access} - Propriedades do acesso
     * @param key {String} - Chave secreta da proteção
     * @param passphrase {string} - Texto secreto definido pelo usuário
     */
    public async unProtect(cid: string, access: Access, key: string, passphrase: string): Promise<boolean> {
        return await fileManagerDB.unProtect(cid, access, { key, passphrase });
    }

    /**
     * @description Libera o compartilhamento do arquivo.
     * @param cid {String} - CustomId do arquivo
     * @param access {Access} - Propriedades do acesso
     * @param title {String} - Texto personalizado usado na UI/UX.
     */
    public async share(cid: string, access: Access, title: string): Promise<{ link: string, secret: string }> {
        return await fileManagerDB.share(cid, access, title);
    }

    /**
     * @description Remove o compartilhamento do arquivo.
     * @param cid {String} - CustomId do arquivo
     * @param access {Access} - Propriedades do acesso
     * @param link {String} - Link do compartilhamento
     * @param secret {String} - Texto secreto definido pelo usuário
     */
    public async unShare(cid: string, access: Access, link: string, secret: string): Promise<boolean> {
        return await fileManagerDB.unShare(cid, access, { link, secret });
    }

    /**
     * @description Verifica o bloqueio do arquivo.
     * @param cid {String} - CustomId do arquivo
     * @param access {Access} - Propriedades do acesso
     */
    public async verifyBlocked(cid: string, access: Access): Promise<BlockVerify> {
        return await fileManagerDB.verifyBlocked(cid, access);
    }

    /**
     * @description Desbloqueia o arquivo.
     * @param cid {String} - CustomId do arquivo
     * @param access {Access} - Propriedades do acesso
     */
    public async unBlocked(cid: string, access: Access): Promise<boolean> {
        return await fileManagerDB.unBlocked(cid, access);
    }

    /**
     * @description Bloqueia o arquivo por data.
     * @param cid {String} - CustomId do arquivo
     * @param access {Access} - Propriedades do acesso
     * @param repeat {Boolean} - Deve repetir esse bloqueio?
     * @param args {year, month, date, hour, minute} - Propriedades da data
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

        return await fileManagerDB.blocked(cid, access, {
            type: 'Date',
            value: now,
            repeat
        });
    }

    /**
     * @description Bloqueia o arquivo por mês.
     * @param cid {String} - CustomId do arquivo
     * @param access {Access} - Propriedades do acesso
     * @param repeat {Boolean} - Deve repetir esse bloqueio?
     * @param month {number} - sequência começa em 0 até 11
     */
    public async blockedByMonth(cid: string, access: Access, repeat: boolean, month: number): Promise<boolean> {
        const now = new Date();

        now.setMonth(month);

        return await fileManagerDB.blocked(cid, access, {
            type: 'Month',
            value: now,
            repeat
        });
    }

    /**
     * @description Bloqueia o arquivo por dia do mês.
     * @param access {Access} - Propriedades do acesso
     * @param repeat {Boolean} - Deve repetir esse bloqueio?
     * @param cid {String} - CustomId do arquivo
     * @param day {Number} - Dia do mês por exemplo 30
     */
    public async blockedByDayMonth(cid: string, access: Access, repeat: boolean, day: number): Promise<boolean> {
        const now = new Date();

        now.setDate(day);

        return await fileManagerDB.blocked(cid, access, {
            type: 'Day Month',
            value: now,
            repeat
        });
    }

    /**
     * @description Bloqueia o arquivo por dia da semana.
     * @param repeat {Boolean} - Deve repetir esse bloqueio?
     * @param access {Access} - Propriedades do acesso
     * @param cid {String} - CustomId do arquivo
     * @param day {Number} - Dia do mês por exemplo 30
     */
    public async blockedByDayWeek(cid: string, access: Access, repeat: boolean, day: number): Promise<boolean> {
        const now = new Date();

        now.setDate(day);

        return await fileManagerDB.blocked(cid, access, {
            type: 'Day Week',
            value: now,
            repeat
        });
    }

    /**
     * @description Bloqueia o arquivo por hora.
     * @param repeat {Boolean} - Deve repetir esse bloqueio?
     * @param access {Access} - Propriedades do acesso
     * @param cid {String} - CustomId do arquivo
     * @param hour {Number} - A hora será acrescentada a hora atual, por exemplo: 12h(atual) + 2h(param) = 14h
     */
    public async blockedByHour(cid: string, access: Access, repeat: boolean, hour: number): Promise<boolean> {
        const now = new Date();

        now.setHours(now.getHours() + hour);

        return await fileManagerDB.blocked(cid, access, {
            type: 'Hour',
            value: now,
            repeat
        });
    }

    /**
     * @description Bloqueia o arquivo por minuto.
     * @param repeat {Boolean} - Deve repetir esse bloqueio?
     * @param access {Access} - Propriedades do acesso
     * @param cid {String} - CustomId do arquivo
     * @param minute {Number} - O minuto será acrescentado ao minuto atual, por exemplo: 30m(atual) + 2m(param) = 32m
     */
    public async blockedByMinute(cid: string, access: Access, repeat: boolean, minute: number): Promise<boolean> {
        const now = new Date();

        now.setMinutes(now.getMinutes() + minute);

        return await fileManagerDB.blocked(cid, access, {
            type: 'Minute',
            value: now,
            repeat
        });
    }

    /**
     * @description Coloca o arquivo na lixeira.
     * @param cid {String} - CustomId do arquivo
     * @param access {Access} - Propriedades do acesso
     */
    public async moveToGarbage(cid: string, access: Access): Promise<boolean> {
        return await fileManagerDB.moveToGarbage(cid, access);
    }

    /**
     * @description Retira o arquivo da lixeira.
     * @param cid {String} - CustomId do arquivo
     * @param access {Access} - Propriedades do acesso
     */
    public async removeOfGarbage(cid: string, access: Access): Promise<boolean> {
        return await fileManagerDB.removeOfGarbage(cid, access);
    }

    /**
     * @description Reciclagem dos arquivos na lixeira
     */
    public recycleGarbage() {
        return new Promise<string>(async (resolve, reject) => {
            try {
                const filesId = await fileManagerDB.recycleGarbage();

                if (filesId.length > 0) {
                    const
                        access: Access = {
                            group: {
                                name: "administrador",
                                permission: "Delete"
                            }
                        },
                        accessFolder: AccessFolder = {
                            group: {
                                name: "administrador",
                                permission: "Delete"
                            }
                        };

                    for (const fileId of filesId) {
                        await this.delete(fileId, access, accessFolder).catch(error => reject(error));
                    }

                    return resolve(`${filesId.length} arquivo(s) da lixeira foram reciclados.`);
                } else {
                    return resolve(`Nenhum arquivo da lixeira foi reciclado.`);
                }
            } catch(error: any) {
                return reject(error);
            }
        });
    }

    /**
     * @description Gera um pedido aos procuradores para mover o arquivo para a lixeira
     * @param cid {String} - CustomId do arquivo
     * @param access {Access} - Propriedades do acesso
     * @param order {Order} - Propriedades do pedido
     */
    public async orderMoveToGarbage(cid: string, access: Access, order: Order): Promise<boolean> {
        return await fileManagerDB.orderMoveToGarbage(cid, access, order);
    }

    /**
     * @description Remove o pedido enviado aos procuradores
     * @param cid {String} - CustomId do arquivo
     * @param access {Access} - Propriedades do acesso
     */
    public async orderRemove(cid: string, access: Access): Promise<boolean> {
        return await fileManagerDB.orderRemove(cid, access);
    }

    /**
     * @description Responde o pedido enviado ao procurador
     * @param cid {String} - CustomId do arquivo
     * @param access {Access} - Propriedades do acesso
     * @param answer {OrderAnswer} Resposta do procurador
     */
    public async orderAssigneeSetDecision(cid: string, access: Access, answer: OrderAnswer): Promise<boolean> {
        return await fileManagerDB.orderAssigneeSetDecision(cid, access, answer);
    }

    /**
     * @description Processa o pedido enviado aos procuradores
     * @param cid {String} - CustomId do arquivo
     * @param access {Access} - Propriedades do acesso
     */
    public async orderProcess(cid: string, access: Access): Promise<boolean> {
        return await fileManagerDB.orderProcess(cid, access);
    }

    /**
     * @description Verifica se o grupo tem permissão para acessar o arquivo
     * @param cid {String} - CustomId do arquivo
     * @param group {GroupId} - Nome do grupo
     * @param permission {FilePermission} - Tipo de permissão
     */
    public async checkGroupAccess(cid: string, group: Pick<GroupId, 'name'>, permission: FilePermission): Promise<boolean> {
        return await fileManagerDB.checkGroupAccess(cid, group, permission);
    }

    /**
     * @description Verifica se o grupo tem permissão para acessar o arquivo
     * @param cid {String} - CustomId do arquivo
     * @param user {UserId} - E-mail do usuário
     * @param permission {FilePermission} - Tipo de permissão
    */
    public async checkUserAccess(cid: string, user: Pick<UserId, 'email'>, permission: FilePermission): Promise<boolean> {
        return await fileManagerDB.checkUserAccess(cid, user, permission);
    }
}

export default new FileController();