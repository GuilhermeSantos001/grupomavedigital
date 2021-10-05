/**
 * @description Gerenciamento de arquivos
 * @author @GuilhermeSantos001
 * @update 24/08/2021
 * @version 1.27.29
 */

import { ReadStream, WriteStream } from 'fs-extra';
import { Response } from 'express';
import { ObjectId } from 'mongodb';
import { FilterQuery } from 'mongoose';

import { GroupId, UserId, Assignee, Order, OrderAnswer, fileInterface, fileModelInterface } from '@/mongo/files-manager-mongo';
import fileManagerDB, { Access, BlockVerify } from '@/db/files-db';
import { Access as AccessFolder } from '@/db/folders-db';
import FileGridFS from '@/drivers/file-gridfs';
import Archive, { Reader } from '@/utils/archive';

class FileController {
    /**
     * @description Extensões de arquivo autorizadas
     */
    public readonly extensions: Array<string> =
        [
            '.txt', '.pdf', '.ppt', '.pptx',
            '.jpg', '.jpeg', '.xls', '.xlsx',
            '.doc', '.docx', '.csv', '.xlsb',
            '.psd'
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
        return new Promise<void>(async (resolve) => {
            try {
                await fileManagerDB.close(cid, access);

                return resolve();
            } catch (error) {
                return resolve();
            }
        });
    }

    /**
     * @description Retorna uma lista de arquivos
     * @param filter {Object} - Filtro Aplicado na busca
     * @param skip {Number} - Pular x itens iniciais no banco de dados
     * @param limit {Number} - Limite de itens a serem retornados
     */
    public get(filter: FilterQuery<fileModelInterface>, skip: number, limit: number): Promise<fileInterface[]> {
        return new Promise(async (resolve, reject) => {
            try {
                const files = await fileManagerDB.get(filter, skip, limit);

                return resolve(files.map(file => {
                    return {
                        cid: file.cid,
                        authorId: file.authorId,
                        accessGroupId: file.accessGroupId,
                        accessUsersId: file.accessUsersId,
                        name: file.name,
                        description: file.description,
                        version: file.version,
                        history: file.history,
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
                        createdAt: file.createdAt
                    };
                }));
            } catch (error) {
                return reject(error);
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
                return resolve(await fileManagerDB.save(file));
            } catch (error) {
                return reject(error);
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

                await this.rename(cid, access, data.name);

                return resolve(true);
            } catch (error) {
                await this.closeAfterInteraction(cid, access);

                return reject(error);
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

                return resolve(true);
            } catch (error) {
                await this.closeAfterInteraction(cid, access);

                return reject(error);
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

                return resolve(true);
            } catch (error) {
                await this.closeAfterInteraction(cid, access);

                return reject(error);
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

                return resolve(true);
            } catch (error) {
                await this.closeAfterInteraction(cid, access);

                return reject(error);
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

                return resolve(true);
            } catch (error) {
                await this.closeAfterInteraction(cid, access);

                return reject(error);
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

                return resolve(true);
            } catch (error) {
                await this.closeAfterInteraction(cid, access);

                return reject(error);
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

                return resolve(true);
            } catch (error) {
                await this.closeAfterInteraction(cid, access);

                return reject(error);
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

                return resolve(true);
            } catch (error) {
                await this.closeAfterInteraction(cid, access);

                return reject(error);
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
                const
                    result = await fileManagerDB.rename(cid, access, name);

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

                return resolve(true);
            } catch (error) {
                await this.closeAfterInteraction(cid, access);

                return reject(error);
            }
        });
    }

