/* eslint-disable @typescript-eslint/no-explicit-any */
/**
* @description Testes do controller de jobs
* @author GuilhermeSantos001
* @update 02/12/2021
*/

import jobsDB from '@/db/jobs-db';
import mongoDB from '@/controllers/mongodb';

describe("Teste do controller de jobs", () => {
    beforeAll(async () => {
        const
            collectionName = 'jobs',
            collections = await mongoDB.getDB(process.env.DB_NAME || "").listCollections().toArray();

        if (collections.filter(collection => collection.name === collectionName).length > 0) {
            await mongoDB.getDB(process.env.DB_NAME || "").dropCollection(collectionName);
        }
    });

    it('Cria um novo job', async () => {
        for (let i = 0; i < 10; i++) {
            expect(await jobsDB.register({
                cid: `my-job(${i})`,
                name: `My Job Test - ${i}`,
                type: 'mailsend',
                status: 'Available',
                priority: 'High',
                args: {
                    email: 'suporte@grupomave.com.br',
                    username: 'Gu1L0rd',
                    navigator: {
                        browser: 'Google Chrome',
                        os: 'Windows 10',
                        locationIP: 'Brazil/SP',
                        internetAdress: 'localhost',
                    },
                    clientAddress: 'localhost'
                }
            })).toBe(true);
        }
    });

    it('Tentar criar o mesmo job', async () => {
        try {
            expect(await jobsDB.register({
                cid: `my-job(3)`,
                name: `My Job Test - 3`,
                type: 'mailsend',
                status: 'Available',
                priority: 'High',
                args: {
                    email: 'suporte@grupomave.com.br',
                    username: 'Gu1L0rd',
                    navigator: {
                        browser: 'Google Chrome',
                        os: 'Windows 10',
                        locationIP: 'Brazil/SP',
                        internetAdress: 'localhost',
                    },
                    clientAddress: 'localhost'
                }
            })).toBe(true);
        } catch (e: any) {
            expect(e.message).toBe("Não foi possível registrar o serviço My Job Test - 3");
        }
    });

    it('Remove um job', async () => {
        expect(await jobsDB.remove('my-job(0)')).toBe(true);
        expect(await jobsDB.removeByName('My Job Test - 2')).toBe(true);
    });

    it('Atualiza um job', async () => {
        expect(await jobsDB.update('my-job(5)', {
            status: 'Processing'
        })).toBe(true);
    });

    it('Restaura o status dos serviços', async () => {
        expect(await jobsDB.reset()).toBe(true);
    });

    it('Retorna os serviços', async () => {
        expect(await jobsDB.get()).toBeTruthy();
    });

    it('Deleta todos os serviços', async () => {
        expect(await jobsDB.clear()).toBe(true);
    });
});

afterAll(async () => {
    mongoDB.shutdown();
});