/* eslint-disable @typescript-eslint/no-explicit-any */
/**
* @description Testes da database dos usuários
* @author GuilhermeSantos001
* @update 31/01/2022
*/

import { UsersManagerDB } from '@/database/UsersManagerDB';
import { UsersSchema } from '@/schemas/UsersSchema';
import { MongoDBClient } from '@/database/MongoDBClient';

describe("Teste do controller de usuários", () => {
    beforeAll(async () => {
        const
            mongoDBClient = new MongoDBClient(),
            collectionName1 = 'jobs',
            collectionName2 = 'users',
            collections = await mongoDBClient.getDB(process.env.DB_NAME || "").listCollections().toArray();

        if (collections.filter(collection => collection.name === collectionName1).length > 0) {
            await mongoDBClient.getDB(process.env.DB_NAME || "").dropCollection(collectionName1);
        }
        if (collections.filter(collection => collection.name === collectionName2).length > 0) {
            await mongoDBClient.getDB(process.env.DB_NAME || "").dropCollection(collectionName2);
        }
    });

    it('Criar usuário', async () => {
        const
            usersManagerDB = new UsersManagerDB(),
            create = await usersManagerDB.register({
                name: "Guilherme",
                surname: "dos Santos",
                username: "GuilhermeSantos001",
                email: {
                    status: false,
                    value: "spgamesoficial@gmail.com"
                },
                authorization: "tester",
                password: "123456",
                cnpj: "12345678901234",
                location: {
                    city: "São Paulo",
                    state: "SP",
                    complement: "",
                    district: "",
                    street: "",
                    number: 9999,
                    zipcode: "99999999"
                },
                photoProfile: "",
                privileges: ["administrador"],
                status: true
            });

        expect(create).toBe(true);

        await usersManagerDB.confirmAccount('tester');

        const user = await UsersSchema.findOne({ authorization: "tester" });

        expect(user && user.email.status).toBe(true);
    });

    it('Tentar criar o mesmo usuário', async () => {
        try {
            const usersManagerDB = new UsersManagerDB();

            expect(await usersManagerDB.register({
                name: "Guilherme",
                surname: "dos Santos",
                username: "GuilhermeSantos001",
                email: {
                    status: true,
                    value: "spgamesoficial@gmail.com"
                },
                authorization: "tester",
                password: "123456",
                cnpj: "12345678901234",
                location: {
                    city: "São Paulo",
                    state: "SP",
                    complement: "",
                    district: "",
                    street: "",
                    number: 9999,
                    zipcode: "99999999"
                },
                photoProfile: "",
                privileges: ["administrador"],
                status: true
            })).toBe(false);
        } catch (e: any) {
            expect(e.message).toBe("Usuário(tester) já está registrado");
        }
    });

    it('Mudar a senha do usuário', async () => {
        const usersManagerDB = new UsersManagerDB();

        await usersManagerDB.changePassword("tester", "12345678");

        const { username } = await usersManagerDB.confirmPassword('tester', '12345678');

        expect(username).toBe("GuilhermeSantos001");
    });

    it('Atualiza os dados do usuário', async () => {
        const usersManagerDB = new UsersManagerDB();

        expect(await usersManagerDB.updateData('tester', {
            username: 'Gu1L0rd',
            email: 'zezinho123@outlook.com',
            cnpj: '12345678901234',
            location: {
                city: 'São Paulo',
                state: 'SP',
                complement: '',
                district: '',
                street: '',
                number: 9999,
                zipcode: '99999999'
            },
            name: 'Guilherme',
            surname: 'dos Santos',
        })).toBe(true);
    });

    it('Retorna as informações do usuário', async () => {
        const
            usersManagerDB = new UsersManagerDB(),
            info = await usersManagerDB.getInfo('tester');

        expect(info).toMatchObject({
            name: 'Guilherme',
            surname: 'dos Santos',
            username: 'Gu1L0rd',
            email: 'zezinho123@outlook.com',
            authorization: 'tester',
            privileges: ['administrador'],
            privilege: 'Administrador(a)',
            photoProfile: '',
            cnpj: '12345678901234',
            location: {
                city: 'São Paulo',
                state: 'SP',
                complement: '',
                district: '',
                street: '',
                number: 9999,
                zipcode: '99999999'
            },
            session: {
                connected: 0,
                limit: 4,
                device: {
                    allowed: [
                        'desktop',
                        'phone',
                        'tablet',
                        'tv'
                    ],
                    connected: []
                },
                alerts: [
                    "::ffff:127.0.0.1",
                    "127.0.0.1",
                    "localhost"
                ],
                cache: {
                    tmp: 15,
                    unit: "m",
                    tokens: [],
                    refreshToken: [],
                    history: []
                }
            },
            signature: info.signature,
            authentication: {
                twofactor: {
                    secret: '',
                    enabled: false
                },
                forgotPassword: ""
            }
        });
    });

    it('Retorna o total de usuários ativos/inativos', async () => {
        const usersManagerDB = new UsersManagerDB();

        expect(await usersManagerDB.getUsersEnabledAndDisabled()).toMatchObject([1, 0]);
    });

    it('Altera a foto de perfil', async () => {
        const usersManagerDB = new UsersManagerDB();

        expect(await usersManagerDB.updatePhotoProfile('tester', 'avatar.png')).toBe(true);

        const { photoProfile } = await usersManagerDB.getInfo('tester');

        expect(photoProfile).toBe('avatar.png');
    });

    it('Ativar a verificação de duas etapas', async () => {
        const usersManagerDB = new UsersManagerDB();

        expect(await usersManagerDB.enabledtwofactor('tester')).toBe(true);

        const { authentication } = await usersManagerDB.getInfo('tester');

        expect(authentication.twofactor.enabled).toBe(true);
    });

    it('Desativar a verificação de duas etapas', async () => {
        const usersManagerDB = new UsersManagerDB();

        expect(await usersManagerDB.disabledtwofactor('tester')).toBe(true);

        const { authentication } = await usersManagerDB.getInfo('tester');

        expect(authentication.twofactor.enabled).toBe(false);
    });

    it('Registra a autenticação de duas etapas', async () => {
        const usersManagerDB = new UsersManagerDB();

        const { secret, qrcode } = await usersManagerDB.signtwofactor('tester');

        expect(secret).toBeTruthy();
        expect(qrcode).toBeTruthy();
    });

    it('Registra a assinatura para que o usuario possa trocar a senha', async () => {
        const usersManagerDB = new UsersManagerDB();

        expect(await usersManagerDB.forgotPasswordSignatureRegister('tester', '123456')).toBe(true);
    });

    it('Conecta o usuário', async () => {
        const usersManagerDB = new UsersManagerDB();

        await usersManagerDB.confirmAccount('tester');

        const user = await UsersSchema.findOne({ authorization: "tester" });

        expect(user && user.email.status).toBe(true);

        await expect(usersManagerDB.clearExpiredRefreshToken('tester')).resolves.not.toThrow();

        const refreshToken = await usersManagerDB.addRefreshToken('tester');

        expect(refreshToken.signature).toBeTruthy();
        expect(refreshToken.value).toBeTruthy();
        expect(refreshToken.expiry).toBeTruthy();

        for (let i = 0; i < 4; i++) {
            expect(await usersManagerDB.connected('tester', {
                ip: 'localhost',
                token: `myToken-${i}`,
                device: 'desktop',
                location: {
                    locationIP: 'Brazil',
                    internetAdress: '148.236.82.56',
                    browser: 'Google Chrome',
                    os: 'Windows'
                },
                signature: `mySignature-${i}`
            })).toBe(true);
        }
    });

    it('Desconecta o usuário', async () => {
        const usersManagerDB = new UsersManagerDB();

        expect(await usersManagerDB.disconnected('tester', 'myToken-0')).toBe(true);
    });
});

afterAll(async () => {
    const mongoDBClient = new MongoDBClient();
    mongoDBClient.shutdown();
});