/**
 * @description Rotas do usuário
 * @author @GuilhermeSantos001
 * @update 17/07/2021
 * @version 1.0.5
 */

import express, { Request, Response } from 'express';

import getReqProps from '@/utils/getReqProps';
import Privilege from '@/utils/privilege';
import TokenMiddleware from '@/middlewares/token-middleware';
import userDB, { UserInfo } from '@/db/user-db';
import JsonWebToken from '@/core/JsonWebToken';

import { createUser, findUser, findAllUserByProjectName, removeUser, updateUser } from '@/models/controllers/user';
import { createProject } from '@/models/controllers/project';

const router = express.Router({
    strict: true,
    caseSensitive: true
});

/**
 * @description Pagina do perfil de usuário
 */
router.get(['/perfil'], TokenMiddleware, async (req: Request, res: Response) => {
    let {
        token
    } = getReqProps(req, [
        'token'
    ]);

    try {
        userDB.getInfo(token['auth'])
            .then((userInfo: UserInfo) => {
                const
                    privileges = token['privileges'],
                    photoProfile = userInfo.photoProfile,
                    email = userInfo.email,
                    username = userInfo.username,
                    name = userInfo.name,
                    surname = userInfo.surname,
                    cnpj = userInfo.cnpj,
                    location = userInfo.location;

                return res.status(200).render('userPerfil', {
                    title: 'Grupo Mave Digital',
                    router: 'Minha Conta/Minhas Informações.',
                    menus: [{
                        type: 'normal',
                        icon: 'edit',
                        first: true,
                        enabled: true,
                        title: 'Minhas Informações',
                        onclick: ""
                    }, {
                        type: 'normal',
                        icon: 'chevron-left',
                        first: false,
                        enabled: true,
                        title: 'Voltar',
                        onclick: 'gotoSystem()'
                    }],
                    privileges: Privilege.alias(privileges.reverse()[0]),
                    photoProfile: photoProfile,
                    email: email,
                    username: username,
                    name: name,
                    surname: surname,
                    cnpj: cnpj,
                    location: {
                        street: location['street'],
                        number: location['number'],
                        complement: location['complement'],
                        district: location['district'],
                        state: location['state'],
                        city: location['city'],
                        zipcode: location['zipcode']
                    }
                })
            })
            .catch(err => {
                return res.status(400).render('error', {
                    title: 'Grupo Mave Digital',
                    menus: [{
                        type: 'normal',
                        icon: 'rotate-ccw',
                        first: false,
                        enabled: true,
                        title: 'Voltar',
                        onclick: "gotoSystem()"
                    }],
                    message: 'A pagina não está disponível, tente novamente mais tarde!',
                    error: err
                });
            })
    } catch (err) {
        return res.status(400).render('error', {
            title: 'Grupo Mave Digital',
            menus: [{
                type: 'normal',
                icon: 'rotate-ccw',
                first: false,
                enabled: true,
                title: 'Voltar',
                onclick: "gotoSystem()"
            }],
            message: 'Ocorreu um erro com o servidor, tente novamente mais tarde!',
            error: err
        });
    }
});

/**
 * @description Pagina de Login
 */
router.get(['/auth'], async (req: Request, res: Response) => {
    return res.status(200).render('login', {
        title: 'Grupo Mave Digital',
        menus: [
            {
                type: 'normal',
                icon: 'power',
                first: true,
                enabled: true,
                title: 'Acessar',
                onclick: ""
            },
            {
                type: 'normal',
                icon: 'chevron-left',
                first: false,
                enabled: true,
                title: 'Voltar',
                onclick: 'home()'
            }
        ]
    })
});

/**
 * @description Pagina de configurações de segurança
 */
router.get(['/auth/security'], TokenMiddleware, async (req: Request, res: Response) => {
    let {
        token
    } = getReqProps(req, [
        'token'
    ]);

    try {
        const {
            auth,
            privileges
        } = token;

        userDB.getInfo(auth)
            .then((userInfo: UserInfo) => {
                const {
                    twofactor
                } = userInfo.authentication;

                return res.status(200).render('auth-security', {
                    title: 'Grupo Mave Digital',
                    router: 'Configurações/Segurança.',
                    privileges: Privilege.alias(privileges.reverse()[0]),
                    menus: [{
                        type: 'normal',
                        icon: 'shield',
                        first: true,
                        enabled: true,
                        title: 'Segurança',
                        onclick: ""
                    },
                    {
                        type: 'normal',
                        icon: 'chevron-left',
                        first: false,
                        enabled: true,
                        title: 'Voltar',
                        onclick: 'gotoSystem()'
                    }],
                    twofactor_enabled: twofactor.enabled
                })
            })
            .catch(err => {
                return res.status(400).send({
                    message: 'Grupo Mave Digital - Error!!!',
                    error: err
                })
            })
    } catch (err) {
        return res.status(400).send({
            message: 'Grupo Mave Digital - Error!!!',
            error: err
        });
    }
});

/**
 * @description Pagina de recuperação da conta(Quando usado autenticação de duas etapas)
 */
