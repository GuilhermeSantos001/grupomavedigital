/**
 * @description Armazena os dados do arquivo
 * @author @GuilhermeSantos001
 * @update 01/09/2021
 * @version 1.1.3
 */

// @ts-nocheck

import { createGzip, constants } from 'zlib';
import { promisify } from 'util';
import { pipeline } from 'stream';
import { ReadStream, WriteStream } from 'fs-extra';
import { Response } from 'express';
import { GridFSBucket, GridFSBucketReadStream, ObjectId } from 'mongodb';

import { HistoryFile } from '@/mongo/files-manager-mongo';
import mongoDB from '@/controllers/mongodb';

export type MetadataFile = {
    filename: string;
    fileType: string;
    authorId: string;
    version: number;
}

class FileGridFS {

    constructor() { };

    private dbName() {
        return process.env.DB_HERCULES_STORAGE;
    };

    /**
     * @description Abre uma Stream(GridFSBucketWriteStream) para escrever o arquivo no banco de dados.
     * @param stream {ReadStream} - ReadStream (Origem)
     * @param metadata {MetadataFile} - Metadados do arquivo
     */
    public openUploadStream(stream: ReadStream, metadata: MetadataFile) {
        return new Promise<HistoryFile>(async (resolve, reject) => {
            try {
                const
                    bucket = new GridFSBucket(mongoDB.getDB(this.dbName())),
                    streamBucket = bucket.openUploadStream(`${metadata.filename}${metadata.fileType}`, {
                        metadata: {
                            authorId: metadata.authorId,
                            version: metadata.version
                        }
                    });

                const pipe = promisify(pipeline);

                await pipe(stream, createGzip({ level: constants.Z_BEST_COMPRESSION }), streamBucket);

                return resolve({
                    fileId: streamBucket.id,
                    version: metadata.version
                });
            } catch (error) {
                return reject(error);
            };
        });
    };

    /**
     * @description Abre uma Stream(GridFSBucketReadStream) para ler os dados do arquivo no banco de dados.
     * @param stream {WriteStream | Response} - WriteStream (destino)
     * @param fileId {ObjectId} - ObjectId do arquivo
     */
    public openDownloadStream(stream: WriteStream | Response, fileId: ObjectId) {
        return new Promise<void>(async (resolve, reject) => {
            try {
                const
                    bucket = new GridFSBucket(mongoDB.getDB(this.dbName())),
                    streamBucket = bucket.openDownloadStream(fileId);

                streamBucket
                    .pipe(stream)
                    .on('error', async (error: any) => {
                        return reject(error);
                    })
                    .on('finish', async () => {
                        return resolve();
                    });
            } catch (error) {
                return reject(error);
            };
        });
    };

    /**
     * @description Retorna uma Stream(GridFSBucketReadStream) para ler os dados do arquivo no banco de dados.
     * @param fileId {ObjectId} - ObjectId do arquivo
     */
    public getDownloadStream(fileId: ObjectId) {
        return new Promise<GridFSBucketReadStream>(async (resolve, reject) => {
            try {
                const
                    bucket = new GridFSBucket(mongoDB.getDB(this.dbName())),
                    streamBucket = bucket.openDownloadStream(fileId);

                return resolve(streamBucket);
            } catch (error) {
                return reject(error);
            };
        });
    };

    /**
     * @description Renomeia o arquivo no banco de dados.
     * @param fileId {ObjectId} - ObjectId do arquivo
     * @param name {String} - Novo nome do arquivo
     */
    public rename(fileId: ObjectId, name: string) {
        return new Promise<boolean>(async (resolve, reject) => {
            try {
                const
                    bucket = new GridFSBucket(mongoDB.getDB(this.dbName()));

                bucket.rename(fileId, name, async (error: any) => {
                    if (error) {
                        return reject(error);
                    };

                    return resolve(true);
                });
            } catch (error) {
                return reject(error);
            };
        });
    };

    /**
     * @description Deleta o arquivo no banco de dados.
     * @param fileId {ObjectId} - ObjectId do arquivo
     */
    public deleteFile(fileId: ObjectId) {
        return new Promise<void>(async (resolve, reject) => {
            try {
                const
                    bucket = new GridFSBucket(mongoDB.getDB(this.dbName()));

                bucket.delete(fileId, async (error: any) => {
                    if (error) {
                        return reject(error);
                    };

                    return resolve();
                });
            } catch (error) {
                return reject(error);
            };
        });
    };
};

export default new FileGridFS();