import { createReadStream, statSync } from 'fs';
import { localPath } from '@/utils/localpath';
import Sugar from 'sugar';

import { FileGridFS } from '@/drivers/FileGridFS';
import { UploadsController } from '@/controllers/UploadsController';
import { MongoDBClient } from '@/database/MongoDBClient';

describe('Gerenciador de Uploads', () => {
  beforeAll(async () => {
    const
      mongoDBClient = new MongoDBClient(),
      collectionName1 = 'fs.files',
      collectionName2 = 'fs.chunks',
      collectionName3 = 'uploads',
      collections1 = await mongoDBClient.getDB(process.env.DB_HERCULES_STORAGE || "").listCollections().toArray(),
      collections2 = await mongoDBClient.getDB(process.env.DB_NAME || "").listCollections().toArray();

    if (collections1.filter(collection => collection.name === collectionName1).length > 0) {
      await mongoDBClient.getDB(process.env.DB_HERCULES_STORAGE || "").dropCollection(collectionName1);
    }

    if (collections1.filter(collection => collection.name === collectionName2).length > 0) {
      await mongoDBClient.getDB(process.env.DB_HERCULES_STORAGE || "").dropCollection(collectionName2);
    }

    if (collections2.filter(collection => collection.name === collectionName3).length > 0) {
      await mongoDBClient.getDB(process.env.DB_NAME || "").dropCollection(collectionName3);
    }
  });

  it('Hospeda um arquivo', async () => {
    const
      filePath = `ts/test/database/Hello World 1.txt`,
      uploadsController = new UploadsController(),
      fileGridFS = new FileGridFS(),
      stream = await fileGridFS.openUploadStream(
        createReadStream(localPath(filePath)),
        {
          authorId: 'ti-gui',
          filename: `Hello World`,
          filetype: '.txt',
          size: Sugar.Number.bytes(statSync(filePath).size),
          status: 'Active',
          version: 1
        });

    expect(stream.compressedSize).toBeDefined();
    expect(stream.fileId).toBeDefined();
    expect(stream.status).toBeDefined();
    expect(stream.version).toBeDefined();

    const result = await uploadsController.register({
      fileId: stream.fileId.toString(),
      authorId: 'ti-gui',
      filename: 'Testing',
      filetype: '.txt',
      description: 'File for testing...',
      size: statSync(filePath).size,
      compressedSize: stream.compressedSize,
      version: 1,
      temporary: true,
      createdAt: new Date().toISOString(),
    })

    expect(result).toBeDefined();
  })

  it('Troca o tipo do arquivo para permanente', async () => {
    const
      uploadsController = new UploadsController(),
      files = await uploadsController.getAll();

    const make = await uploadsController.makePermanent(files[0].fileId);

    expect(make).toBe(true);
  })

  it('Troca o tipo do arquivo para temporario', async () => {
    const
      uploadsController = new UploadsController(),
      files = await uploadsController.getAll();

    const make = await uploadsController.makeTemporary(files[0].fileId);

    expect(make).toBe(true);
  })

  it('Remove um arquivo hospedado', async () => {
    const
      uploadsController = new UploadsController(),
      files = await uploadsController.getAll();

    expect(files[0] && files[0].fileId).toBeTruthy();

    if (files[0]) {
      const result = await uploadsController.remove(files[0].fileId);

      expect(result).toBe(true);
    }
  })
})

afterAll(async () => {
  const mongoDBClient = new MongoDBClient();
  mongoDBClient.shutdown();
});