router.get(['/auth/security/retrieve/twofactor'], async (req: Request, res: Response) => {
    let {
        token
    } = getReqProps(req, [
        'token'
    ]);

    try {
        JsonWebToken.verify(token)
            .then((decoded: any) => {
                if (decoded['econfirm']) {
                    userDB.retrieve(decoded['auth'])
                        .then(() => {
                            return res.status(200).render('account-retrieve', {
                                'message': 'Sua conta foi recuperada, obrigado. Você já pode fechar essa janela!',
                                'menus': []
                            })
                        })
                        .catch(err => {
                            return res.status(400).render('account-retrieve', {
                                'message': 'Sua conta não pode ser recuperada. Fale com o administrador.',
                                'menus': [],
                                'error': err
                            })
                        })
                } else {
                    return res.status(400).render('account-retrieve', {
                        'message': 'Link de recuperação da conta está invalido!',
                        'menus': []
                    })
                }
            })
            .catch(err => {
                return res.status(400).render('account-retrieve', {
                    'message': 'Link de recuperação da conta está expirado. Solicite um novo email de recuperação da conta.',
                    'menus': [{
                        type: 'normal',
                        first: false,
                        enabled: true,
                        title: 'Voltar',
                        onclick: 'gotoSystem()'
                    }],
                    'error': err
                })
            });
    } catch (err) {
        return res.status(400).render('error', {
            title: 'Grupo Mave Digital',
            menus: [{
                type: 'normal',
                icon: 'rotate-ccw',
                first: false,
                enabled: true,
                title: 'Voltar',
                onclick: "gotoSystem()"
            }],
            message: 'Ocorreu um erro com o servidor, tente novamente mais tarde!',
            error: err
        });
    }
});

/**
 * @description Confirma o endereço de email
 */
router.get(['/email/confirm'], async (req: Request, res: Response) => {
    let {
        token
    } = getReqProps(req, [
        'token'
    ]);

    try {
        JsonWebToken.verify(token)
            .then((decoded: any) => {
                if (decoded['econfirm']) {
                    userDB.confirmEmail(decoded['auth'])
                        .then(() => {
                            return res.status(200).render('email-confirm', {
                                'title': 'Bem-vindo(a) a nossa plataforma digital!',
                                'message': 'Sua conta foi verificada, obrigado. Você já pode fechar essa janela!',
                                'menus': [{
                                    type: 'normal',
                                    icon: 'home',
                                    first: false,
                                    enabled: true,
                                    title: 'Home',
                                    onclick: "home()"
                                }]
                            })
                        })
                        .catch(err => {
                            return res.status(400).render('email-confirm', {
                                'title': 'Desculpe por isso!',
                                'message': 'Sua conta não pode ser verificada. Fale com o administrador.',
                                'menus': [{
                                    type: 'normal',
                                    icon: 'chevron-left',
                                    first: false,
                                    enabled: true,
                                    title: 'Voltar',
                                    onclick: 'home()'
                                }],
                                'error': err
                            })
                        })
                } else {
                    return res.status(400).render('email-confirm', {
                        'title': 'Talvez seja necessário pedir outro email para o administrador.',
                        'message': 'Link de confirmação da conta está invalido!',
                        'menus': [{
                            type: 'normal',
                            icon: 'chevron-left',
                            first: false,
                            enabled: true,
                            title: 'Voltar',
                            onclick: 'home()'
                        }],
                    })
                }
            })
            .catch(err => {
                return res.status(400).render('email-confirm', {
                    'title': 'Não se preocupe, você poderá ativar sua conta em outro momento.',
                    'message': 'Link de confirmação da conta está expirado. Solicite um novo email de confirmação da conta para o administrador.',
                    'menus': [{
                        type: 'normal',
                        icon: 'chevron-left',
                        first: false,
                        enabled: true,
                        title: 'Voltar',
                        onclick: 'home()'
                    }],
                    'error': err
                })
            });
    } catch (err) {
        return res.status(400).render('error', {
            title: 'Grupo Mave Digital',
            menus: [{
                type: 'normal',
                icon: 'rotate-ccw',
                first: false,
                enabled: true,
                title: 'Voltar',
                onclick: "home()"
            }],
            message: 'Ocorreu um erro com o servidor, tente novamente mais tarde!',
            error: err
        });
    }
});

router.get('/testing1', async (req, res) => {
    const user = await createUser();

    const { id, name, projects } = user;

    return res.status(200).send({
        user: {
            id, name, projects,
            now: new Date().toLocaleTimeString('pt-br')
        }
    });
});

router.get('/testing2/:userId', async (req, res) => {
    let {
        userId
    } = getReqProps(req, [
        'userId'
    ]);

    const user = await findUser(userId);

    const { name, preferredName, email, projects } = user;

    console.log('\n\n', 'VALUES: ', email, projects, '\n\n');

    return res.status(200).send({
        user: {
            name, preferredName, email, projects,
            now: new Date().toLocaleTimeString('pt-br')
        }
    });
});

router.get('/testing3/:projectName', async (req, res) => {
    let {
        projectName
    } = getReqProps(req, [
        'projectName'
    ]);

    const users = await findAllUserByProjectName(projectName);

    return res.status(200).send({ users });
});

router.get('/testing4/:userId', async (req, res) => {
    let {
        userId
    } = getReqProps(req, [
        'userId'
    ]);

    const remove = await removeUser(userId);

    return res.status(200).send({ remove });
});

router.get('/testing5/:userId/:name', async (req, res) => {
    let {
        userId,
        name
    } = getReqProps(req, [
        'userId',
        'name'
    ]);

    const project = await createProject(userId, name);

    return res.status(200).send({ project });
});

router.get('/testing6/:userId', async (req, res) => {
    let {
        userId,
    } = getReqProps(req, [
        'userId',
    ]);

    const project = await updateUser(userId);

    return res.status(200).send({ project });
});

/**
 * All *
 */
router.use(['*'], async (req, res) => {
    return res.status(404).render('error', {
        title: 'Grupo Mave Digital',
        menus: [{
            type: 'normal',
            icon: 'rotate-ccw',
            first: false,
            enabled: true,
            title: 'Voltar',
            onclick: "gotoSystem()"
        }],
        message: 'Página não encontrada 404',
        error: null
    });
});

export default function Router(app: any): void {
    app.use('/user', router);
}