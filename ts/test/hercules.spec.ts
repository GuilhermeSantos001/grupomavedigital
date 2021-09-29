/**
* @description Testes do Hercules Storage
* @author GuilhermeSantos001
* @update 09/08/2021
*/

import { createReadStream, createWriteStream } from "fs-extra";

import { localPath } from "@/utils/localpath";

import FileController from "@/controllers/files";
import FolderController from "@/controllers/folders";
import mongoDB from '@/controllers/mongodb';
import Jobs from "@/core/jobs";

describe("Hercules Storage", () => {
    it("Criação de Arquivo", async () => {
        const file = await FileController.newFile({
            authorId: 'ti-gui',
            permission: ['Write', 'Read', 'Delete', 'Protect', 'Share', 'Security', 'Block'],
            name: `Test File ${Math.floor(Math.random() * 9e9)}`,
            description: `Testando o hercules storage`,
            type: '.xlsx',
            tag: 'Segurança',
            status: 'Available'
        });

        const cid = file.cid || "";

        expect(typeof cid).toBe("string");
        expect(await FileController.get({ cid }, 0, 1)).toHaveLength(1);
    });

    it("Atualização das informações do Arquivo", async () => {
        const file = await FileController.newFile({
            authorId: 'ti-gui',
            permission: ['Write', 'Read', 'Delete', 'Protect', 'Share', 'Security', 'Block'],
            name: `Test File ${Math.floor(Math.random() * 9e9)}`,
            description: `Testando o hercules storage`,
            type: '.xlsx',
            tag: 'Segurança',
            status: 'Available'
        });

        const cid = file.cid || "";

        expect(typeof cid).toBe("string");
        expect(await FileController.get({ cid }, 0, 1)).toHaveLength(1);

        const updated = await FileController.update(cid, { group: { name: "administrador", permission: "Write" } }, {
            name: "Arquivo Renomeado",
            description: "Testando a renomeação do arquivo",
            tag: "Developers"
        });

        const updateFile = await FileController.get({ cid }, 0, 1);

        expect(updateFile[0].name).toBe("Arquivo Renomeado");
        expect(updateFile[0].description).toBe("Testando a renomeação do arquivo");
        expect(updateFile[0].tag).toBe("Developers");

        expect(updated).toBe(true);
    });

    it("Remoção do Arquivo", async () => {
        const file = await FileController.newFile({
            authorId: 'ti-gui',
            permission: ['Write', 'Read', 'Delete', 'Share', 'Protect', 'Security', 'Block'],
            name: `Test File ${Math.floor(Math.random() * 9e9)}`,
            description: `Testando o hercules storage`,
            type: '.xlsx',
            tag: 'Segurança',
            status: 'Available'
        });

        const cid = file.cid || "";

        expect(typeof cid).toBe("string");

        const remove = await FileController.delete(cid, { group: { name: "administrador", permission: "Delete" } }, { group: { name: "administrador", permission: "Delete" } });

        expect(remove).toBe(true);
        expect(await FileController.get({ cid }, 0, 1)).toHaveLength(0);
    });

    it("Escrita de dados no arquivo", async () => {
        const file = await FileController.newFile({
            authorId: 'ti-gui',
            permission: ['Write', 'Read', 'Delete', 'Share', 'Protect', 'Security', 'Block'],
            name: `Test File ${Math.floor(Math.random() * 9e9)}`,
            description: `Testando o hercules storage`,
            type: '.xlsx',
            tag: 'Segurança',
            status: 'Available'
        });

        const cid = file.cid || "";

        expect(typeof cid).toBe("string");

        const streams = [
            createReadStream(localPath('ts/test/data/relatorio_de_gastos.xlsx')),
            createReadStream(localPath('ts/test/data/hello_world.txt'))
        ];

        const write1 = await FileController.write(cid, { group: { name: 'administrador', permission: "Write" } }, streams[0]);
        const write2 = await FileController.write(cid, { group: { name: 'administrador', permission: "Write" } }, streams[1]);

        expect(write1.versions).toBe(1);
        expect(write1.version).toBe(1);

        expect(write2.versions).toBe(2);
        expect(write2.version).toBe(2);
    });

    it("Leitura de dados do arquivo", async () => {
        const file = await FileController.newFile({
            authorId: 'ti-gui',
            permission: ['Write', 'Read', 'Delete', 'Share', 'Protect', 'Security', 'Block'],
            name: `Test File ${Math.floor(Math.random() * 9e9)}`,
            description: `Testando o hercules storage`,
            type: '.xlsx',
            tag: 'Segurança',
            status: 'Available'
        });

        const cid = file.cid || "";

        expect(typeof cid).toBe("string");

        const streams = [
            createReadStream(localPath('ts/test/data/relatorio_de_gastos.xlsx')),
            createReadStream(localPath('ts/test/data/hello_world.txt'))
        ];

        const write1 = await FileController.write(cid, { group: { name: 'administrador', permission: "Write" } }, streams[0]);
        const write2 = await FileController.write(cid, { group: { name: 'administrador', permission: "Write" } }, streams[1]);

        expect(write1.versions).toBe(1);
        expect(write1.version).toBe(1);

        expect(write2.versions).toBe(2);
        expect(write2.version).toBe(2);

        const streams2 = [
            createWriteStream(localPath(`ts/test/data/teste_file_1_v1.xlsx.gz`)),
            createWriteStream(localPath(`ts/test/data/teste_file_2_v2.txt.gz`)),
        ];

        const read1 = await FileController.read(cid, { group: { name: 'administrador', permission: "Read" } }, 1, streams2[0]);
        const read2 = await FileController.read(cid, { group: { name: 'administrador', permission: "Read" } }, 2, streams2[1]);

        expect(typeof read1 === 'string').toBe(true);
        expect(typeof read2 === 'string').toBe(true);
    });

    it("Leitura compilada de dados do arquivo", async () => {
        const file = await FileController.newFile({
            authorId: 'ti-gui',
            permission: ['Write', 'Read', 'Delete', 'Share', 'Protect', 'Security', 'Block'],
            name: `Test File ${Math.floor(Math.random() * 9e9)}`,
            description: `Testando o hercules storage`,
            type: '.xlsx',
            tag: 'Segurança',
            status: 'Available'
        });

        const cid = file.cid || "";

        expect(typeof cid).toBe("string");

        const streams = [
            createReadStream(localPath('ts/test/data/relatorio_de_gastos.xlsx')),
            createReadStream(localPath('ts/test/data/hello_world.txt'))
        ];

        const write1 = await FileController.write(cid, { group: { name: 'administrador', permission: "Write" } }, streams[0]);
        const write2 = await FileController.write(cid, { group: { name: 'administrador', permission: "Write" } }, streams[1]);

        expect(write1.versions).toBe(1);
        expect(write1.version).toBe(1);

        expect(write2.versions).toBe(2);
        expect(write2.version).toBe(2);

        const stream = createWriteStream(localPath(`ts/test/data/teste_file_compile.gz`));

        const readCompile = await FileController.readCompile(cid, { group: { name: 'administrador', permission: "Read" } }, [1, 2], stream);

        expect(readCompile).toBe(true);
    });

    it("Remoção do histórico de versão do arquivo", async () => {
        const file = await FileController.newFile({
            authorId: 'ti-gui',
            permission: ['Write', 'Read', 'Delete', 'Share', 'Protect', 'Security', 'Block'],
            name: `Test File ${Math.floor(Math.random() * 9e9)}`,
            description: `Testando o hercules storage`,
            type: '.xlsx',
            tag: 'Segurança',
            status: 'Available'
        });

        const cid = file.cid || "";

        expect(typeof cid).toBe("string");

        const streams = [
            createReadStream(localPath('ts/test/data/relatorio_de_gastos.xlsx')),
            createReadStream(localPath('ts/test/data/hello_world.txt'))
        ];

        const write1 = await FileController.write(cid, { group: { name: 'administrador', permission: "Write" } }, streams[0]);
        const write2 = await FileController.write(cid, { group: { name: 'administrador', permission: "Write" } }, streams[1]);

        expect(write1.versions).toBe(1);
        expect(write1.version).toBe(1);

        expect(write2.versions).toBe(2);
        expect(write2.version).toBe(2);

        const version = undefined; // undefined = Remove todas as versões.

        const remove = await FileController.remove(cid, { group: { name: 'administrador', permission: "Delete" } }, version);

        expect(remove).toBe(true);
    });

    it("Renomear arquivo", async () => {
        const file = await FileController.newFile({
            authorId: 'ti-gui',
            permission: ['Write', 'Read', 'Delete', 'Share', 'Protect', 'Security', 'Block'],
            name: `Test File ${Math.floor(Math.random() * 9e9)}`,
            description: `Testando o hercules storage`,
            type: '.xlsx',
            tag: 'Segurança',
            status: 'Available'
        });

        const cid = file.cid || "";

        expect(typeof cid).toBe("string");

        const rename = await FileController.rename(cid, { group: { name: 'administrador', permission: "Write" } }, 'Gastos 2021');

        expect(rename).toBe(true);

        const find = await FileController.get({ cid }, 0, 1);

        expect(find).toHaveLength(1);
        expect(find[0].name).toMatch('Gastos 2021');
    });

    it('Proteger arquivo', async () => {
        const file = await FileController.newFile({
            authorId: 'ti-gui',
            permission: ['Write', 'Read', 'Delete', 'Share', 'Protect', 'Security', 'Block'],
            name: `Test File ${Math.floor(Math.random() * 9e9)}`,
            description: `Testando o hercules storage`,
            type: '.xlsx',
            tag: 'Segurança',
            status: 'Available'
        });

        const cid = file.cid || "";

        expect(typeof cid).toBe("string");

        const passphrase = 'Texto Secreto 123';

        const key = await FileController.protect(cid, { group: { name: 'administrador', permission: "Protect" } }, passphrase);

        expect(typeof key).toBe("string");
    });

    it('Desproteger arquivo', async () => {
        const file = await FileController.newFile({
            authorId: 'ti-gui',
            permission: ['Write', 'Read', 'Delete', 'Share', 'Protect', 'Security', 'Block'],
            name: `Test File ${Math.floor(Math.random() * 9e9)}`,
            description: `Testando o hercules storage`,
            type: '.xlsx',
            tag: 'Segurança',
            status: 'Available'
        });

        const cid = file.cid || "";

        expect(typeof cid).toBe("string");

        const passphrase = 'Texto Secreto 123';

        const key = await FileController.protect(cid, { group: { name: 'administrador', permission: "Protect" } }, passphrase);

        expect(typeof key).toBe("string");

        const available = await FileController.unProtect(cid, { group: { name: 'administrador', permission: "Protect" } }, key, passphrase);

        expect(available).toBe(true);
    });

    it('Ativação do compartilhamento do arquivo', async () => {
        const file = await FileController.newFile({
            authorId: 'ti-gui',
            permission: ['Write', 'Read', 'Delete', 'Share', 'Protect', 'Security', 'Block'],
            name: `Test File ${Math.floor(Math.random() * 9e9)}`,
            description: `Testando o hercules storage`,
            type: '.xlsx',
            tag: 'Segurança',
            status: 'Available'
        });

        const cid = file.cid || "";

        expect(typeof cid).toBe("string");

        const title = "Teste de Compartilhamento";

        const { link, secret } = await FileController.share(cid, { group: { name: 'administrador', permission: "Share" } }, title);

        expect(typeof link).toBe("string");
        expect(typeof secret).toBe("string");
    });

    it('Remoção do compartilhamento do arquivo', async () => {
        const file = await FileController.newFile({
            authorId: 'ti-gui',
            permission: ['Write', 'Read', 'Delete', 'Share', 'Protect', 'Security', 'Block'],
            name: `Test File ${Math.floor(Math.random() * 9e9)}`,
            description: `Testando o hercules storage`,
            type: '.xlsx',
            tag: 'Segurança',
            status: 'Available'
        });

        const cid = file.cid || "";

        expect(typeof cid).toBe("string");

        const title = "Teste de Compartilhamento";

        const { link, secret } = await FileController.share(cid, { group: { name: 'administrador', permission: "Share" } }, title);

        expect(typeof link).toBe("string");
        expect(typeof secret).toBe("string");

        const unShare = await FileController.unShare(cid, { group: { name: 'administrador', permission: "Share" } }, link, secret);

        expect(unShare).toBe(true);
    });

    it("Inserção do grupo na whitelist do arquivo", async () => {
        const file = await FileController.newFile({
            authorId: 'ti-gui',
            permission: ['Write', 'Read', 'Delete', 'Share', 'Protect', 'Security', 'Block'],
            name: `Test File ${Math.floor(Math.random() * 9e9)}`,
            description: `Testando o hercules storage`,
            type: '.xlsx',
            tag: 'Segurança',
            status: 'Available'
        });

        const cid = file.cid || "";

        expect(typeof cid).toBe("string");

        const added = await FileController.insertGroupId(cid, { group: { name: 'administrador', permission: "Security" } }, { name: "common", permissions: ["Write", "Read", "Delete"] });

        expect(added).toBe(true);

        const find = await FileController.get({ cid }, 0, 1);

        expect(find).toHaveLength(1);

        expect(find[0].accessGroupId?.map(groupId => groupId.name)).toContain("common");
    });

    it("Remoção do grupo na whitelist do arquivo", async () => {
        const file = await FileController.newFile({
            authorId: 'ti-gui',
            permission: ['Write', 'Read', 'Delete', 'Share', 'Protect', 'Security', 'Block'],
            name: `Test File ${Math.floor(Math.random() * 9e9)}`,
            description: `Testando o hercules storage`,
            type: '.xlsx',
            tag: 'Segurança',
            status: 'Available'
        });

        const cid = file.cid || "";

        expect(typeof cid).toBe("string");

        const added = await FileController.insertGroupId(cid, { group: { name: 'administrador', permission: "Security" } }, { name: "common", permissions: ["Write", "Read", "Delete"] });

        expect(added).toBe(true);

        const find_1 = await FileController.get({ cid }, 0, 1);

        expect(find_1).toHaveLength(1);

        expect(find_1[0].accessGroupId?.map(groupId => groupId.name)).toContain("common");

        const removed = await FileController.removeGroupId(cid, { group: { name: 'administrador', permission: "Security" } }, { name: "common" });

        expect(removed).toBe(true);

        const find_2 = await FileController.get({ cid }, 0, 1);

        expect(find_2).toHaveLength(1);

        expect(find_2[0].accessGroupId?.map(groupId => groupId.name)).not.toContain("common");
    });

    it("Inserção do usuário na whitelist do arquivo", async () => {
        const file = await FileController.newFile({
            authorId: 'ti-gui',
            permission: ['Write', 'Read', 'Delete', 'Share', 'Protect', 'Security', 'Block'],
            name: `Test File ${Math.floor(Math.random() * 9e9)}`,
            description: `Testando o hercules storage`,
            type: '.xlsx',
            tag: 'Segurança',
            status: 'Available'
        });

        const cid = file.cid || "";

        expect(typeof cid).toBe("string");

        const added = await FileController.insertUserId(cid, { group: { name: 'administrador', permission: "Security" } }, { email: "suporte@grupomave.com.br", permissions: ["Write", "Read", "Delete"] });

        expect(added).toBe(true);

        const find = await FileController.get({ cid }, 0, 1);

        expect(find).toHaveLength(1);

        expect(find[0].accessUsersId?.map(userId => userId.email)).toContain("suporte@grupomave.com.br");
    });

    it("Remoção do usuário da whitelist do arquivo", async () => {
        const file = await FileController.newFile({
            authorId: 'ti-gui',
            permission: ['Write', 'Read', 'Delete', 'Share', 'Protect', 'Security', 'Block'],
            name: `Test File ${Math.floor(Math.random() * 9e9)}`,
            description: `Testando o hercules storage`,
            type: '.xlsx',
            tag: 'Segurança',
            status: 'Available'
        });

        const cid = file.cid || "";

        expect(typeof cid).toBe("string");

        const added = await FileController.insertUserId(cid, { group: { name: 'administrador', permission: "Security" } }, { email: "suporte@grupomave.com.br", permissions: ["Write", "Read", "Delete"] });

        expect(added).toBe(true);

        const find_1 = await FileController.get({ cid }, 0, 1);

        expect(find_1).toHaveLength(1);

        expect(find_1[0].accessUsersId?.map(userId => userId.email)).toContain("suporte@grupomave.com.br");

        const removed = await FileController.removeUserId(cid, { group: { name: 'administrador', permission: "Security" } }, { email: "suporte@grupomave.com.br" });

        expect(removed).toBe(true);

        const find_2 = await FileController.get({ cid }, 0, 1);

        expect(find_2).toHaveLength(1);

        expect(find_2[0].accessUsersId?.map(userId => userId.email)).not.toContain("suporte@grupomave.com.br");
    });

    it("Inserção do procurador ao arquivo", async () => {
        const file = await FileController.newFile({
            authorId: 'ti-gui',
            permission: ['Write', 'Read', 'Delete', 'Share', 'Protect', 'Security', 'Block'],
            name: `Test File ${Math.floor(Math.random() * 9e9)}`,
            description: `Testando o hercules storage`,
            type: '.xlsx',
            tag: 'Segurança',
            status: 'Available'
        });

        const cid = file.cid || "";

        expect(typeof cid).toBe("string");

        const added = await FileController.insertAssignee(cid, { group: { name: 'administrador', permission: "Security" } }, { email: 'ti@grupomave.com.br', name: 'Jefferson Oliveira' });

        expect(added).toBe(true);

        const find = await FileController.get({ cid }, 0, 1);

        expect(find).toHaveLength(1);

        expect(find[0].assignees?.map(assignee => assignee.email)).toContain("ti@grupomave.com.br");
    });

    it("Remoção do procurador do arquivo", async () => {
        const file = await FileController.newFile({
            authorId: 'ti-gui',
            permission: ['Write', 'Read', 'Delete', 'Share', 'Protect', 'Security', 'Block'],
            name: `Test File ${Math.floor(Math.random() * 9e9)}`,
            description: `Testando o hercules storage`,
            type: '.xlsx',
            tag: 'Segurança',
            status: 'Available'
        });

        const cid = file.cid || "";

        expect(typeof cid).toBe("string");

        const added = await FileController.insertAssignee(cid, { group: { name: 'administrador', permission: "Security" } }, { email: 'ti@grupomave.com.br', name: 'Jefferson Oliveira' });

        expect(added).toBe(true);

        const find_1 = await FileController.get({ cid }, 0, 1);

        expect(find_1).toHaveLength(1);

        expect(find_1[0].assignees?.map(assignee => assignee.email)).toContain("ti@grupomave.com.br");

        const removed = await FileController.removeAssignee(cid, { group: { name: 'administrador', permission: "Security" } }, { email: "ti@grupomave.com.br" });

        expect(removed).toBe(true);

        const find_2 = await FileController.get({ cid }, 0, 1);

        expect(find_2).toHaveLength(1);

        expect(find_2[0].assignees?.map(assignee => assignee.email)).not.toContain("ti@grupomave.com.br");
    });

    it("Ativação do bloqueio do arquivo por data", async () => {
        const file = await FileController.newFile({
            authorId: 'ti-gui',
            permission: ['Write', 'Read', 'Delete', 'Share', 'Protect', 'Security', 'Block'],
            name: `Test File ${Math.floor(Math.random() * 9e9)}`,
            description: `Testando o hercules storage`,
            type: '.xlsx',
            tag: 'Segurança',
            status: 'Available'
        });

        const cid = file.cid || "";

        expect(typeof cid).toBe("string");

        const now = new Date();

        const blocked = await FileController.blockedByDate(cid, { group: { name: 'administrador', permission: "Block" } }, true, {
            year: now.getFullYear(),
            month: now.getMonth() < 11 ? now.getMonth() + 1 : now.getMonth(),
            date: now.getDate() + 1,
            hour: now.getHours(),
            minute: now.getMinutes()
        });

        expect(blocked).toBe(true);

        const verify = await FileController.verifyBlocked(cid, { group: { name: 'administrador', permission: "Block" } });

        expect(typeof verify.message).toBe("string");

        console.log(verify.message);

        expect(verify.block).toBe(true);
    });

    it("Ativação do bloqueio do arquivo por mês", async () => {
        const file = await FileController.newFile({
            authorId: 'ti-gui',
            permission: ['Write', 'Read', 'Delete', 'Share', 'Protect', 'Security', 'Block'],
            name: `Test File ${Math.floor(Math.random() * 9e9)}`,
            description: `Testando o hercules storage`,
            type: '.xlsx',
            tag: 'Segurança',
            status: 'Available'
        });

        const cid = file.cid || "";

        expect(typeof cid).toBe("string");

        const now = new Date();

        const blocked = await FileController.blockedByMonth(cid, { group: { name: 'administrador', permission: "Block" } }, true, now.getMonth());

        expect(blocked).toBe(true);

        const verify = await FileController.verifyBlocked(cid, { group: { name: 'administrador', permission: "Block" } });

        expect(typeof verify.message).toBe("string");

        console.log(verify.message);

        expect(verify.block).toBe(true);
    });

    it("Ativação do bloqueio do arquivo por dia do mês", async () => {
        const file = await FileController.newFile({
            authorId: 'ti-gui',
            permission: ['Write', 'Read', 'Delete', 'Share', 'Protect', 'Security', 'Block'],
            name: `Test File ${Math.floor(Math.random() * 9e9)}`,
            description: `Testando o hercules storage`,
            type: '.xlsx',
            tag: 'Segurança',
            status: 'Available'
        });

        const cid = file.cid || "";

        expect(typeof cid).toBe("string");

        const now = new Date();

        const blocked = await FileController.blockedByDayMonth(cid, { group: { name: 'administrador', permission: "Block" } }, true, now.getDate());

        expect(blocked).toBe(true);

        const verify = await FileController.verifyBlocked(cid, { group: { name: 'administrador', permission: "Block" } });

        expect(typeof verify.message).toBe("string");

        console.log(verify.message);

        expect(verify.block).toBe(true);
    });

    it("Ativação do bloqueio do arquivo por dia da semana", async () => {
        const file = await FileController.newFile({
            authorId: 'ti-gui',
            permission: ['Write', 'Read', 'Delete', 'Share', 'Protect', 'Security', 'Block'],
            name: `Test File ${Math.floor(Math.random() * 9e9)}`,
            description: `Testando o hercules storage`,
            type: '.xlsx',
            tag: 'Segurança',
            status: 'Available'
        });

        const cid = file.cid || "";

        expect(typeof cid).toBe("string");

        const now = new Date();

        const blocked = await FileController.blockedByDayWeek(cid, { group: { name: 'administrador', permission: "Block" } }, true, now.getDate());

        expect(blocked).toBe(true);

        const verify = await FileController.verifyBlocked(cid, { group: { name: 'administrador', permission: "Block" } });

        expect(typeof verify.message).toBe("string");

        console.log(verify.message);

        expect(verify.block).toBe(true);
    });

    it("Ativação do bloqueio do arquivo por hora", async () => {
        const file = await FileController.newFile({
            authorId: 'ti-gui',
            permission: ['Write', 'Read', 'Delete', 'Share', 'Protect', 'Security', 'Block'],
            name: `Test File ${Math.floor(Math.random() * 9e9)}`,
            description: `Testando o hercules storage`,
            type: '.xlsx',
            tag: 'Segurança',
            status: 'Available'
        });

        const cid = file.cid || "";

        expect(typeof cid).toBe("string");

        const blocked = await FileController.blockedByHour(cid, { group: { name: 'administrador', permission: "Block" } }, true, 2);

        expect(blocked).toBe(true);

        const verify = await FileController.verifyBlocked(cid, { group: { name: 'administrador', permission: "Block" } });

        expect(typeof verify.message).toBe("string");

        console.log(verify.message);

        expect(verify.block).toBe(true);
    });

    it("Ativação do bloqueio do arquivo por minuto", async () => {
        const file = await FileController.newFile({
            authorId: 'ti-gui',
            permission: ['Write', 'Read', 'Delete', 'Share', 'Protect', 'Security', 'Block'],
            name: `Test File ${Math.floor(Math.random() * 9e9)}`,
            description: `Testando o hercules storage`,
            type: '.xlsx',
            tag: 'Segurança',
            status: 'Available'
        });

        const cid = file.cid || "";

        expect(typeof cid).toBe("string");

        const blocked = await FileController.blockedByMinute(cid, { group: { name: 'administrador', permission: "Block" } }, true, 2);

        expect(blocked).toBe(true);

        const verify = await FileController.verifyBlocked(cid, { group: { name: 'administrador', permission: "Block" } });

        expect(typeof verify.message).toBe("string");

        console.log(verify.message);

        expect(verify.block).toBe(true);
    });

    it("Verificação do bloqueio do arquivo por data", async () => {
        const file = await FileController.newFile({
            authorId: 'ti-gui',
            permission: ['Write', 'Read', 'Delete', 'Share', 'Protect', 'Security', 'Block'],
            name: `Test File ${Math.floor(Math.random() * 9e9)}`,
            description: `Testando o hercules storage`,
            type: '.xlsx',
            tag: 'Segurança',
            status: 'Available'
        });

        const cid = file.cid || "";

        expect(typeof cid).toBe("string");

        const now = new Date();

        const blocked = await FileController.blockedByDate(cid, { group: { name: 'administrador', permission: "Block" } }, true, {
            year: now.getFullYear() - 1,
            month: now.getMonth(),
            date: now.getDate(),
            hour: now.getHours(),
            minute: now.getMinutes()
        });

        expect(blocked).toBe(true);

        const verify = await FileController.verifyBlocked(cid, { group: { name: 'administrador', permission: "Block" } });

        expect(typeof verify.message).toBe("string");

        console.log(verify.message);

        expect(verify.block).toBe(false);
    });

    it("Verificação do bloqueio do arquivo por mês", async () => {
        const file = await FileController.newFile({
            authorId: 'ti-gui',
            permission: ['Write', 'Read', 'Delete', 'Share', 'Protect', 'Security', 'Block'],
            name: `Test File ${Math.floor(Math.random() * 9e9)}`,
            description: `Testando o hercules storage`,
            type: '.xlsx',
            tag: 'Segurança',
            status: 'Available'
        });

        const cid = file.cid || "";

        expect(typeof cid).toBe("string");

        const now = new Date();

        const month = now.getMonth() <= 0 ? 0 : now.getMonth() - 1;

        const blocked = await FileController.blockedByMonth(cid, { group: { name: 'administrador', permission: "Block" } }, true, month);

        expect(blocked).toBe(true);

        const verify = await FileController.verifyBlocked(cid, { group: { name: 'administrador', permission: "Block" } });

        expect(typeof verify.message).toBe("string");

        console.log(verify.message);

        expect(verify.block).toBe(false);
    });

    it("Verificação do bloqueio do arquivo por dia do mês", async () => {
        const file = await FileController.newFile({
            authorId: 'ti-gui',
            permission: ['Write', 'Read', 'Delete', 'Share', 'Protect', 'Security', 'Block'],
            name: `Test File ${Math.floor(Math.random() * 9e9)}`,
            description: `Testando o hercules storage`,
            type: '.xlsx',
            tag: 'Segurança',
            status: 'Available'
        });

        const cid = file.cid || "";

        expect(typeof cid).toBe("string");

        const now = new Date();

        const blocked = await FileController.blockedByDayMonth(cid, { group: { name: 'administrador', permission: "Block" } }, true, now.getDate() - 1);

        expect(blocked).toBe(true);

        const verify = await FileController.verifyBlocked(cid, { group: { name: 'administrador', permission: "Block" } });

        expect(typeof verify.message).toBe("string");

        console.log(verify.message);

        expect(verify.block).toBe(false);
    });

    it("Verificação do bloqueio do arquivo por dia da semana", async () => {
        const file = await FileController.newFile({
            authorId: 'ti-gui',
            permission: ['Write', 'Read', 'Delete', 'Share', 'Protect', 'Security', 'Block'],
            name: `Test File ${Math.floor(Math.random() * 9e9)}`,
            description: `Testando o hercules storage`,
            type: '.xlsx',
            tag: 'Segurança',
            status: 'Available'
        });

        const cid = file.cid || "";

        expect(typeof cid).toBe("string");

        const now = new Date();

        const blocked = await FileController.blockedByDayWeek(cid, { group: { name: 'administrador', permission: "Block" } }, true, now.getDate() - 1);

        expect(blocked).toBe(true);

        const verify = await FileController.verifyBlocked(cid, { group: { name: 'administrador', permission: "Block" } });

        expect(typeof verify.message).toBe("string");

        console.log(verify.message);

        expect(verify.block).toBe(false);
    });

    it("Desbloqueio do Arquivo", async () => {
        const file = await FileController.newFile({
            authorId: 'ti-gui',
            permission: ['Write', 'Read', 'Delete', 'Share', 'Protect', 'Security', 'Block'],
            name: `Test File ${Math.floor(Math.random() * 9e9)}`,
            description: `Testando o hercules storage`,
            type: '.xlsx',
            tag: 'Segurança',
            status: 'Available'
        });

        const cid = file.cid || "";

        expect(typeof cid).toBe("string");

        const now = new Date();

        const blocked = await FileController.blockedByDayWeek(cid, { group: { name: 'administrador', permission: "Block" } }, true, now.getDate());

        expect(blocked).toBe(true);

        const unBlocked = await FileController.unBlocked(cid, { group: { name: 'administrador', permission: "Block" } });

        expect(unBlocked).toBe(true);
    });

    it("Move o arquivo para a lixeira", async () => {
        const file = await FileController.newFile({
            authorId: 'ti-gui',
            permission: ['Write', 'Read', 'Delete', 'Share', 'Protect', 'Security', 'Block'],
            name: `Test File ${Math.floor(Math.random() * 9e9)}`,
            description: `Testando o hercules storage`,
            type: '.xlsx',
            tag: 'Segurança',
            status: 'Available'
        });

        const cid = file.cid || "";

        expect(typeof cid).toBe("string");

        const moveToGarbage = await FileController.moveToGarbage(cid, { group: { name: 'administrador', permission: "Delete" } });

        expect(moveToGarbage).toBe(true);
    });

    it("Remove o arquivo da lixeira", async () => {
        const file = await FileController.newFile({
            authorId: 'ti-gui',
            permission: ['Write', 'Read', 'Delete', 'Share', 'Protect', 'Security', 'Block'],
            name: `Test File ${Math.floor(Math.random() * 9e9)}`,
            description: `Testando o hercules storage`,
            type: '.xlsx',
            tag: 'Segurança',
            status: 'Available'
        });

        const cid = file.cid || "";

        expect(typeof cid).toBe("string");

        const moveToGarbage = await FileController.moveToGarbage(cid, { group: { name: 'administrador', permission: "Delete" } });

        expect(moveToGarbage).toBe(true);

        const removeToGarbage = await FileController.removeOfGarbage(cid, { group: { name: 'administrador', permission: "Delete" } });

        expect(removeToGarbage).toBe(true);
    });

    it("Reciclagem dos arquivos na lixeira", async () => {
        const file = await FileController.newFile({
            authorId: 'ti-gui',
            permission: ['Write', 'Read', 'Delete', 'Share', 'Protect', 'Security', 'Block'],
            name: `Test File ${Math.floor(Math.random() * 9e9)}`,
            description: `Testando o hercules storage`,
            type: '.xlsx',
            tag: 'Segurança',
            status: 'Available'
        });

        const cid = file.cid || "";

        expect(typeof cid).toBe("string");

        const moveToGarbage = await FileController.moveToGarbage(cid, { group: { name: 'administrador', permission: "Delete" } });

        expect(moveToGarbage).toBe(true);

        const msg = await FileController.recycleGarbage();

        expect(msg).toMatch(/foram reciclados|Nenhum arquivo/g);
    });

    it("Gera o pedido aos procuradores do arquivo para mover o arquivo para a lixeira", async () => {
        const file = await FileController.newFile({
            authorId: 'ti-gui',
            permission: ['Write', 'Read', 'Delete', 'Share', 'Protect', 'Security', 'Block'],
            name: `Test File ${Math.floor(Math.random() * 9e9)}`,
            description: `Testando o hercules storage`,
            type: '.xlsx',
            tag: 'Segurança',
            status: 'Available'
        });

        const cid = file.cid || "";

        expect(typeof cid).toBe("string");

        const length = 10;

        for (let i = 0; i < length; i++) {
            const added = await FileController.insertAssignee(cid, { group: { name: 'administrador', permission: "Security" } }, { email: `user_${i}@exemple.com`, name: `Assignee ${i}` });

            expect(added).toBe(true);
        }

        const find_1 = await FileController.get({ cid }, 0, 1);

        expect(find_1).toHaveLength(1);

        expect(find_1[0].assignees).toHaveLength(length);

        const orderMoveToGarbage = await FileController.orderMoveToGarbage(cid, { group: { name: 'administrador', permission: "Security" } }, { assignee: { email: 'suporte@grupomave.com.br', name: 'GuilhermeSantos001' }, title: 'Teste', description: 'Testando o sistema' });

        expect(orderMoveToGarbage).toBe(true);

        const find_2 = await FileController.get({ cid }, 0, 1);

        const { order } = find_2[0];

        expect(typeof order !== 'undefined').toBe(true);

        if (order && typeof order.link === 'string')
            expect(order.link.length).toBe(12);
    });

    it("Remove o pedido enviado aos procuradores do arquivo", async () => {
        const file = await FileController.newFile({
            authorId: 'ti-gui',
            permission: ['Write', 'Read', 'Delete', 'Share', 'Protect', 'Security', 'Block'],
            name: `Test File ${Math.floor(Math.random() * 9e9)}`,
            description: `Testando o hercules storage`,
            type: '.xlsx',
            tag: 'Segurança',
            status: 'Available'
        });

        const cid = file.cid || "";

        expect(typeof cid).toBe("string");

        const added = await FileController.insertAssignee(cid, { group: { name: 'administrador', permission: "Security" } }, { email: 'ti@grupomave.com.br', name: 'Jefferson Oliveira' });

        expect(added).toBe(true);

        const find_1 = await FileController.get({ cid }, 0, 1);

        expect(find_1).toHaveLength(1);

        expect(find_1[0].assignees?.map(assignee => assignee.email)).toContain("ti@grupomave.com.br");

        const orderMoveToGarbage = await FileController.orderMoveToGarbage(cid, { group: { name: 'administrador', permission: "Security" } }, { assignee: { email: 'suporte@grupomave.com.br', name: 'GuilhermeSantos001' }, title: 'Teste', description: 'Testando o sistema' });

        expect(orderMoveToGarbage).toBe(true);

        const find_2 = await FileController.get({ cid }, 0, 1);

        const { order } = find_2[0];

        expect(typeof order !== 'undefined').toBe(true);

        if (order && typeof order.link === 'string')
            expect(order.link.length).toBe(12);

        const orderRemove = await FileController.orderRemove(cid, { group: { name: 'administrador', permission: "Security" } });

        expect(orderRemove).toBe(true);
    });

    it("Aprova o pedido enviado aos procuradores do arquivo", async () => {
        const file = await FileController.newFile({
            authorId: 'ti-gui',
            permission: ['Write', 'Read', 'Delete', 'Share', 'Protect', 'Security', 'Block'],
            name: `Test File ${Math.floor(Math.random() * 9e9)}`,
            description: `Testando o hercules storage`,
            type: '.xlsx',
            tag: 'Segurança',
            status: 'Available'
        });

        const cid = file.cid || "";

        expect(typeof cid).toBe("string");

        const added = await FileController.insertAssignee(cid, { group: { name: 'administrador', permission: "Security" } }, { email: 'ti@grupomave.com.br', name: 'Jefferson Oliveira' });

        expect(added).toBe(true);

        const find_1 = await FileController.get({ cid }, 0, 1);

        expect(find_1).toHaveLength(1);

        expect(find_1[0].assignees).toHaveLength(1);

        const orderMoveToGarbage = await FileController.orderMoveToGarbage(cid, { group: { name: 'administrador', permission: "Security" } }, { assignee: { email: 'suporte@grupomave.com.br', name: 'GuilhermeSantos001' }, title: 'Teste', description: 'Testando o sistema' });

        expect(orderMoveToGarbage).toBe(true);

        const find_2 = await FileController.get({ cid }, 0, 1);

        const { order } = find_2[0];

        expect(typeof order !== 'undefined').toBe(true);

        if (order && typeof order.link === 'string')
            expect(order.link.length).toBe(12);

        const approved = await FileController.orderAssigneeSetDecision(cid, { group: { name: 'administrador', permission: "Security" } }, { assignee: { email: 'ti@grupomave.com.br', name: 'Jefferson Oliveira' }, decision: "Approved" });

        expect(approved).toBe(true);
    });

    it("Reprova o pedido enviado aos procuradores do arquivo", async () => {
        const file = await FileController.newFile({
            authorId: 'ti-gui',
            permission: ['Write', 'Read', 'Delete', 'Share', 'Protect', 'Security', 'Block'],
            name: `Test File ${Math.floor(Math.random() * 9e9)}`,
            description: `Testando o hercules storage`,
            type: '.xlsx',
            tag: 'Segurança',
            status: 'Available'
        });

        const cid = file.cid || "";

        expect(typeof cid).toBe("string");

        const added = await FileController.insertAssignee(cid, { group: { name: 'administrador', permission: "Security" } }, { email: 'ti@grupomave.com.br', name: 'Jefferson Oliveira' });

        expect(added).toBe(true);

        const find_1 = await FileController.get({ cid }, 0, 1);

        expect(find_1).toHaveLength(1);

        expect(find_1[0].assignees).toHaveLength(1);

        const orderMoveToGarbage = await FileController.orderMoveToGarbage(cid, { group: { name: 'administrador', permission: "Security" } }, { assignee: { email: 'suporte@grupomave.com.br', name: 'GuilhermeSantos001' }, title: 'Teste', description: 'Testando o sistema' });

        expect(orderMoveToGarbage).toBe(true);

        const find_2 = await FileController.get({ cid }, 0, 1);

        const { order } = find_2[0];

        expect(typeof order !== 'undefined').toBe(true);

        if (order && typeof order.link === 'string')
            expect(order.link.length).toBe(12);

        const rejected = await FileController.orderAssigneeSetDecision(cid, { group: { name: 'administrador', permission: "Security" } }, { assignee: { email: 'ti@grupomave.com.br', name: 'Jefferson Oliveira' }, decision: "Rejected" });

        expect(rejected).toBe(true);
    });

    it("Processa o pedido enviado aos procuradores do arquivo, quando todos os procuradores aprovarem", async () => {
        const file = await FileController.newFile({
            authorId: 'ti-gui',
            permission: ['Write', 'Read', 'Delete', 'Share', 'Protect', 'Security', 'Block'],
            name: `Test File ${Math.floor(Math.random() * 9e9)}`,
            description: `Testando o hercules storage`,
            type: '.xlsx',
            tag: 'Segurança',
            status: 'Available'
        });

        const cid = file.cid || "";

        expect(typeof cid).toBe("string");

        const length = 1;

        for (let i = 0; i < length; i++) {
            const added = await FileController.insertAssignee(cid, { group: { name: 'administrador', permission: "Security" } }, { email: `assignee_${i}@exemple.com`, name: `Assignee ${i}` });

            expect(added).toBe(true);
        }

        const find_1 = await FileController.get({ cid }, 0, 1);

        expect(find_1).toHaveLength(1);

        expect(find_1[0].assignees).toHaveLength(length);

        const orderMoveToGarbage = await FileController.orderMoveToGarbage(cid, { group: { name: 'administrador', permission: "Security" } }, { assignee: { email: 'suporte@grupomave.com.br', name: 'GuilhermeSantos001' }, title: 'Teste', description: 'Testando o sistema' });

        expect(orderMoveToGarbage).toBe(true);

        const find_2 = await FileController.get({ cid }, 0, 1);

        const { order } = find_2[0];

        expect(typeof order !== 'undefined').toBe(true);

        if (order && typeof order.link === 'string')
            expect(order.link.length).toBe(12);

        const approved = await FileController.orderAssigneeSetDecision(cid, { group: { name: 'administrador', permission: "Security" } }, { assignee: { email: 'assignee_0@exemple.com', name: 'Assignee 0' }, decision: "Approved" });

        expect(approved).toBe(true);

        const process = await FileController.orderProcess(cid, { group: { name: 'administrador', permission: "Security" } });

        expect(process).toBe(true);
    });

    it("Processa o pedido enviado aos procuradores do arquivo, quando algum procurador não aprovar", async () => {
        const file = await FileController.newFile({
            authorId: 'ti-gui',
            permission: ['Write', 'Read', 'Delete', 'Share', 'Protect', 'Security', 'Block'],
            name: `Test File ${Math.floor(Math.random() * 9e9)}`,
            description: `Testando o hercules storage`,
            type: '.xlsx',
            tag: 'Segurança',
            status: 'Available'
        });

        const cid = file.cid || "";

        expect(typeof cid).toBe("string");

        const length = 2;

        for (let i = 0; i < length; i++) {
            const added = await FileController.insertAssignee(cid, { group: { name: 'administrador', permission: "Security" } }, { email: `assignee_${i}@exemple.com`, name: `Assignee ${i}` });

            expect(added).toBe(true);
        }

        const find_1 = await FileController.get({ cid }, 0, 1);

        expect(find_1).toHaveLength(1);

        expect(find_1[0].assignees).toHaveLength(length);

        const orderMoveToGarbage = await FileController.orderMoveToGarbage(cid, { group: { name: 'administrador', permission: "Security" } }, { assignee: { email: 'suporte@grupomave.com.br', name: 'GuilhermeSantos001' }, title: 'Teste', description: 'Testando o sistema' });

        expect(orderMoveToGarbage).toBe(true);

        const find_2 = await FileController.get({ cid }, 0, 1);

        const { order } = find_2[0];

        expect(typeof order !== 'undefined').toBe(true);

        if (order && typeof order.link === 'string')
            expect(order.link.length).toBe(12);

        const approved = await FileController.orderAssigneeSetDecision(cid, { group: { name: 'administrador', permission: "Security" } }, { assignee: { email: 'assignee_0@exemple.com', name: 'Assignee 0' }, decision: "Approved" });

        expect(approved).toBe(true);

        const process = await FileController.orderProcess(cid, { group: { name: 'administrador', permission: "Security" } });

        expect(process).toBe(false);
    });

    it("Criação de Pasta", async () => {
        const folder = await FolderController.newFolder({
            authorId: "ti-gui",
            name: `Test Folder ${Math.floor(Math.random() * 9e9)}`,
            description: "Testando o hercules storage",
            permission: ["Append", "Delete", "Share", "Protect", "Security", "Block"],
            tag: "Outros",
            type: "Diversos",
            status: "Available"
        });

        const cid = folder.cid;

        expect(typeof cid).toBe("string");
        expect(await FolderController.get({ cid }, 0, 1)).toHaveLength(1);
    });

    it("Remoção da Pasta", async () => {
        const folder = await FolderController.newFolder({
            authorId: "ti-gui",
            name: `Test Folder ${Math.floor(Math.random() * 9e9)}`,
            description: "Testando o hercules storage",
            permission: ["Append", "Delete", "Share", "Protect", "Security", "Block"],
            tag: "Outros",
            type: "Diversos",
            status: "Available"
        });

        const cid = folder.cid || "";

        expect(typeof cid).toBe("string");

        const remove = await FolderController.delete(cid, { group: { name: 'administrador', permission: "Delete" } }, { group: { name: "administrador", permission: "Delete" } });

        expect(remove).toBe(true);
        expect(await FolderController.get({ cid }, 0, 1)).toHaveLength(0);
    });

    it("Adição de arquivo na pasta", async () => {
        const folder = await FolderController.newFolder({
            authorId: "ti-gui",
            name: `Test Folder ${Math.floor(Math.random() * 9e9)}`,
            description: "Testando o hercules storage",
            permission: ["Append", "Delete", "Share", "Protect", "Security", "Block"],
            tag: "Outros",
            type: "Diversos",
            status: "Available"
        });

        const file = await FileController.newFile({
            authorId: 'ti-gui',
            permission: ['Write', 'Read', 'Delete', 'Share', 'Protect', 'Security', 'Block'],
            name: `Test File ${Math.floor(Math.random() * 9e9)}`,
            description: `Testando o hercules storage`,
            type: '.xlsx',
            tag: 'Segurança',
            status: 'Available'
        });

        const
            cid_1 = folder.cid || "",
            cid_2 = file.cid || "";

        expect(typeof cid_1).toBe("string");

        expect(typeof cid_2).toBe("string");

        const append = await FolderController.append(cid_1, { group: { name: "administrador", permission: "Append" } }, cid_2, { group: { name: "administrador", permission: "Write" } });

        expect(append).toBe(true);
    });

    it("Remoção do arquivo da pasta", async () => {
        const folder = await FolderController.newFolder({
            authorId: "ti-gui",
            name: `Test Folder ${Math.floor(Math.random() * 9e9)}`,
            description: "Testando o hercules storage",
            permission: ["Append", "Delete", "Share", "Protect", "Security", "Block"],
            tag: "Outros",
            type: "Diversos",
            status: "Available"
        });

        const file = await FileController.newFile({
            authorId: 'ti-gui',
            permission: ['Write', 'Read', 'Delete', 'Share', 'Protect', 'Security', 'Block'],
            name: `Test File ${Math.floor(Math.random() * 9e9)}`,
            description: `Testando o hercules storage`,
            type: '.xlsx',
            tag: 'Segurança',
            status: 'Available'
        });

        const
            cid_1 = folder.cid || "",
            cid_2 = file.cid || "";

        expect(typeof cid_1).toBe("string");

        expect(typeof cid_2).toBe("string");

        const append = await FolderController.append(cid_1, { group: { name: "administrador", permission: "Append" } }, cid_2, { group: { name: "administrador", permission: "Write" } });

        expect(append).toBe(true);

        const remove = await FolderController.remove(cid_1, { group: { name: "administrador", permission: "Delete" } }, cid_2, { group: { name: "administrador", permission: "Delete" } });

        expect(remove).toBe(true);
    });

    it("Adição de pasta na pasta", async () => {
        const folder_1 = await FolderController.newFolder({
            authorId: "ti-gui",
            name: `Test Folder ${Math.floor(Math.random() * 9e9)}`,
            description: "Testando o hercules storage",
            permission: ["Append", "Delete", "Share", "Protect", "Security", "Block"],
            tag: "Outros",
            type: "Diversos",
            status: "Available"
        });

        const folder_2 = await FolderController.newFolder({
            authorId: "ti-gui",
            name: `Test Folder ${Math.floor(Math.random() * 9e9)}`,
            description: "Testando o hercules storage",
            permission: ["Append", "Delete", "Share", "Protect", "Security", "Block"],
            tag: "Outros",
            type: "Diversos",
            status: "Available"
        });

        const
            cid_1 = folder_1.cid || "",
            cid_2 = folder_2.cid || "";

        expect(typeof cid_1).toBe("string");
        expect(typeof cid_2).toBe("string");

        const push = await FolderController.push(cid_1, { group: { name: "administrador", permission: "Append" } }, cid_2);

        expect(push).toBe(true);
    });

    it("Remoção da pasta associada há pasta", async () => {
        const folder_1 = await FolderController.newFolder({
            authorId: "ti-gui",
            name: `Test Folder ${Math.floor(Math.random() * 9e9)}`,
            description: "Testando o hercules storage",
            permission: ["Append", "Delete", "Share", "Protect", "Security", "Block"],
            tag: "Outros",
            type: "Diversos",
            status: "Available"
        });

        const folder_2 = await FolderController.newFolder({
            authorId: "ti-gui",
            name: `Test Folder ${Math.floor(Math.random() * 9e9)}`,
            description: "Testando o hercules storage",
            permission: ["Append", "Delete", "Share", "Protect", "Security", "Block"],
            tag: "Outros",
            type: "Diversos",
            status: "Available"
        });

        const
            cid_1 = folder_1.cid || "",
            cid_2 = folder_2.cid || "";

        expect(typeof cid_1).toBe("string");
        expect(typeof cid_2).toBe("string");

        const push = await FolderController.push(cid_1, { group: { name: "administrador", permission: "Append" } }, cid_2);

        expect(push).toBe(true);

        const splice = await FolderController.splice(cid_1, { group: { name: "administrador", permission: "Append" } }, cid_2);

        expect(splice).toBe(true);
    });

    it("Abertura da pasta e retorna os IDs dos arquivos", async () => {
        const folder = await FolderController.newFolder({
            authorId: "ti-gui",
            name: `Test Folder ${Math.floor(Math.random() * 9e9)}`,
            description: "Testando o hercules storage",
            permission: ["Append", "Delete", "Share", "Protect", "Security", "Block"],
            tag: "Outros",
            type: "Diversos",
            status: "Available"
        });

        const file = await FileController.newFile({
            authorId: 'ti-gui',
            permission: ['Write', 'Read', 'Delete', 'Share', 'Protect', 'Security', 'Block'],
            name: `Test File ${Math.floor(Math.random() * 9e9)}`,
            description: `Testando o hercules storage`,
            type: '.xlsx',
            tag: 'Segurança',
            status: 'Available'
        });

        const
            cid_1 = folder.cid || "",
            cid_2 = file.cid || "";

        expect(typeof cid_1).toBe("string");

        expect(typeof cid_2).toBe("string");

        const append = await FolderController.append(cid_1, { group: { name: "administrador", permission: "Append" } }, cid_2, { group: { name: "administrador", permission: "Write" } });

        expect(append).toBe(true);

        const filesId = await FolderController.open(cid_1, { group: { name: "administrador", permission: "Append" } });

        expect(filesId).toHaveLength(1);
    });

    it('Proteger pasta', async () => {
        const folder = await FolderController.newFolder({
            authorId: "ti-gui",
            name: `Test Folder ${Math.floor(Math.random() * 9e9)}`,
            description: "Testando o hercules storage",
            permission: ["Append", "Delete", "Share", "Protect", "Security", "Block"],
            tag: "Outros",
            type: "Diversos",
            status: "Available"
        });

        const cid = folder.cid || "",
            passphrase = "123456";

        expect(typeof cid).toBe("string");

        const key = await FolderController.protect(cid, { group: { name: "administrador", permission: "Protect" } }, passphrase);

        expect(typeof key).toBe("string");
    });

    it('Desproteger pasta', async () => {
        const folder = await FolderController.newFolder({
            authorId: "ti-gui",
            name: `Test Folder ${Math.floor(Math.random() * 9e9)}`,
            description: "Testando o hercules storage",
            permission: ["Append", "Delete", "Share", "Protect", "Security", "Block"],
            tag: "Outros",
            type: "Diversos",
            status: "Available"
        });

        const cid = folder.cid || "",
            passphrase = "123456";

        expect(typeof cid).toBe("string");

        const key = await FolderController.protect(cid, { group: { name: "administrador", permission: "Protect" } }, passphrase);

        expect(typeof key).toBe("string");

        const available = await FolderController.unProtect(cid, { group: { name: "administrador", permission: "Protect" } }, key, passphrase);

        expect(available).toBe(true);
    });

    it('Ativação do compartilhamento da pasta', async () => {
        const folder = await FolderController.newFolder({
            authorId: "ti-gui",
            name: `Test Folder ${Math.floor(Math.random() * 9e9)}`,
            description: "Testando o hercules storage",
            permission: ["Append", "Delete", "Share", "Protect", "Security", "Block"],
            tag: "Outros",
            type: "Diversos",
            status: "Available"
        });

        const cid = folder.cid || "";

        expect(typeof cid).toBe("string");

        const title = "Teste de Compartilhamento";

        const { link, secret } = await FolderController.share(cid, { group: { name: "administrador", permission: "Share" } }, title);

        expect(typeof link).toBe("string");
        expect(typeof secret).toBe("string");
    });

    it('Remoção do compartilhamento da pasta', async () => {
        const folder = await FolderController.newFolder({
            authorId: "ti-gui",
            name: `Test Folder ${Math.floor(Math.random() * 9e9)}`,
            description: "Testando o hercules storage",
            permission: ["Append", "Delete", "Share", "Protect", "Security", "Block"],
            tag: "Outros",
            type: "Diversos",
            status: "Available"
        });

        const cid = folder.cid || "";

        expect(typeof cid).toBe("string");

        const title = "Teste de Compartilhamento";

        const { link, secret } = await FolderController.share(cid, { group: { name: "administrador", permission: "Share" } }, title);

        expect(typeof link).toBe("string");
        expect(typeof secret).toBe("string");

        const unShare = await FolderController.unShare(cid, { group: { name: "administrador", permission: "Share" } }, link, secret);

        expect(unShare).toBe(true);
    });

    it("Inserção do grupo na whitelist da pasta", async () => {
        const folder = await FolderController.newFolder({
            authorId: "ti-gui",
            name: `Test Folder ${Math.floor(Math.random() * 9e9)}`,
            description: "Testando o hercules storage",
            permission: ["Append", "Delete", "Share", "Protect", "Security", "Block"],
            tag: "Outros",
            type: "Diversos",
            status: "Available"
        });

        const cid = folder.cid || "";

        expect(typeof cid).toBe("string");

        const added = await FolderController.insertGroupId(cid, { group: { name: "administrador", permission: "Security" } }, { name: "common", permissions: ["Append", "Delete"] });

        expect(added).toBe(true);

        const find = await FolderController.get({ cid }, 0, 1);

        expect(find).toHaveLength(1);

        expect(find[0].accessGroupId?.map(groupId => groupId.name)).toContain("common");
    });

    it("Remoção do grupo na whitelist da pasta", async () => {
        const folder = await FolderController.newFolder({
            authorId: "ti-gui",
            name: `Test Folder ${Math.floor(Math.random() * 9e9)}`,
            description: "Testando o hercules storage",
            permission: ["Append", "Delete", "Share", "Protect", "Security", "Block"],
            tag: "Outros",
            type: "Diversos",
            status: "Available"
        });

        const cid = folder.cid || "";

        expect(typeof cid).toBe("string");

        const added = await FolderController.insertGroupId(cid, { group: { name: "administrador", permission: "Security" } }, { name: "common", permissions: ["Append", "Delete"] });

        expect(added).toBe(true);

        const find_1 = await FolderController.get({ cid }, 0, 1);

        expect(find_1).toHaveLength(1);

        expect(find_1[0].accessGroupId?.map(groupId => groupId.name)).toContain("common");

        const removed = await FolderController.removeGroupId(cid, { group: { name: "administrador", permission: "Security" } }, { name: "common", permissions: [] });

        expect(removed).toBe(true);

        const find_2 = await FolderController.get({ cid }, 0, 1);

        expect(find_2).toHaveLength(1);

        expect(find_2[0].accessGroupId?.map(groupId => groupId.name)).not.toContain("common");
    });

    it("Inserção do usuário na whitelist da pasta", async () => {
        const folder = await FolderController.newFolder({
            authorId: "ti-gui",
            name: `Test Folder ${Math.floor(Math.random() * 9e9)}`,
            description: "Testando o hercules storage",
            permission: ["Append", "Delete", "Share", "Protect", "Security", "Block"],
            tag: "Outros",
            type: "Diversos",
            status: "Available"
        });

        const cid = folder.cid || "";

        expect(typeof cid).toBe("string");

        const added = await FolderController.insertUserId(cid, { group: { name: "administrador", permission: "Security" } }, { email: "suporte@grupomave.com.br", permissions: ["Append", "Delete"] });

        expect(added).toBe(true);

        const find = await FolderController.get({ cid }, 0, 1);

        expect(find).toHaveLength(1);

        expect(find[0].accessUsersId?.map(userId => userId.email)).toContain("suporte@grupomave.com.br");
    });

    it("Remoção do usuário da whitelist da pasta", async () => {
        const folder = await FolderController.newFolder({
            authorId: "ti-gui",
            name: `Test Folder ${Math.floor(Math.random() * 9e9)}`,
            description: "Testando o hercules storage",
            permission: ["Append", "Delete", "Share", "Protect", "Security", "Block"],
            tag: "Outros",
            type: "Diversos",
            status: "Available"
        });

        const cid = folder.cid || "";

        expect(typeof cid).toBe("string");

        const added = await FolderController.insertUserId(cid, { group: { name: "administrador", permission: "Security" } }, { email: "suporte@grupomave.com.br", permissions: ["Append", "Delete"] });

        expect(added).toBe(true);

        const find_1 = await FolderController.get({ cid }, 0, 1);

        expect(find_1).toHaveLength(1);

        expect(find_1[0].accessUsersId?.map(userId => userId.email)).toContain("suporte@grupomave.com.br");

        const removed = await FolderController.removeUserId(cid, { group: { name: "administrador", permission: "Security" } }, { email: "suporte@grupomave.com.br", permissions: ["Append", "Delete"] });

        expect(removed).toBe(true);

        const find_2 = await FolderController.get({ cid }, 0, 1);

        expect(find_2).toHaveLength(1);

        expect(find_2[0].accessUsersId?.map(userId => userId.email)).not.toContain("suporte@grupomave.com.br");
    });

    it("Ativação do bloqueio da pasta por data", async () => {
        const folder = await FolderController.newFolder({
            authorId: "ti-gui",
            name: `Test Folder ${Math.floor(Math.random() * 9e9)}`,
            description: "Testando o hercules storage",
            permission: ["Append", "Delete", "Share", "Protect", "Security", "Block"],
            tag: "Outros",
            type: "Diversos",
            status: "Available"
        });

        const cid = folder.cid || "";

        expect(typeof cid).toBe("string");

        const now = new Date();

        const blocked = await FolderController.blockedByDate(cid, { group: { name: "administrador", permission: "Block" } }, true, {
            year: now.getFullYear(),
            month: now.getMonth() < 11 ? now.getMonth() + 1 : now.getMonth(),
            date: now.getDate() + 1,
            hour: now.getHours(),
            minute: now.getMinutes()
        });

        expect(blocked).toBe(true);

        const verify = await FolderController.verifyBlocked(cid, { group: { name: "administrador", permission: "Block" } });

        expect(typeof verify.message).toBe("string");

        console.log(verify.message);

        expect(verify.block).toBe(true);
    });

    it("Ativação do bloqueio da pasta por mês", async () => {
        const folder = await FolderController.newFolder({
            authorId: "ti-gui",
            name: `Test Folder ${Math.floor(Math.random() * 9e9)}`,
            description: "Testando o hercules storage",
            permission: ["Append", "Delete", "Share", "Protect", "Security", "Block"],
            tag: "Outros",
            type: "Diversos",
            status: "Available"
        });

        const cid = folder.cid || "";

        expect(typeof cid).toBe("string");

        const now = new Date();

        const blocked = await FolderController.blockedByMonth(cid, { group: { name: "administrador", permission: "Block" } }, true, now.getMonth());

        expect(blocked).toBe(true);

        const verify = await FolderController.verifyBlocked(cid, { group: { name: "administrador", permission: "Block" } });

        expect(typeof verify.message).toBe("string");

        console.log(verify.message);

        expect(verify.block).toBe(true);
    });

    it("Ativação do bloqueio da pasta por dia do mês", async () => {
        const folder = await FolderController.newFolder({
            authorId: "ti-gui",
            name: `Test Folder ${Math.floor(Math.random() * 9e9)}`,
            description: "Testando o hercules storage",
            permission: ["Append", "Delete", "Share", "Protect", "Security", "Block"],
            tag: "Outros",
            type: "Diversos",
            status: "Available"
        });

        const cid = folder.cid || "";

        expect(typeof cid).toBe("string");

        const now = new Date();

        const blocked = await FolderController.blockedByDayMonth(cid, { group: { name: "administrador", permission: "Block" } }, true, now.getDate());

        expect(blocked).toBe(true);

        const verify = await FolderController.verifyBlocked(cid, { group: { name: "administrador", permission: "Block" } });

        expect(typeof verify.message).toBe("string");

        console.log(verify.message);

        expect(verify.block).toBe(true);
    });

    it("Ativação do bloqueio da pasta por dia da semana", async () => {
        const folder = await FolderController.newFolder({
            authorId: "ti-gui",
            name: `Test Folder ${Math.floor(Math.random() * 9e9)}`,
            description: "Testando o hercules storage",
            permission: ["Append", "Delete", "Share", "Protect", "Security", "Block"],
            tag: "Outros",
            type: "Diversos",
            status: "Available"
        });

        const cid = folder.cid || "";

        expect(typeof cid).toBe("string");

        const now = new Date();

        const blocked = await FolderController.blockedByDayWeek(cid, { group: { name: "administrador", permission: "Block" } }, true, now.getDate());

        expect(blocked).toBe(true);

        const verify = await FolderController.verifyBlocked(cid, { group: { name: "administrador", permission: "Block" } });

        expect(typeof verify.message).toBe("string");

        console.log(verify.message);

        expect(verify.block).toBe(true);
    });

    it("Ativação do bloqueio da pasta por hora", async () => {
        const folder = await FolderController.newFolder({
            authorId: "ti-gui",
            name: `Test Folder ${Math.floor(Math.random() * 9e9)}`,
            description: "Testando o hercules storage",
            permission: ["Append", "Delete", "Share", "Protect", "Security", "Block"],
            tag: "Outros",
            type: "Diversos",
            status: "Available"
        });

        const cid = folder.cid || "";

        expect(typeof cid).toBe("string");

        const blocked = await FolderController.blockedByHour(cid, { group: { name: "administrador", permission: "Block" } }, true, 2);

        expect(blocked).toBe(true);

        const verify = await FolderController.verifyBlocked(cid, { group: { name: "administrador", permission: "Block" } });

        expect(typeof verify.message).toBe("string");

        console.log(verify.message);

        expect(verify.block).toBe(true);
    });

    it("Ativação do bloqueio da pasta por minuto", async () => {
        const folder = await FolderController.newFolder({
            authorId: "ti-gui",
            name: `Test Folder ${Math.floor(Math.random() * 9e9)}`,
            description: "Testando o hercules storage",
            permission: ["Append", "Delete", "Share", "Protect", "Security", "Block"],
            tag: "Outros",
            type: "Diversos",
            status: "Available"
        });

        const cid = folder.cid || "";

        expect(typeof cid).toBe("string");

        const blocked = await FolderController.blockedByMinute(cid, { group: { name: "administrador", permission: "Block" } }, true, 2);

        expect(blocked).toBe(true);

        const verify = await FolderController.verifyBlocked(cid, { group: { name: "administrador", permission: "Block" } });

        expect(typeof verify.message).toBe("string");

        console.log(verify.message);

        expect(verify.block).toBe(true);
    });

    it("Verificação do bloqueio da pasta por data", async () => {
        const folder = await FolderController.newFolder({
            authorId: "ti-gui",
            name: `Test Folder ${Math.floor(Math.random() * 9e9)}`,
            description: "Testando o hercules storage",
            permission: ["Append", "Delete", "Share", "Protect", "Security", "Block"],
            tag: "Outros",
            type: "Diversos",
            status: "Available"
        });

        const cid = folder.cid || "";

        expect(typeof cid).toBe("string");

        const now = new Date();

        const blocked = await FolderController.blockedByDate(cid, { group: { name: "administrador", permission: "Block" } }, true, {
            year: now.getFullYear() - 1,
            month: now.getMonth(),
            date: now.getDate(),
            hour: now.getHours(),
            minute: now.getMinutes()
        });

        expect(blocked).toBe(true);

        const verify = await FolderController.verifyBlocked(cid, { group: { name: "administrador", permission: "Block" } });

        expect(typeof verify.message).toBe("string");

        console.log(verify.message);

        expect(verify.block).toBe(false);
    });

    it("Verificação do bloqueio da pasta por mês", async () => {
        const folder = await FolderController.newFolder({
            authorId: "ti-gui",
            name: `Test Folder ${Math.floor(Math.random() * 9e9)}`,
            description: "Testando o hercules storage",
            permission: ["Append", "Delete", "Share", "Protect", "Security", "Block"],
            tag: "Outros",
            type: "Diversos",
            status: "Available"
        });

        const cid = folder.cid || "";

        expect(typeof cid).toBe("string");

        const now = new Date();

        const month = now.getMonth() <= 0 ? 0 : now.getMonth() - 1;

        const blocked = await FolderController.blockedByMonth(cid, { group: { name: "administrador", permission: "Block" } }, true, month);

        expect(blocked).toBe(true);

        const verify = await FolderController.verifyBlocked(cid, { group: { name: "administrador", permission: "Block" } });

        expect(typeof verify.message).toBe("string");

        console.log(verify.message);

        expect(verify.block).toBe(false);
    });

    it("Verificação do bloqueio da pasta por dia do mês", async () => {
        const folder = await FolderController.newFolder({
            authorId: "ti-gui",
            name: `Test Folder ${Math.floor(Math.random() * 9e9)}`,
            description: "Testando o hercules storage",
            permission: ["Append", "Delete", "Share", "Protect", "Security", "Block"],
            tag: "Outros",
            type: "Diversos",
            status: "Available"
        });

        const cid = folder.cid || "";

        expect(typeof cid).toBe("string");

        const now = new Date();

        const blocked = await FolderController.blockedByDayMonth(cid, { group: { name: "administrador", permission: "Block" } }, true, now.getDate() - 1);

        expect(blocked).toBe(true);

        const verify = await FolderController.verifyBlocked(cid, { group: { name: "administrador", permission: "Block" } });

        expect(typeof verify.message).toBe("string");

        console.log(verify.message);

        expect(verify.block).toBe(false);
    });

    it("Verificação do bloqueio da pasta por dia da semana", async () => {
        const folder = await FolderController.newFolder({
            authorId: "ti-gui",
            name: `Test Folder ${Math.floor(Math.random() * 9e9)}`,
            description: "Testando o hercules storage",
            permission: ["Append", "Delete", "Share", "Protect", "Security", "Block"],
            tag: "Outros",
            type: "Diversos",
            status: "Available"
        });

        const cid = folder.cid || "";

        expect(typeof cid).toBe("string");

        const now = new Date();

        const blocked = await FolderController.blockedByDayWeek(cid, { group: { name: "administrador", permission: "Block" } }, true, now.getDate() - 1);

        expect(blocked).toBe(true);

        const verify = await FolderController.verifyBlocked(cid, { group: { name: "administrador", permission: "Block" } });

        expect(typeof verify.message).toBe("string");

        console.log(verify.message);

        expect(verify.block).toBe(false);
    });

    it("Desbloqueio da pasta", async () => {
        const folder = await FolderController.newFolder({
            authorId: "ti-gui",
            name: `Test Folder ${Math.floor(Math.random() * 9e9)}`,
            description: "Testando o hercules storage",
            permission: ["Append", "Delete", "Share", "Protect", "Security", "Block"],
            tag: "Outros",
            type: "Diversos",
            status: "Available"
        });

        const cid = folder.cid || "";

        expect(typeof cid).toBe("string");

        const now = new Date();

        const blocked = await FolderController.blockedByDayWeek(cid, { group: { name: "administrador", permission: "Block" } }, true, now.getDate());

        expect(blocked).toBe(true);

        const unBlocked = await FolderController.unBlocked(cid, { group: { name: "administrador", permission: "Block" } });

        expect(unBlocked).toBe(true);
    });

    it("Move a pasta para a lixeira", async () => {
        const folder = await FolderController.newFolder({
            authorId: "ti-gui",
            name: `Test Folder ${Math.floor(Math.random() * 9e9)}`,
            description: "Testando o hercules storage",
            permission: ["Append", "Delete", "Share", "Protect", "Security", "Block"],
            tag: "Outros",
            type: "Diversos",
            status: "Available"
        });

        const cid = folder.cid || "";

        expect(typeof cid).toBe("string");

        const moveToGarbage = await FolderController.moveToGarbage(cid, { group: { name: "administrador", permission: "Delete" } }, { group: { name: "administrador", permission: "Delete" } });

        expect(moveToGarbage).toBe(true);
    });

    it("Remove a pasta da lixeira", async () => {
        const folder = await FolderController.newFolder({
            authorId: "ti-gui",
            name: `Test Folder ${Math.floor(Math.random() * 9e9)}`,
            description: "Testando o hercules storage",
            permission: ["Append", "Delete", "Share", "Protect", "Security", "Block"],
            tag: "Outros",
            type: "Diversos",
            status: "Available"
        });

        const cid = folder.cid || "";

        expect(typeof cid).toBe("string");

        const moveToGarbage = await FolderController.moveToGarbage(cid, { group: { name: "administrador", permission: "Delete" } }, { group: { name: "administrador", permission: "Delete" } });

        expect(moveToGarbage).toBe(true);

        const removeToGarbage = await FolderController.removeOfGarbage(cid, { group: { name: "administrador", permission: "Delete" } }, { group: { name: "administrador", permission: "Delete" } });

        expect(removeToGarbage).toBe(true);
    });

    it("Reciclagem das pastas na lixeira", async () => {
        const folder = await FolderController.newFolder({
            authorId: "ti-gui",
            name: `Test Folder ${Math.floor(Math.random() * 9e9)}`,
            description: "Testando o hercules storage",
            permission: ["Append", "Delete", "Share", "Protect", "Security", "Block"],
            tag: "Outros",
            type: "Diversos",
            status: "Available"
        });

        const cid = folder.cid || "";

        expect(typeof cid).toBe("string");

        const moveToGarbage = await FolderController.moveToGarbage(cid, { group: { name: "administrador", permission: "Delete" } }, { group: { name: "administrador", permission: "Delete" } });

        expect(moveToGarbage).toBe(true);

        const msg = await FolderController.recycleGarbage();

        expect(msg).toMatch(/foram recicladas|Nenhuma pasta/g);
    });
});

afterAll(async () => {
    const files = await FileController.get({ }, 0, 9e9);

    for (const file of files) {
        if (!file.trash) {
            const deleted = await FileController.delete(file.cid || "", { group: { name: "administrador", permission: "Delete" } }, { group: { name: "administrador", permission: "Delete" } });

            expect(deleted).toBe(true);
        }
    }

    const folders = await FolderController.get({ }, 0, 9e9);

    for (const folder of folders) {
        if (!folder.trash && !folder.folderId) {
            const deleted = await FolderController.delete(folder.cid || "", { group: { name: "administrador", permission: "Delete" } }, { group: { name: "administrador", permission: "Delete" } });

            expect(deleted).toBe(true);
        }
    }

    const jobsClear = await Jobs.clear();

    expect(jobsClear).toBe(true);

    mongoDB.shutdown();
});