    /**
     * @description Escreve dados para o arquivo.
     * @param cid {String} - CustomId do arquivo
     * @param access {Access} - Propriedades do acesso
     * @param stream {ReadStream} - ReadStream (Origem)
     */
    public write(cid: string, access: Access, stream: ReadStream) {
        return new Promise<{ versions: number, version: number }>(async (resolve, reject) => {
            try {
                const
                    { filename, fileType, authorId, version } = await fileManagerDB.write(cid, access);

                const history = await FileGridFS.openUploadStream(stream, {
                    filename,
                    fileType,
                    authorId,
                    version
                });

                const versions = await fileManagerDB.addHistory(cid, history);
                await fileManagerDB.close(cid, access);

                return resolve({ versions, version });
            } catch (error) {
                await this.closeAfterInteraction(cid, access);

                return reject(error);
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
                const
                    fileIds = await fileManagerDB.removeHistory(cid, access, versions);

                fileIds.map(async fileId => await FileGridFS.deleteFile(new ObjectId(fileId)));

                await fileManagerDB.close(cid, access);

                return resolve(true);
            } catch (error) {
                await this.closeAfterInteraction(cid, access);

                return reject(error);
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
                const
                    { fileId, filename } = await fileManagerDB.read(cid, access, version);

                await FileGridFS.openDownloadStream(stream, new ObjectId(fileId));
                await fileManagerDB.close(cid, access);

                return resolve(filename);
            } catch (error) {
                await this.closeAfterInteraction(cid, access);

                return reject(error);
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
    public readCompile(cid: string, access: Access, versions: number[], stream: WriteStream | Response) {
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

                return resolve(true);
            } catch (error) {
                await this.closeAfterInteraction(cid, access);

                return reject(error);
            }
        });
    }

    /**
     * @description Fecha o arquivo e estabelece o status "Disponível" para novas operações.
     * @param cid {String} - CustomId do arquivo
     * @param access {Access} - Propriedades do acesso
     */
    public close(cid: string, access: Access) {
        return new Promise<boolean>(async (resolve, reject) => {
            try {
                return resolve(await fileManagerDB.close(cid, access));
            } catch (error) {
                return reject(error);
            }
        });
    }

    /**
     * @description Protege o arquivo.
     * @param cid {String} - CustomId do arquivo
     * @param access {Access} - Propriedades do acesso
     * @param passphrase {string} - Texto secreto definido pelo usuário
     */
    public protect(cid: string, access: Access, passphrase: string) {
        return new Promise<string>(async (resolve, reject) => {
            try {
                return resolve(await fileManagerDB.protect(cid, access, passphrase));
            } catch (error) {
                return reject(error);
            }
        });
    }

    /**
     * @description Desprotege o arquivo.
     * @param cid {String} - CustomId do arquivo
     * @param access {Access} - Propriedades do acesso
     * @param key {String} - Chave secreta do compartilhamento
     * @param passphrase {string} - Texto secreto definido pelo usuário
     */
    public unProtect(cid: string, access: Access, key: string, passphrase: string) {
        return new Promise<boolean>(async (resolve, reject) => {
            try {
                return resolve(await fileManagerDB.unProtect(cid, access, { key, passphrase }));
            } catch (error) {
                return reject(error);
            }
        });
    }

    /**
     * @description Libera o compartilhamento do arquivo.
     * @param cid {String} - CustomId do arquivo
     * @param access {Access} - Propriedades do acesso
     * @param title {String} - Texto personalizado usado na UI/UX.
     */
    public share(cid: string, access: Access, title: string) {
        return new Promise<{ link: string, secret: string }>(async (resolve, reject) => {
            try {
                return resolve(await fileManagerDB.share(cid, access, title));
            } catch (error) {
                return reject(error);
            }
        });
    }

    /**
     * @description Remove o compartilhamento do arquivo.
     * @param cid {String} - CustomId do arquivo
     * @param access {Access} - Propriedades do acesso
     * @param link {String} - Link do compartilhamento
     * @param secret {String} - Texto secreto definido pelo usuário
     */
    public unShare(cid: string, access: Access, link: string, secret: string) {
        return new Promise<boolean>(async (resolve, reject) => {
            try {
                return resolve(await fileManagerDB.unShare(cid, access, { link, secret }));
            } catch (error) {
                return reject(error);
            }
        });
    }

    /**
     * @description Verifica o bloqueio do arquivo.
     * @param cid {String} - CustomId do arquivo
     * @param access {Access} - Propriedades do acesso
     */
    public verifyBlocked(cid: string, access: Access) {
        return new Promise<BlockVerify>(async (resolve, reject) => {
            try {
                return resolve(await fileManagerDB.verifyBlocked(cid, access));
            } catch (error) {
                return reject(error);
            }
        });
    }

    /**
     * @description Desbloqueia o arquivo.
     * @param cid {String} - CustomId do arquivo
     * @param access {Access} - Propriedades do acesso
     */
    public unBlocked(cid: string, access: Access) {
        return new Promise<boolean>(async (resolve, reject) => {
            try {
                return resolve(await fileManagerDB.unBlocked(cid, access));
            } catch (error) {
                return reject(error);
            }
        });
    }

    /**
     * @description Bloqueia o arquivo por data.
     * @param cid {String} - CustomId do arquivo
     * @param access {Access} - Propriedades do acesso
     * @param repeat {Boolean} - Deve repetir esse bloqueio?
     * @param args {year, month, date, hour, minute} - Propriedades da data
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

                return resolve(await fileManagerDB.blocked(cid, access, {
                    type: 'Date',
                    value: now,
                    repeat
                }));
            } catch (error) {
                return reject(error);
            }
        });
    }

    /**
     * @description Bloqueia o arquivo por mês.
     * @param cid {String} - CustomId do arquivo
     * @param access {Access} - Propriedades do acesso
     * @param repeat {Boolean} - Deve repetir esse bloqueio?
     * @param month {number} - sequência começa em 0 até 11
     */
    public blockedByMonth(cid: string, access: Access, repeat: boolean, month: number) {
        return new Promise<boolean>(async (resolve, reject) => {
            try {
                const now = new Date();

                now.setMonth(month);

                return resolve(await fileManagerDB.blocked(cid, access, {
                    type: 'Month',
                    value: now,
                    repeat
                }));
            } catch (error) {
                return reject(error);
            }
        });
    }

    /**
     * @description Bloqueia a pasta por dia do mês.
     * @param access {Access} - Propriedades do acesso
     * @param repeat {Boolean} - Deve repetir esse bloqueio?
     * @param cid {String} - CustomId da pasta
     * @param day {Number} - Dia do mês por exemplo 30
     */
    public blockedByDayMonth(cid: string, access: Access, repeat: boolean, day: number) {
        return new Promise<boolean>(async (resolve, reject) => {
            try {
                const now = new Date();

                now.setDate(day);

                return resolve(await fileManagerDB.blocked(cid, access, {
                    type: 'Day Month',
                    value: now,
                    repeat
                }));
            } catch (error) {
                return reject(error);
            }
        });
    }

    /**
     * @description Bloqueia a pasta por dia da semana.
     * @param repeat {Boolean} - Deve repetir esse bloqueio?
     * @param access {Access} - Propriedades do acesso
     * @param cid {String} - CustomId da pasta
     * @param day {Number} - Dia do mês por exemplo 30
     */
    public blockedByDayWeek(cid: string, access: Access, repeat: boolean, day: number) {
        return new Promise<boolean>(async (resolve, reject) => {
            try {
                const now = new Date();

                now.setDate(day);

                return resolve(await fileManagerDB.blocked(cid, access, {
                    type: 'Day Week',
                    value: now,
                    repeat
                }));
            } catch (error) {
                return reject(error);
            }
        });
    }

    /**
     * @description Bloqueia o arquivo por hora.
     * @param repeat {Boolean} - Deve repetir esse bloqueio?
     * @param access {Access} - Propriedades do acesso
     * @param cid {String} - CustomId do arquivo
     * @param hour {Number} - A hora será acrescentada a hora atual, por exemplo: 12h(atual) + 2h(param) = 14h
     */
    public blockedByHour(cid: string, access: Access, repeat: boolean, hour: number) {
        return new Promise<boolean>(async (resolve, reject) => {
            try {
                const now = new Date();

                now.setHours(now.getHours() + hour);

                return resolve(await fileManagerDB.blocked(cid, access, {
                    type: 'Hour',
                    value: now,
                    repeat
                }));
            } catch (error) {
                return reject(error);
            }
        });
    }

    /**
     * @description Bloqueia o arquivo por minuto.
     * @param repeat {Boolean} - Deve repetir esse bloqueio?
     * @param access {Access} - Propriedades do acesso
     * @param cid {String} - CustomId do arquivo
     * @param minute {Number} - O minuto será acrescentado ao minuto atual, por exemplo: 30m(atual) + 2m(param) = 32m
     */
    public blockedByMinute(cid: string, access: Access, repeat: boolean, minute: number) {
        return new Promise<boolean>(async (resolve, reject) => {
            try {
                const now = new Date();

                now.setMinutes(now.getMinutes() + minute);

                return resolve(await fileManagerDB.blocked(cid, access, {
                    type: 'Minute',
                    value: now,
                    repeat
                }));
            } catch (error) {
                return reject(error);
            }
        });
    }

    /**
     * @description Coloca o arquivo na lixeira.
     * @param cid {String} - CustomId do arquivo
     * @param access {Access} - Propriedades do acesso
     */
    public moveToGarbage(cid: string, access: Access) {
        return new Promise<boolean>(async (resolve, reject) => {
            try {
                return resolve(await fileManagerDB.moveToGarbage(cid, access));
            } catch (error) {
                return reject(error);
            }
        });
    }

    /**
     * @description Retira o arquivo da lixeira.
     * @param cid {String} - CustomId do arquivo
     * @param access {Access} - Propriedades do acesso
     */
    public removeOfGarbage(cid: string, access: Access) {
        return new Promise<boolean>(async (resolve, reject) => {
            try {
                return resolve(await fileManagerDB.removeOfGarbage(cid, access));
            } catch (error) {
                return reject(error);
            }
        });
    }

    /**
     * @description Reciclagem dos arquivos na lixeira
     */
    public async recycleGarbage() {
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
                        await this.delete(fileId, access, accessFolder);
                    }

                    return resolve(`${filesId.length} arquivo(s) da lixeira foram reciclados.`);
                } else {
                    return resolve(`Nenhum arquivo da lixeira foi reciclado.`);
                }
            } catch (error) {
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
    public orderMoveToGarbage(cid: string, access: Access, order: Order) {
        return new Promise<boolean>(async (resolve, reject) => {
            try {
                return resolve(await fileManagerDB.orderMoveToGarbage(cid, access, order));
            } catch (error) {
                return reject(error);
            }
        });
    }

    /**
     * @description Remove o pedido enviado aos procuradores
     * @param cid {String} - CustomId do arquivo
     * @param access {Access} - Propriedades do acesso
     */
    public orderRemove(cid: string, access: Access) {
        return new Promise<boolean>(async (resolve, reject) => {
            try {
                return resolve(await fileManagerDB.orderRemove(cid, access));
            } catch (error) {
                return reject(error);
            }
        });
    }

    /**
     * @description Responde o pedido enviado ao procurador
     * @param cid {String} - CustomId do arquivo
     * @param access {Access} - Propriedades do acesso
     * @param answer {OrderAnswer} Resposta do procurador
     */
    public orderAssigneeSetDecision(cid: string, access: Access, answer: OrderAnswer) {
        return new Promise<boolean>(async (resolve, reject) => {
            try {
                return resolve(await fileManagerDB.orderAssigneeSetDecision(cid, access, answer));
            } catch (error) {
                return reject(error);
            }
        });
    }

    /**
     * @description Processa o pedido enviado aos procuradores
     * @param cid {String} - CustomId do arquivo
     * @param access {Access} - Propriedades do acesso
     */
    public orderProcess(cid: string, access: Access) {
        return new Promise<boolean>(async (resolve, reject) => {
            try {
                return resolve(await fileManagerDB.orderProcess(cid, access));
            } catch (error) {
                return reject(error);
            }
        });
    }
}

export default new FileController();