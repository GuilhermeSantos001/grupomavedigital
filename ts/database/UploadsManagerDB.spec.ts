/**
* @description Testes da database de uploads
* @author GuilhermeSantos001
* @update 31/01/2022
*/

import { UploadManagerDB } from '@/database/UploadsManagerDB';
import { MongoDBClient } from '@/database/MongoDBClient';

describe("Teste da database de uploads", () => {
  beforeAll(async () => {
    const
      mongoDBClient = new MongoDBClient(),
      collectionNames = [
        'uploads'
      ],
      collections = await mongoDBClient.getDB(process.env.DB_NAME || "").listCollections().toArray();

    if (collections.filter(collection => collectionNames.includes(collection.name)).length > 0) {
      for (const collectionName of collectionNames) {
        await mongoDBClient.getDB(process.env.DB_NAME || "").dropCollection(collectionName);
      }
    }
  });

  it('Registra um upload', async () => {
    const
      uploadsManagerDB = new UploadManagerDB(),
      register = await uploadsManagerDB.register({
        authorId: 'tester',
        fileId: '123456789',
        filename: 'teste',
        filetype: '.txt',
        description: 'testando arquivo...',
        size: 12345,
        compressedSize: 12345,
        version: 1,
        temporary: true
      })

    expect(register).toBe(true);
  })

  it('Remove um upload', async () => {
    const
      uploadsManagerDB = new UploadManagerDB(),
      register = await uploadsManagerDB.register({
        authorId: 'tester',
        fileId: '12345678910',
        filename: 'teste 2',
        filetype: '.txt',
        description: 'testando arquivo...',
        size: 12345,
        compressedSize: 12345,
        version: 1,
        temporary: true
      })

    expect(register).toBe(true);

    const remove = await uploadsManagerDB.remove('12345678910');

    expect(remove).toBe(true);
  })

  it('Torna um upload permanente', async () => {
    const
      uploadsManagerDB = new UploadManagerDB(),
      makePermanent = await uploadsManagerDB.makePermanent('123456789');

    expect(makePermanent).toBe(true);
  })

  it('Torna um upload temporario', async () => {
    const
      uploadsManagerDB = new UploadManagerDB(),
      makeTemporary = await uploadsManagerDB.makeTemporary('123456789', new Date(Date.now() + (1000 * 60 * 5)).toISOString());

    expect(makeTemporary).toBe(true);
  })

  it('Retorna todos os uploads', async () => {
    const
      uploadsManagerDB = new UploadManagerDB(),
      getAll = await uploadsManagerDB.getAll();

    expect(getAll.length).toBe(1);

    expect(getAll[0]).toHaveProperty('authorId');
    expect(getAll[0]).toHaveProperty('fileId');
    expect(getAll[0]).toHaveProperty('filename');
    expect(getAll[0]).toHaveProperty('filetype');
    expect(getAll[0]).toHaveProperty('description');
    expect(getAll[0]).toHaveProperty('size');
    expect(getAll[0]).toHaveProperty('compressedSize');
    expect(getAll[0]).toHaveProperty('temporary');
  })
});

afterAll(async () => {
  const mongoDBClient = new MongoDBClient();
  mongoDBClient.shutdown();
});