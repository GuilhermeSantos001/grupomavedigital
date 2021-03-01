const express = require('express');
const router = express.Router({
  strict: true,
  caseSensitive: true
});
const middlewareToken = require('../middlewares/token');
const getReqProps = require('../modules/getReqProps');
const mongoDB = require('../modules/mongodb');
const vcard = require('../modules/vcard');
const compareObject = require('../modules/compareObject');

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
      router: 'Sistema/Cartões Digitais/Criar.',
      defaults: {

      },
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
        onclick: 'gotoSystem()'
      }]
    })
});


router.post('/register', middlewareToken, async (req, res) => {
  let {
    id,
    photo,
    name,
    jobtitle,
    phones,
    whatsapp,
    footer,
    socialmedia
  } = getReqProps(req, [
    'id',
    'photo',
    'name',
    'jobtitle',
    'phones',
    'whatsapp',
    'footer',
    'socialmedia'
  ]);

  try {
    /**
     * Validação dos parametros
     */
    if (
      typeof id != 'string' ||
      typeof photo != 'string' ||
      typeof name != 'string' ||
      typeof jobtitle != 'string' ||
      phones instanceof Array !== true ||
      typeof whatsapp != 'string' ||
      typeof footer != 'object' ||
      socialmedia instanceof Array !== true
    )
      return res.status(400).send('Grupo Mave Digital - Parameters values is not valid.');

    mongoDB.cards.register(
      id,
      photo,
      name,
      jobtitle,
      phones,
      whatsapp,
      footer,
      socialmedia
    )
      .then(details => res.status(200).send({
        message: 'Grupo Mave Digital - Success!!!',
        details
      }))
      .catch(err => res.status(400).send({
        message: 'Grupo Mave Digital - Error!!!',
        error: err
      }))
  } catch (err) {
    return res.status(400).send({
      message: 'Grupo Mave Digital - Error!!!',
      error: err
    });
  }
});

router.post('/vcard/register', middlewareToken, async (req, res) => {
  let {
    token,
    firstName,
    lastName,
    organization,
    photo,
    logo,
    workPhone,
    birthday,
    title,
    url,
    email,
    street,
    city,
    stateProvince,
    postalCode,
    socialUrls
  } = getReqProps(req, [
    'token',
    'firstName',
    'lastName',
    'organization',
    'photo',
    'logo',
    'workPhone',
    'birthday',
    'title',
    'url',
    'email',
    'street',
    'city',
    'stateProvince',
    'postalCode',
    'socialUrls'
  ]);

  try {
    /**
     * Validação dos parametros
     */
    if (
      !compareObject(token, { 'data': { 'privilege': '', 'auth': '', 'pass': '' }, 'iat': '', 'exp': '' }) ||
      typeof firstName !== 'string' ||
      typeof lastName !== 'string' ||
      typeof organization !== 'string' ||
      !compareObject(photo, { 'path': '', 'file': '' }) ||
      !compareObject(logo, { 'path': '', 'file': '' }) ||
      !workPhone instanceof Array ||
      !compareObject(birthday, { 'year': '', 'month': '', 'day': '' }) ||
      typeof title !== 'string' ||
      typeof url !== 'string' ||
      typeof email !== 'string' ||
      typeof street !== 'string' ||
      typeof city !== 'string' ||
      typeof stateProvince !== 'string' ||
      typeof postalCode !== 'string' ||
      !socialUrls instanceof Array
    )
      return res.status(400).send('Grupo Mave Digital - Parameters values is not valid.');

    const { privilege } = token['data'];

    if (!privilege) {
      return res.status(401).send({
        message: 'Grupo Mave Digital - Você não tem autorização para acessar essa rota!',
        error: `Seu Nível de acesso: ${privilege}.`
      });
    }

    return vcard((filename => res.status(200).send(filename)), {
      firstName,
      lastName,
      organization,
      workPhone,
      birthday,
      title,
      url,
      email,
      street,
      city,
      stateProvince,
      postalCode,
      socialUrls
    }, logo, photo);
  } catch (err) {
    return res.status(400).send({
      message: 'Grupo Mave Digital - Error!!!',
      error: err
    });
  }
});

router.use(['*'], async (req, res) => {
  return res.status(404).send('API CARD PRIME - This route not exist.');
});

module.exports = (app) => app.use('/cards', router);