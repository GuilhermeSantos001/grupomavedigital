/**
 * @description Armazena os dados do arquivo
 * @author GuilhermeSantos001
 * @update 04/01/2022
 */

import { createGzip, constants, Gzip } from 'zlib';
import { promisify } from 'util';
import { pipeline } from 'stream';
import { ReadStream, WriteStream } from 'fs-extra';
import { Response } from 'express';
import { GridFSBucket, GridFSBucketReadStream, ObjectId } from 'mongodb';

import mongoDB from '@/controllers/mongodb';

export type MetadataFile = {
    filename: string
    filetype: string
    authorId: string
    size: string
    version: number
    status: FileType
}

export type FileType =
    | 'Active'
    | 'Inactive'
    | 'Corrupted'

class FileGridFS {

    constructor() { }

    private dbName(): any {
        return mongoDB.getDB(process.env.DB_HERCULES_STORAGE || "");
    }

    /**
     * @description Abre uma Stream(GridFSBucketWriteStream) para escrever o arquivo no banco de dados.
     * @param stream {ReadStream} - ReadStream (Origem)
     * @param metadata {MetadataFile} - Metadados do arquivo
     */
    public openUploadStream(stream: ReadStream, metadata: MetadataFile) {
        return new Promise<{
            fileId: ObjectId
            version: number
            compressedSize: number
            status: FileType
        }>(async (resolve, reject) => {
            try {
                const
                    bucket = new GridFSBucket(this.dbName()),
                    streamBucket = bucket.openUploadStream(`${String(metadata.filename).trim()}${String(metadata.filetype).trim()}`, {
                        metadata: {
                            authorId: metadata.authorId,
                            size: metadata.size,
                            version: metadata.version,
                            status: metadata.status
                        }
                    });

                const pipe = promisify(pipeline);

                try {
                    await pipe<ReadStream, Gzip, any>(stream, createGzip({ level: constants.Z_BEST_COMPRESSION }), streamBucket)
                } catch (error: any) {
                    return resolve({
                        fileId: streamBucket.id,
                        version: metadata.version,
                        compressedSize: streamBucket.length,
                        status: 'Corrupted'
                    });
                }

                return resolve({
                    fileId: streamBucket.id,
                    version: metadata.version,
                    compressedSize: streamBucket.length,
                    status: metadata.status
                });
            } catch (error: any) {
                return reject(error.message);
            }
        });
    }

    /**
     * @description Abre uma Stream(GridFSBucketReadStream) para ler os dados do arquivo no banco de dados.
     * @param stream {WriteStream | Response} - WriteStream (destino)
     * @param fileId {ObjectId} - ObjectId do arquivo
     */
    public openDownloadStream(stream: WriteStream | Response, fileId: ObjectId) {
        return new Promise<void>(async (resolve, reject) => {
            try {
                const
                    bucket = new GridFSBucket(this.dbName()),
                    streamBucket = bucket.openDownloadStream(fileId);

                streamBucket
                    .pipe(stream)
                    .on('error', async (error: any) => {
                        return reject(error.message);
                    })
                    .on('finish', async () => {
                        return resolve();
                    });
            } catch (error: any) {
                return reject(error.message);
            }
        });
    }

    /**
     * @description Retorna uma Stream(GridFSBucketReadStream) para ler os dados do arquivo no banco de dados.
     * @param fileId {ObjectId} - ObjectId do arquivo
     */
    public getDownloadStream(fileId: ObjectId) {
        return new Promise<GridFSBucketReadStream>(async (resolve, reject) => {
            try {
                const
                    bucket = new GridFSBucket(this.dbName()),
                    streamBucket = bucket.openDownloadStream(fileId);

                return resolve(streamBucket);
            } catch (error: any) {
                return reject(error.message);
            }
        });
    }

    /**
     * @description Retorna o arquivo no banco de dados.
     * @param authorId {string} - Autor do arquivo
     * @param filename {string} - Nome do arquivo
     * @param filetype {string} - Tipo do arquivo
     */
    public get(authorId: string, filename: string, filetype: string) {
        return new Promise<number>(async (resolve, reject) => {
            try {
                const
                    bucket = new GridFSBucket(this.dbName()),
                    files = await bucket.find({ filename: `${String(filename).trim()}${String(filetype).trim()}` }).toArray(),
                    filesByAuthor = files.filter(file => file.metadata && file.metadata['authorId'] === authorId);

                if (filesByAuthor.length > 0) {
                    const metadata = filesByAuthor[filesByAuthor.length - 1].metadata;

                    if (metadata) {
                        return resolve(metadata['version']);
                    } else {
                        return resolve(0);
                    }
                }
                else
                    return resolve(0);
            } catch (error: any) {
                return reject(error.message);
            }
        });
    }

    /**
     * @description Renomeia o arquivo no banco de dados.
     * @param fileId {ObjectId} - ObjectId do arquivo
     * @param name {String} - Novo nome do arquivo
     */
    public rename(fileId: ObjectId, name: string) {
        return new Promise<boolean>(async (resolve, reject) => {
            try {
                const
                    bucket = new GridFSBucket(this.dbName());

                bucket.rename(fileId, name, async (error: any) => {
                    if (error) {
                        return reject(error.message);
                    }

                    return resolve(true);
                });
            } catch (error: any) {
                return reject(error.message);
            }
        });
    }

    /**
     * @description Deleta o arquivo no banco de dados.
     * @param fileId {ObjectId} - ObjectId do arquivo
     */
    public deleteFile(fileId: ObjectId) {
        return new Promise<void>(async (resolve, reject) => {
            try {
                const
                    bucket = new GridFSBucket(this.dbName());

                bucket.delete(fileId, async (error: any) => {
                    if (error) {
                        return reject(error.message);
                    }

                    return resolve();
                });
            } catch (error: any) {
                return reject(error.message);
            }
        });
    }
}

export default new FileGridFS();