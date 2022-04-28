/**
* @description Testes do controller de arquivos
* @author GuilhermeSantos001
* @update 31/01/2022
*/

import fs from 'fs';
import Sugar from 'sugar';

import { FileGridFS } from '@/drivers/FileGridFS';
import { FilesController } from '@/controllers/FilesController';
import { MongoDBClient } from '@/database/MongoDBClient';

import { localPath } from '@/utils/localpath';

describe("Teste do controller de pastas", () => {
    beforeAll(async () => {
        const
            mongoDBClient = new MongoDBClient(),
            collectionName1 = 'fs.files',
            collectionName2 = 'fs.chunks',
            collectionName3 = 'files',
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

    it('Cria um novo arquivo', async () => {
        const
            filesController = new FilesController(),
            fileGridFS = new FileGridFS(),
            streams = [];

        for (let i = 0; i < 2; i++) {
            const
                count = i + 1,
                fileName = `Hello World ${count}.txt`,
                filePath = localPath(`ts/test/database/${fileName}`),
                stream = await fileGridFS.openUploadStream(fs.createReadStream(filePath), {
                    authorId: 'ti-gui',
                    filename: `Hello World ${count}`,
                    filetype: '.txt',
                    size: Sugar.Number.bytes(fs.statSync(filePath).size),
                    status: 'Active',
                    version: count
                });

            expect(stream.compressedSize).toBeDefined();
            expect(stream.fileId).toBeDefined();
            expect(stream.status).toBeDefined();
            expect(stream.version).toBeDefined();

            streams.push(stream);
        }

        for (let i = 0; i < 10; i++) {
            const
                fileName = `Hello World 1.txt`,
                filePath = localPath(`ts/test/database/${fileName}`),
                file = await filesController.newFile({
                    name: `Teste ${i}`,
                    type: '.txt',
                    description: `Testando ${i}`,
                    authorId: 'tester',
                    status: 'Available',
                    size: fs.statSync(filePath).size,
                    version: 2,
                    compressedSize: streams[0].compressedSize,
                    history: [
                        {
                            authorId: 'tester',
                            compressedSize: streams[0].compressedSize,
                            fileId: streams[0].fileId,
                            size: fs.statSync(filePath).size,
                            uploadDate: new Date(),
                            version: 1
                        },
                        {
                            authorId: 'tester',
                            compressedSize: streams[1].compressedSize,
                            fileId: streams[1].fileId,
                            size: fs.statSync(filePath).size,
                            uploadDate: new Date(),
                            version: 2
                        }
                    ],
                    permission: ['Write', 'Read', 'Delete', 'Block', 'Protect', 'Security', 'Share'],
                    tag: '',
                    accessGroupId: [{
                        name: 'administrador',
                        permissions: ['Write', 'Read', 'Delete', 'Block', 'Security', 'Protect', 'Share']
                    }]
                });

            expect(file).toBeDefined();
        }
    });

    it('Adiciona uma nova versão ao arquivo', async () => {
        const
            filesController = new FilesController(),
            files = await filesController.get({ name: 'Teste 1' }, 0, 1);

        expect(files.length).toBe(1);

        const
            file = files[0],
            fileName = 'Hello World 3.txt',
            filePath = localPath(`ts/test/database/${fileName}`),
            stream = fs.createReadStream(filePath);

        const { version, versions } = await filesController.write(
            file.cid || "",
            file.authorId,
            fs.statSync(filePath).size,
            { group: { name: 'administrador', permission: 'Write' } },
            stream
        );

        expect(version).toBeDefined();
        expect(versions).toBeDefined();
    });

    it('Lê a versão adicional do arquivo', async () => {
        const
            filesController = new FilesController(),
            files = await filesController.get({ name: 'Teste 1' }, 0, 1);

        expect(files.length).toBe(1);

        const
            file = files[0],
            stream = fs.createWriteStream(localPath(`ts/test/database/additionalVersion.txt.gz`));

        expect(await filesController.read(file.cid || "", { group: { name: 'administrador', permission: 'Read' } }, 3, stream)).toBeUndefined()
    });

    it('Remove a versão adicional do arquivo', async () => {
        const
            filesController = new FilesController(),
            files = await filesController.get({ name: 'Teste 1' }, 0, 1);

        expect(files.length).toBe(1);

        const
            file = files[0];

        expect(await filesController.remove(file.cid || "", { group: { name: 'administrador', permission: 'Delete' } }, [3])).toBe(true);

        const files2 = await filesController.get({ name: 'Teste 1' }, 0, 1);

        expect(files2.length).toBe(1);

        const file2 = files2[0];

        expect(file2.history && file2.history.length).toBe(2);
    });

    it('Lê uma versão do arquivo', async () => {
        const
            filesController = new FilesController(),
            files = await filesController.get({ name: 'Teste 1' }, 0, 1);

        expect(files.length).toBe(1);

        const
            file = files[0],
            stream = fs.createWriteStream(localPath(`ts/test/database/singleVersion.txt.gz`));


        expect(await filesController.read(file.cid || "", { group: { name: 'administrador', permission: 'Read' } }, 1, stream)).toBeUndefined();
    });

    it('Lê varias versões do arquivo', async () => {
        const
            filesController = new FilesController(),
            files = await filesController.get({ name: 'Teste 1' }, 0, 1);

        expect(files.length).toBe(1);

        const
            file = files[0],
            stream = fs.createWriteStream(localPath(`ts/test/database/multipleVersion.gz`));

        expect(await filesController.readCompile(file.cid || "", { group: { name: 'administrador', permission: 'Read' } }, [1, 2], stream)).toBeUndefined();
    });

    it('Protege o arquivo', async () => {
        const
            filesController = new FilesController(),
            files = await filesController.get({ name: 'Teste 1' }, 0, 1);

        expect(files.length).toBe(1);

        const file = files[0],
            passphrase = '123456';

        expect(await filesController.protect(file.cid || "", { group: { name: 'administrador', permission: 'Protect' } }, passphrase)).toBeDefined();
    });

    it('Tenta lê um arquivo protegido', async () => {
        const
            filesController = new FilesController(),
            files = await filesController.get({ name: 'Teste 1' }, 0, 1);

        expect(files.length).toBe(1);

        try {
            const
                file = files[0],
                stream = fs.createWriteStream(localPath(`ts/test/database/singleVersion.txt.gz`));

            expect(await filesController.read(file.cid || "", { group: { name: 'administrador', permission: 'Read' } }, 1, stream)).toBeUndefined();
        } catch (error) {
            expect(error instanceof Error ? error.message : JSON.stringify(error)).toBe(`Arquivo com cid(${files[0].cid}) está indisponível, o mesmo está protegido ou bloqueado.`);
        }
    });

    it('Tenta atualizar um arquivo protegido', async () => {
        const
            filesController = new FilesController(),
            files = await filesController.get({ name: 'Teste 1' }, 0, 1);

        expect(files.length).toBe(1);

        try {
            const
                file = files[0];

            expect(await filesController.update(file.cid || "", { group: { name: 'administrador', permission: 'Read' } }, {
                name: file.name,
                description: file.description,
                tag: file.tag
            })).toBe(true);
        } catch (error) {
            expect(error instanceof Error ? error.message : JSON.stringify(error)).toBe(`Arquivo com cid(${files[0].cid}) está indisponível, o mesmo está protegido ou bloqueado.`);
        }
    });

    it('Desprotege o arquivo', async () => {
        const
            filesController = new FilesController(),
            files = await filesController.get({ name: 'Teste 2' }, 0, 1);

        expect(files.length).toBe(1);

        const file = files[0],
            passphrase = '123456';

        const key = await filesController.protect(file.cid || "", { group: { name: 'administrador', permission: 'Protect' } }, passphrase);

        expect(key).toBeDefined();

        expect(await filesController.unProtect(file.cid || "", { group: { name: 'administrador', permission: 'Protect' } }, key, passphrase)).toBe(true);
    });

    it('Libera o compartilhamento do arquivo', async () => {
        const
            filesController = new FilesController(),
            files = await filesController.get({ name: 'Teste 2' }, 0, 1);

        expect(files.length).toBe(1);

        const file = files[0],
            title = 'Testando o Compartilhamento';

        const { link, secret } = await filesController.share(file.cid || "", { group: { name: 'administrador', permission: 'Protect' } }, title);

        expect(link).toBeDefined();
        expect(secret).toBeDefined();
    });

    it('Remove o compartilhamento do arquivo', async () => {
        const
            filesController = new FilesController(),
            files = await filesController.get({ name: 'Teste 3' }, 0, 1);

        expect(files.length).toBe(1);

        const file = files[0],
            title = 'Testando o Compartilhamento';

        const { link, secret } = await filesController.share(file.cid || "", { group: { name: 'administrador', permission: 'Protect' } }, title);

        expect(link).toBeDefined();
        expect(secret).toBeDefined();

        expect(await filesController.unShare(file.cid || "", { group: { name: 'administrador', permission: 'Protect' } }, link, secret)).toBe(true);
    });

    it('Bloqueia o arquivo por data', async () => {
        const
            filesController = new FilesController(),
            files = await filesController.get({ name: 'Teste 3' }, 0, 1);

        expect(files.length).toBe(1);

        const file = files[0];

        expect(await filesController.blockedByDate(file.cid || "", { group: { name: 'administrador', permission: 'Block' } }, true, {
            year: 2021,
            month: 11,
            date: 6,
            hour: 13,
            minute: 50
        })).toBe(true);
    });

    it('Testa o bloqueio do arquivo por data', async () => {
        const
            filesController = new FilesController(),
            files = await filesController.get({ name: 'Teste 4' }, 0, 1);

        expect(files.length).toBe(1);

        const file = files[0],
            now = new Date();

        expect(await filesController.blockedByDate(file.cid || "", { group: { name: 'administrador', permission: 'Block' } }, true, {
            year: 2021,
            month: 11,
            date: 6,
            hour: now.getHours(),
            minute: now.getMinutes()
        })).toBe(true);

        expect(await filesController.verifyBlocked(file.cid || "", { group: { name: 'administrador', permission: 'Block' } })).toBeDefined();

        expect(await filesController.unBlocked(file.cid || "", { group: { name: 'administrador', permission: 'Block' } })).toBe(true);
    });

    it('Testa o bloqueio do arquivo por mês', async () => {
        const
            filesController = new FilesController(),
            files = await filesController.get({ name: 'Teste 4' }, 0, 1);

        expect(files.length).toBe(1);

        const file = files[0];

        expect(await filesController.blockedByMonth(file.cid || "", { group: { name: 'administrador', permission: 'Block' } }, true, 11)).toBe(true);

        expect(await filesController.verifyBlocked(file.cid || "", { group: { name: 'administrador', permission: 'Block' } })).toBeDefined();

        expect(await filesController.unBlocked(file.cid || "", { group: { name: 'administrador', permission: 'Block' } })).toBe(true);
    });

    it('Testa o bloqueio do arquivo por dia do mês.', async () => {
        const
            filesController = new FilesController(),
            files = await filesController.get({ name: 'Teste 4' }, 0, 1);

        expect(files.length).toBe(1);

        const file = files[0];

        expect(await filesController.blockedByDayMonth(file.cid || "", { group: { name: 'administrador', permission: 'Block' } }, true, 6)).toBe(true);

        expect(await filesController.verifyBlocked(file.cid || "", { group: { name: 'administrador', permission: 'Block' } })).toBeDefined();

        expect(await filesController.unBlocked(file.cid || "", { group: { name: 'administrador', permission: 'Block' } })).toBe(true);
    });

    it('Testa o bloqueio do arquivo por dia da semana.', async () => {
        const
            filesController = new FilesController(),
            files = await filesController.get({ name: 'Teste 4' }, 0, 1);

        expect(files.length).toBe(1);

        const file = files[0];

        expect(await filesController.blockedByDayWeek(file.cid || "", { group: { name: 'administrador', permission: 'Block' } }, true, 6)).toBe(true);

        expect(await filesController.verifyBlocked(file.cid || "", { group: { name: 'administrador', permission: 'Block' } })).toBeDefined();

        expect(await filesController.unBlocked(file.cid || "", { group: { name: 'administrador', permission: 'Block' } })).toBe(true);
    });

    it('Testa o bloqueio do arquivo por hora.', async () => {
        const
            filesController = new FilesController(),
            files = await filesController.get({ name: 'Teste 4' }, 0, 1);

        expect(files.length).toBe(1);

        const file = files[0],
            now = new Date();

        now.setHours(now.getHours() + 2);

        expect(await filesController.blockedByHour(file.cid || "", { group: { name: 'administrador', permission: 'Block' } }, true, 2)).toBe(true);

        expect(await filesController.verifyBlocked(file.cid || "", { group: { name: 'administrador', permission: 'Block' } })).toBeDefined();

        expect(await filesController.unBlocked(file.cid || "", { group: { name: 'administrador', permission: 'Block' } })).toBe(true);
    });

    it('Testa o bloqueio do arquivo por minuto.', async () => {
        const
            filesController = new FilesController(),
            files = await filesController.get({ name: 'Teste 4' }, 0, 1);

        expect(files.length).toBe(1);

        const file = files[0],
            now = new Date();

        now.setMinutes(now.getMinutes() + 2);

        expect(await filesController.blockedByMinute(file.cid || "", { group: { name: 'administrador', permission: 'Block' } }, true, 2)).toBe(true);

        expect(await filesController.verifyBlocked(file.cid || "", { group: { name: 'administrador', permission: 'Block' } })).toBeDefined();

        expect(await filesController.unBlocked(file.cid || "", { group: { name: 'administrador', permission: 'Block' } })).toBe(true);
    });

    it('Coloca o arquivo na lixeira.', async () => {
        const
            filesController = new FilesController(),
            files = await filesController.get({ name: 'Teste 4' }, 0, 1);

        expect(files.length).toBe(1);

        const file = files[0];

        expect(await filesController.moveToGarbage(file.cid || "", { group: { name: 'administrador', permission: 'Delete' } })).toBe(true);
    });

    it('Tenta atualizar um arquivo na lixeira.', async () => {
        const
            filesController = new FilesController(),
            files = await filesController.get({ name: 'Teste 4' }, 0, 1);

        expect(files.length).toBe(1);

        try {
            const
                file = files[0];

            expect(await filesController.update(file.cid || "", { group: { name: 'administrador', permission: 'Read' } }, {
                name: file.name,
                description: file.description,
                tag: file.tag
            })).toBe(true);
        } catch (error) {
            expect(error instanceof Error ? error.message : JSON.stringify(error)).toBe(`Arquivo com cid(${files[0].cid}) está na lixeira.`);
        }
    });

    it('Processa os itens da lixeira', async () => {
        const filesController = new FilesController();

        expect(await filesController.recycleGarbage()).toBeDefined();
    });

    it('Remove o arquivo da lixeira', async () => {
        const
            filesController = new FilesController(),
            files = await filesController.get({ name: 'Teste 4' }, 0, 1);

        expect(files.length).toBe(1);

        const file = files[0];

        expect(await filesController.removeOfGarbage(file.cid || "", { group: { name: 'administrador', permission: 'Delete' } })).toBe(true);
    });

    it('Adiciona um procurador ao arquivo', async () => {
        const
            filesController = new FilesController(),
            files = await filesController.get({ name: 'Teste 4' }, 0, 1);

        expect(files.length).toBe(1);

        const file = files[0];

        expect(await filesController.insertAssignee(file.cid || "", { group: { name: 'administrador', permission: 'Read' } }, {
            email: 'suporte@grupomave.com.br',
            name: 'Luiz Guilherme dos Santos'
        })).toBe(true);
    });

    it('Gera um pedido aos procuradores para mover o arquivo para a lixeira', async () => {
        const
            filesController = new FilesController(),
            files = await filesController.get({ name: 'Teste 4' }, 0, 1);

        expect(files.length).toBe(1);

        const file = files[0];

        expect(await filesController.orderMoveToGarbage(file.cid || "", { group: { name: 'administrador', permission: 'Security' } }, {
            title: 'Solicitação para mover o arquivo para a lixeira',
            description: 'Solicitação para mover o arquivo para a lixeira',
            assignee: { email: 'tester@grupomave.com.br', name: 'Testador' }
        })).toBe(true);
    });

    it('Responde o pedido enviado ao procurador', async () => {
        const
            filesController = new FilesController(),
            files = await filesController.get({ name: 'Teste 4' }, 0, 1);

        expect(files.length).toBe(1);

        const file = files[0];

        expect(await filesController.orderAssigneeSetDecision(file.cid || "", { group: { name: 'administrador', permission: 'Security' } }, {
            assignee: {
                email: 'suporte@grupomave.com.br',
                name: 'Luiz Guilherme dos Santos'
            },
            decision: 'Approved'
        })).toBe(true);
    });

    it('Tenta responder o pedido enviado ao procurador com um e-mail não associado a um procurador', async () => {
        const
            filesController = new FilesController(),
            files = await filesController.get({ name: 'Teste 4' }, 0, 1);

        expect(files.length).toBe(1);

        try {
            const
                file = files[0];

            expect(await filesController.orderAssigneeSetDecision(file.cid || "", { group: { name: 'administrador', permission: 'Security' } }, {
                assignee: {
                    email: 'ti@grupomave.com.br',
                    name: 'Jefferson Juliano'
                },
                decision: 'Rejected'
            })).toBe(true);
        } catch (error) {
            expect(error instanceof Error ? error.message : JSON.stringify(error)).toBe(`O procurador(ti@grupomave.com.br) não está associado com o arquivo com cid(${files[0].cid}).`);
        }
    });

    it('Processa o pedido enviado aos procuradores', async () => {
        const
            filesController = new FilesController(),
            files = await filesController.get({ name: 'Teste 4' }, 0, 1);

        expect(files.length).toBe(1);

        const file = files[0];

        expect(await filesController.orderProcess(file.cid || "", { group: { name: 'administrador', permission: 'Security' } })).toBe(true);
    });

    it('Deleta um arquivo', async () => {
        const
            filesController = new FilesController(),
            files = await filesController.get({ name: 'Teste 2' }, 0, 1);

        expect(files.length).toBe(1);

        const file = files[0];

        expect(await filesController.delete(file.cid || '', { group: { name: 'administrador', permission: 'Delete' } }, { group: { name: 'administrador', permission: 'Delete' } })).toBe(true);
    });
});

afterAll(async () => {
    const mongoDBClient = new MongoDBClient();
    mongoDBClient.shutdown();
});