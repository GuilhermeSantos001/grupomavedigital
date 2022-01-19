import { createReadStream, createWriteStream, statSync } from 'fs';
import { localPath } from '@/utils/localpath';
import Sugar from 'sugar';

import FileGridFS from '@/drivers/file-gridfs';
import Upload from '@/controllers/upload';
import mongoDB from '@/controllers/mongodb';

describe('Gerenciador de Uploads', () => {
  beforeAll(async () => {
    const
      collectionName1 = 'fs.files',
      collectionName2 = 'fs.chunks',
      collectionName3 = 'uploads',
      collections1 = await mongoDB.getDB(process.env.DB_HERCULES_STORAGE || "").listCollections().toArray(),
      collections2 = await mongoDB.getDB(process.env.DB_NAME || "").listCollections().toArray();

    if (collections1.filter(collection => collection.name === collectionName1).length > 0) {
      await mongoDB.getDB(process.env.DB_HERCULES_STORAGE || "").dropCollection(collectionName1);
    }

    if (collections1.filter(collection => collection.name === collectionName2).length > 0) {
      await mongoDB.getDB(process.env.DB_HERCULES_STORAGE || "").dropCollection(collectionName2);
    }

    if (collections2.filter(collection => collection.name === collectionName3).length > 0) {
      await mongoDB.getDB(process.env.DB_NAME || "").dropCollection(collectionName3);
    }
  });

  it('Hospeda um arquivo', async () => {
    const
      filePath = `ts/test/database/Hello World 1.txt`,
      stream = await FileGridFS.openUploadStream(
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

    const result = await Upload.register({
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

  it('Verifica se está definido o tempo até que o arquivo temporario seja expirado', async () => {
    const file = Upload.files.find(file => file.temporary);

    expect(Upload.getTimeToExpire()).toBeDefined();

    expect(file && file.expiredAt).toBeTruthy();
  })


  it('Troca o tipo do arquivo para permanente', async () => {
    const file = Upload.files[Upload.files.length - 1];

    const make = await Upload.makePermanent(file.fileId);

    expect(make).toBe(true);
  })

  it('Troca o tipo do arquivo para temporario', async () => {
    const file = Upload.files[Upload.files.length - 1];

    const make = await Upload.makeTemporary(file.fileId);

    expect(make).toBe(true);
  })

  it('Remove um arquivo hospedado', async () => {
    const file = Upload.files[Upload.files.length - 1];

    expect(file && file.fileId).toBeTruthy();

    if (file) {
      const result = await Upload.remove(file.fileId);

      expect(result).toBe(true);
    }
  })
})

afterAll(async () => {
  mongoDB.shutdown();
});