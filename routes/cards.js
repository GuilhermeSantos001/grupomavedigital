const express = require('express');
const router = express.Router({
  strict: true,
  caseSensitive: true
});
const middlewareToken = require('../middlewares/token');
const getReqProps = require('../modules/getReqProps');
const mongodb = require('../modules/mongodb');
const LZString = require('lz-string');

router.get(['/control'], middlewareToken, async (req, res) => {
  let {
    token
  } = getReqProps(req, [
    'token'
  ]);

  const
    { privilege } = token['data'],
    { cards } = await mongodb.cards.get();

  if (privilege !== 'administrador' && privilege !== 'moderador')
    return res.status(400).render('error', {
      title: 'Grupo Mave Digital - Acesso Negado!',
      message: 'Você não tem privilégio para acessar a pagina.',
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
      privilege,
      baseurl: `http://${process.env.APP_ADDRESS}:${process.env.APP_PORT}`,
      cards,
      cardItems: cards.map(card => card['id']).join(','),
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

router.get(['/register'], middlewareToken, async (req, res) => {
  let {
    token
  } = getReqProps(req, [
    'token'
  ]);

  const { privilege } = token['data'];

  if (privilege !== 'administrador' && privilege !== 'moderador')
    return res.status(400).render('error', {
      title: 'Grupo Mave Digital - Acesso Negado!',
      message: 'Você não tem privilégio para acessar a pagina.',
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
      privilege,
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

router.get(['/card/', '/card', '/card/:id'], async (req, res) => {
  let {
    id
  } = getReqProps(req, [
    'id'
  ]);

  const
    { cards } = await mongodb.cards.get('id', id);

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
  else
    var card = cards[0];

  return res.status(200).render('card-view', {
    title: 'Grupo Mave Digital - Cartão Digital',
    baseurl: `http://${process.env.APP_ADDRESS}:${process.env.APP_PORT}`,
    id: card['id'],
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
    fileVCF: card['vcard']['file']['name']
  })
});

router.get(['/'], async (req, res) => {
  const
    { cards } = await mongodb.cards.get();

  return res.status(200).render('cards', {
    title: 'Grupo Mave Digital',
    router: 'Sistema/Cartões Digitais.',
    baseurl: `http://${process.env.APP_ADDRESS}:${process.env.APP_PORT}`,
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

module.exports = (app) => app.use('/cards', router);