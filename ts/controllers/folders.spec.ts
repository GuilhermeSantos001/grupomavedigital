/* eslint-disable @typescript-eslint/no-explicit-any */
/**
* @description Testes do controller de pastas
* @author GuilhermeSantos001
* @update 06/12/2021
*/

import Folders from '@/controllers/folders';
import mongoDB from '@/controllers/mongodb';

describe("Teste do controller de pastas", () => {
    beforeAll(async () => {
        const
            collectionName = 'folders',
            collections = await mongoDB.getDB(process.env.DB_NAME || "").listCollections().toArray();

        if (collections.filter(collection => collection.name === collectionName).length > 0) {
            await mongoDB.getDB(process.env.DB_NAME || "").dropCollection(collectionName);
        }
    });

    it('Cria uma pasta', async () => {
        for (let i = 0; i < 10; i++) {
            const folder = await Folders.newFolder({
                name: `Pasta ${i}`,
                description: `testando ${i}`,
                authorId: 'tester',
                permission: [
                    'Append',
                    'Block',
                    'Delete',
                    'Protect',
                    'Security',
                    'Share'
                ],
                room: ['TI'],
                status: 'Available',
                tag: '',
                type: '',
                accessGroupId: [{
                    name: 'administrador',
                    permissions: ['Append', 'Block']
                }],
                accessUsersId: []
            });

            expect(folder.name).toBe(`Pasta ${i}`);
            expect(folder.description).toBe(`testando ${i}`);
        }
    });

    it('Tenta criar uma pasta usando caracteres especiais', async () => {
        try {
            const folder = await Folders.newFolder({
                name: 'Pasta (4)',
                description: 'testando...',
                authorId: 'tester',
                permission: [
                    'Append',
                    'Block',
                    'Delete',
                    'Protect',
                    'Security',
                    'Share'
                ],
                room: ['TI'],
                status: 'Available',
                tag: '',
                type: '',
                accessGroupId: [{
                    name: 'administrador',
                    permissions: ['Append', 'Block']
                }],
                accessUsersId: []
            });

            expect(folder.name).toBe(`Pasta (4)`);
        } catch (e: any) {
            expect(e).toBe("folders validation failed: name: Pasta (4) contém caracteres especiais e não é permitido., description: testando... contém caracteres especiais e não é permitido.");
        }
    });

    it('Retorna o nome da pasta', async () => {
        const folders = await Folders.get({}, 0, 1);

        expect(folders.length).toBe(1);
        expect(folders[0].name).toBe('Pasta 0');
        expect(folders[0].description).toBe('testando 0');
        expect(folders[0].authorId).toBe('tester');
        expect(await Folders.name(folders[0].cid || "")).toBe('Pasta 0');
    });

    it('Deleta uma pasta', async () => {
        const
            folders = await Folders.get({}, 0, 1);

        expect(folders.length).toBe(1);
        expect(await Folders.delete(folders[0].cid || "", { group: { name: 'administrador', permission: 'Delete' } }, { group: { name: 'administrador', permission: 'Delete' } })).toBe(true);
    });

    it('Atualiza as informações da pasta', async () => {
        const
            folders = await Folders.get({}, 0, 1);

        expect(folders.length).toBe(1);
        expect(await Folders.update(folders[0].cid || "", {
            group: { name: 'administrador', permission: 'Security' }
        }, {
            name: 'Pasta Atualizada',
            description: 'Hello World',
            tag: 'Eu sou uma marcação',
            type: 'Sou do tipo tecnologia'
        })).toBe(true);
    });

    it('Tenta atualizar as informações da pasta usando caracteres especiais', async () => {
        try {
            const
                folders = await Folders.get({}, 0, 1);

            expect(folders.length).toBe(1);
            expect(await Folders.update(folders[0].cid || "", {
                group: { name: 'administrador', permission: 'Security' }
            }, {
                name: 'Pasta Atualizada (2021)',
                description: 'Hello World...',
                tag: 'Eu sou uma marcação #@$$$',
                type: 'Sou do tipo tecnologia &&¨**-.'
            })).toBe(true);
        } catch (e: any) {
            expect(e).toBe("folders validation failed: name: Pasta Atualizada (2021) contém caracteres especiais e não é permitido., description: Hello World... contém caracteres especiais e não é permitido., tag: Eu sou uma marcação #@$$$ contém caracteres especiais e não é permitido., type: Sou do tipo tecnologia &&¨**-. contém caracteres especiais e não é permitido.");
        }
    });

    it('Adiciona o grupo na whitelist da pasta', async () => {
        const
            folders = await Folders.get({}, 0, 1);

        expect(folders.length).toBe(1);
        expect(await Folders.insertGroupId(
            folders[0].cid || "",
            {
                group: {
                    name: 'administrador',
                    permission: 'Security'
                }
            },
            {
                name: 'common',
                permissions: ['Append', 'Block', 'Delete', 'Protect', 'Security', 'Share']
            }
        )).toBe(true);
    });

    it('Remove o grupo da whitelist da pasta', async () => {
        const
            folders = await Folders.get({}, 0, 1);

        expect(folders.length).toBe(1);
        expect(await Folders.removeGroupId(
            folders[0].cid || "",
            {
                group: {
                    name: 'administrador',
                    permission: 'Security'
                }
            },
            {
                name: 'common',
                permissions: []
            }
        )).toBe(true);
    });

    it('Adiciona um usuário na whitelist', async () => {
        const
            folders = await Folders.get({}, 0, 1);

        expect(folders.length).toBe(1);
        expect(await Folders.insertUserId(
            folders[0].cid || "",
            {
                group: {
                    name: 'administrador',
                    permission: 'Security'
                }
            },
            {
                email: 'zezinho123@outlook.com',
                permissions: ['Append', 'Block', 'Delete', 'Protect', 'Security', 'Share']
            }
        )).toBe(true);
    });

    it('Remove o usuário da whitelist', async () => {
        const
            folders = await Folders.get({}, 0, 1);

        expect(folders.length).toBe(1);
        expect(await Folders.removeUserId(
            folders[0].cid || "",
            {
                group: {
                    name: 'administrador',
                    permission: 'Security'
                }
            },
            {
                email: 'zezinho123@outlook.com',
                permissions: []
            }
        ));
    });
});

afterAll(async () => {
    mongoDB.shutdown();
});