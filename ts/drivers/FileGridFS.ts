/**
 * @description Armazena os dados do arquivo
 * @author GuilhermeSantos001
 * @update 31/01/2022
 */

import { createGzip, createUnzip, constants, Gzip } from 'zlib';
import { promisify } from 'util';
import { pipeline } from 'stream';
import { ReadStream, WriteStream } from 'fs-extra';
import { Response } from 'express';
import { GridFSBucket, GridFSBucketReadStream, GridFSBucketWriteStream, ObjectId } from 'mongodb';

import { MongoDBClient } from '@/database/MongoDBClient';

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

export class FileGridFS {
    private mongoDBClient: MongoDBClient;

    constructor() {
        this.mongoDBClient = new MongoDBClient();
    }

    private dbName() {
        return this.mongoDBClient.getDB(process.env.DB_HERCULES_STORAGE || "");
    }

    /**
     * @description Abre uma Stream(GridFSBucketWriteStream) para escrever o arquivo no banco de dados.
     * @param stream {ReadStream} - ReadStream (Origem)
     * @param metadata {MetadataFile} - Metadados do arquivo
     */
    public async openUploadStream(stream: ReadStream, metadata: MetadataFile): Promise<{
        fileId: ObjectId
        version: number
        compressedSize: number
        status: FileType
    }> {
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
                await pipe<ReadStream, Gzip, GridFSBucketWriteStream>(stream, createGzip({ level: constants.Z_BEST_COMPRESSION }), streamBucket)
            } catch {
                return {
                    fileId: streamBucket.id,
                    version: metadata.version,
                    compressedSize: streamBucket.length,
                    status: 'Corrupted'
                }
            }

            return {
                fileId: streamBucket.id,
                version: metadata.version,
                compressedSize: streamBucket.length,
                status: metadata.status
            };
        } catch (error) {
            throw new Error(error instanceof Error ? error.message : JSON.stringify(error))
        }
    }

    /**
     * @description Abre uma Stream(GridFSBucketReadStream) para ler os dados do arquivo no banco de dados.
     * @param stream {WriteStream | Response} - WriteStream (destino)
     * @param fileId {ObjectId} - ObjectId do arquivo
     */
    public async openDownloadStream(stream: WriteStream | Response, fileId: ObjectId, decompress?: boolean) {
        try {
            const
                bucket = new GridFSBucket(this.dbName()),
                streamBucket = bucket.openDownloadStream(fileId);

            if (!decompress) {
                return streamBucket
                    .pipe(stream)
                    .on('error', async (error) => {
                        throw new Error(error instanceof Error ? error.message : JSON.stringify(error));
                    });
            } else {
                const pipe = promisify(pipeline);

                return await pipe<GridFSBucketReadStream, Gzip, WriteStream | Response>(streamBucket, createUnzip({ level: constants.Z_BEST_COMPRESSION }), stream);
            }
        } catch (error) {
            throw new Error(error instanceof Error ? error.message : JSON.stringify(error))
        }
    }

    /**
     * @description Retorna uma Stream(GridFSBucketReadStream) para ler os dados do arquivo no banco de dados.
     * @param fileId {ObjectId} - ObjectId do arquivo
     */
    public async getDownloadStream(fileId: ObjectId) {
        try {
            const
                bucket = new GridFSBucket(this.dbName()),
                streamBucket = bucket.openDownloadStream(fileId);

            return streamBucket;
        } catch (error) {
            throw new Error(error instanceof Error ? error.message : JSON.stringify(error))
        }
    }

    /**
     * @description Retorna o arquivo no banco de dados.
     * @param authorId {string} - Autor do arquivo
     * @param filename {string} - Nome do arquivo
     * @param filetype {string} - Tipo do arquivo
     */
    public async get(authorId: string, filename: string, filetype: string): Promise<number> {
        try {
            const
                bucket = new GridFSBucket(this.dbName()),
                files = await bucket.find({ filename: `${String(filename).trim()}${String(filetype).trim()}` }).toArray(),
                filesByAuthor = files.filter(file => file.metadata && file.metadata['authorId'] === authorId);

            if (filesByAuthor.length > 0) {
                const metadata = filesByAuthor[filesByAuthor.length - 1].metadata;

                if (metadata) {
                    return metadata['version'];
                } else {
                    return 0;
                }
            }
            else
                return 0;
        } catch (error) {
            throw new Error(error instanceof Error ? error.message : JSON.stringify(error))
        }
    }

    /**
     * @description Retorna o arquivo no banco de dados.
     * @param fileId {ObjectId} - ObjectId do arquivo
     */
    public async findById(fileId: ObjectId) {
        try {
            const
                bucket = new GridFSBucket(this.dbName()),
                files = await bucket.find({ _id: fileId }).toArray();

            if (files.length > 0) {
                const metadata = files[files.length - 1];

                return metadata;
            }
            else
                throw new Error('File not found');
        } catch (error) {
            throw new Error(error instanceof Error ? error.message : JSON.stringify(error))
        }
    }

    /**
     * @description Renomeia o arquivo no banco de dados.
     * @param fileId {ObjectId} - ObjectId do arquivo
     * @param name {String} - Novo nome do arquivo
     */
    public async rename(fileId: ObjectId, name: string) {
        try {
            const
                bucket = new GridFSBucket(this.dbName());

            return await bucket.rename(fileId, name, async (error) => {
                if (error)
                    throw new Error(error instanceof Error ? error.message : JSON.stringify(error))
            });
        } catch (error) {
            throw new Error(error instanceof Error ? error.message : JSON.stringify(error))
        }
    }

    /**
     * @description Deleta o arquivo no banco de dados.
     * @param fileId {ObjectId} - ObjectId do arquivo
     */
    public async deleteFile(fileId: ObjectId) {
        try {
            const
                bucket = new GridFSBucket(this.dbName());

            return await bucket.delete(fileId, async (error) => {
                if (error)
                    throw new Error(error instanceof Error ? error.message : JSON.stringify(error))
            });
        } catch (error) {
            throw new Error(error instanceof Error ? error.message : JSON.stringify(error))

        }
    }
}