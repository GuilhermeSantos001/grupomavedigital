/**
* @description Testes do driver GridFS
* @author GuilhermeSantos001
* @update 31/01/2022
*/

import fs from 'fs';
import Sugar from 'sugar';
import { localPath } from '@/utils/localpath';

import { FileGridFS } from '@/drivers/FileGridFS';
import { MongoDBClient } from '@/database/MongoDBClient';

describe("Teste do driver GridFS", () => {
    beforeAll(async () => {
        const
            mongoDBClient = new MongoDBClient(),
            collectionName1 = 'fs.files',
            collectionName2 = 'fs.chunks',
            collections = await mongoDBClient.getDB(process.env.DB_HERCULES_STORAGE || "").listCollections().toArray();

        if (collections.filter(collection => collection.name === collectionName1).length > 0) {
            await mongoDBClient.getDB(process.env.DB_HERCULES_STORAGE || "").dropCollection(collectionName1);
        }

        if (collections.filter(collection => collection.name === collectionName2).length > 0) {
            await mongoDBClient.getDB(process.env.DB_HERCULES_STORAGE || "").dropCollection(collectionName2);
        }
    });

    it("Deve salvar um arquivo", async () => {
        const
            fileGridFS = new FileGridFS(),
            fileName = 'Hello World 1.txt',
            filePath = localPath(`ts/test/database/${fileName}`);

        const stream = await fileGridFS.openUploadStream(fs.createReadStream(filePath), {
            authorId: 'ti-gui',
            filename: 'Hello World 1',
            filetype: '.txt',
            size: Sugar.Number.bytes(fs.statSync(filePath).size),
            status: 'Active',
            version: 1
        });

        expect(stream.compressedSize).toBeDefined();
        expect(stream.fileId).toBeDefined();
        expect(stream.status).toBeDefined();
        expect(stream.version).toBeDefined();
    });

    it("Deve ler um arquivo", async () => {
        const
            fileGridFS = new FileGridFS(),
            fileName = 'Hello World 1.txt',
            filePath = localPath(`ts/test/database/${fileName}`);

        const stream = await fileGridFS.openUploadStream(fs.createReadStream(filePath), {
            authorId: 'ti-gui',
            filename: 'Hello World 1',
            filetype: '.txt',
            size: Sugar.Number.bytes(fs.statSync(filePath).size),
            status: 'Active',
            version: 1
        });

        expect(stream.compressedSize).toBeDefined();
        expect(stream.fileId).toBeDefined();
        expect(stream.status).toBeDefined();
        expect(stream.version).toBeDefined();

        const
            fileNameWrite = `${new Date()}.txt.gz`,
            filePathWrite = localPath(`ts/test/database/${fileNameWrite}`);

        expect(await fileGridFS.openDownloadStream(fs.createWriteStream(filePathWrite), stream.fileId)).toBeUndefined();
    });
});

afterAll(async () => {
    const mongoDBClient = new MongoDBClient();
    mongoDBClient.shutdown();
});