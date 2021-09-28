/**
 * @description Rotas dos Cartões Digitais
 * @author @GuilhermeSantos001
 * @update 17/07/2021
 * @version 1.0.5
 */

import express, { Request, Response } from 'express';
import LZString from 'lz-string';

import cardsDB from '@/db/cards-db';
import TokenMiddleware from '@/middlewares/token-middleware';
import getReqProps from '@/utils/getReqProps';
import Privilege from '@/utils/privilege';
import BASE_URL from '@/utils/getBaseURL';

const router = express.Router({
    strict: true,
    caseSensitive: true
});

/**
 * @description Rota do painel de controle para o gerenciamento dos cartões digitais
 */
router.get(['/control'], TokenMiddleware, async (req: Request, res: Response) => {
    let {
        token
    } = getReqProps(req, [
        'token'
    ]);

    const
        { privileges } = token,
        cards = await cardsDB.get(0, 1, 10);

    if (!Privilege.staff(privileges))
        return res.status(400).render('error', {
            title: 'Grupo Mave Digital - Acesso Negado!',
            message: 'Você não tem privilégio para acessar a pagina.',
            path: 'cpanel',
            menus: [{
                type: 'normal',
                icon: 'rotate-ccw',
                first: false,
                enabled: true,
                title: 'Voltar',
                onclick: "gotoSystem()"
            }],
            error: ''
        })
    else
        return res.status(200).render('cards-control', {
            title: 'Grupo Mave Digital',
            router: 'Sistema/Cartões Digitais/Gerenciamento.',
            path: 'cpanel',
            privileges: Privilege.alias(privileges.reverse()[0]),
            baseurl: BASE_URL,
            cards,
            cardItems: cards.map(card => card.cid).join(','),
            cardsCompressData: LZString.compressToEncodedURIComponent(JSON.stringify(cards)),
            menus: [{
                type: 'normal',
                icon: 'layers',
                first: true,
                enabled: true,
                title: 'Gerenciamento',
                onclick: ""
            },
            {
                type: 'normal',
                icon: 'plus-square',
                first: false,
                enabled: true,
                title: 'Criar',
                onclick: "cards_register()"
            },
            {
                type: 'normal',
                icon: 'chevron-left',
                first: false,
                enabled: true,
                title: 'Voltar',
                onclick: 'gotoSystem()'
            }]
        })
});

/**
 * @description Rota para registrar um cartão digital
 */
router.get(['/register'], TokenMiddleware, async (req, res) => {
    let {
        token
    } = getReqProps(req, [
        'token'
    ]);

    const { privileges } = token;

    if (!Privilege.staff(privileges))
        return res.status(400).render('error', {
            title: 'Grupo Mave Digital - Acesso Negado!',
            message: 'Você não tem privilégio para acessar a pagina.',
            path: 'cpanel',
            menus: [{
                type: 'normal',
                icon: 'rotate-ccw',
                first: false,
                enabled: true,
                title: 'Voltar',
                onclick: "gotoSystem()"
            }],
            error: ''
        })
    else
        return res.status(200).render('cards-create', {
            title: 'Grupo Mave Digital',
            router: 'Sistema/Cartões Digitais/Criar.',
            privileges: Privilege.alias(privileges.reverse()[0]),
            path: 'cpanel',
            menus: [{
                type: 'normal',
                icon: 'plus-square',
                first: true,
                enabled: true,
                title: 'Criar',
                onclick: ""
            },
            {
                type: 'normal',
                icon: 'chevron-left',
                first: false,
                enabled: true,
                title: 'Voltar',
                onclick: 'cards_control()'
            }]
        })
});

/**
 * @description Rota para retornar o cartão digital
 */
router.get(['/card/', '/card', '/card/:id'], async (req, res) => {
    let {
        id
    } = getReqProps(req, [
        'id'
    ]);

    const
        cards = await cardsDB.get(0, 1, 1, { 'cid': id });

    if (cards.length <= 0)
        return res.status(400).render('error', {
            title: 'Grupo Mave Digital - Erro!',
            message: 'Não foi possível retornar as informações do cartão digital.',
            menus: [{
                type: 'normal',
                icon: 'home',
                first: false,
                enabled: true,
                title: 'Home',
                onclick: "home()"
            }],
            error: ''
        })

    let card = cards[0];

    return res.status(200).render('card-view', {
        title: 'Grupo Mave Digital - Cartão Digital',
        baseurl: BASE_URL,
        id: card['cid'],
        version: card['version'],
        photoPath: card['photo']['path'],
        photoName: card['photo']['name'],
        username: card['name'],
        jobtitle: card['jobtitle'],
        phone_1: card['phones'][0],
        phone_2: card['phones'][1],
        whatsapp_phone: card['whatsapp']['phone'],
        whatsapp_text: card['whatsapp']['text'],
        whatsapp_message: card['whatsapp']['message'],
        email: card['footer']['email'],
        location: card['footer']['location'],
        website: card['footer']['website'],
        socialmedia_youtube_link: card['footer']['socialmedia'][0]['value'],
        socialmedia_youtube_enabled: card['footer']['socialmedia'][0]['enabled'],
        socialmedia_linkedin_link: card['footer']['socialmedia'][1]['value'],
        socialmedia_linkedin_enabled: card['footer']['socialmedia'][1]['enabled'],
        socialmedia_instagram_link: card['footer']['socialmedia'][2]['value'],
        socialmedia_instagram_enabled: card['footer']['socialmedia'][2]['enabled'],
        socialmedia_facebook_link: card['footer']['socialmedia'][3]['value'],
        socialmedia_facebook_enabled: card['footer']['socialmedia'][3]['enabled'],
        attachment: card['footer']['attachment'],
        fileVCF: card.vcard.file?.name
    })
});

/**
 * @description Retorna a pagina de exibição dos cartões
 */
router.get(['/'], async (req, res) => {
    const
        cards = await cardsDB.get(0, 1, 10);

    return res.status(200).render('cards', {
        title: 'Grupo Mave Digital',
        router: 'Sistema/Cartões Digitais.',
        baseurl: BASE_URL,
        cards,
        menus: [{
            type: 'normal',
            icon: 'eye',
            first: true,
            enabled: true,
            title: 'Visualizar',
            onclick: ""
        },
        {
            type: 'normal',
            icon: 'chevron-left',
            first: false,
            enabled: true,
            title: 'Voltar',
            onclick: 'home()'
        }]
    })
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
    app.use('/cards', router);
}