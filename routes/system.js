const express = require('express');
const router = express.Router({
  strict: true,
  caseSensitive: true
});
const middlewareAPI = require('../middlewares/api');
const middlewareToken = require('../middlewares/token');
const getReqProps = require('../modules/getReqProps');
const mongoDB = require('../modules/mongodb');
const nodemailer = require('../modules/nodemailer');
const LZString = require('lz-string');
const pdf = require('../modules/pdf');
const mongodb = require('../modules/mongodb');

/**
 * Estados
 */
router.get(['/states'], middlewareAPI, async (req, res) => {
  let {
    country,
    dataFilter
  } = getReqProps(req, [
    'country',
    'dataFilter'
  ]);

  try {
    /**
     * Validação dos parametros
     */

    if (!dataFilter) dataFilter = '';

    if (
      typeof country != 'string'
    )
      return res.status(400).send('Grupo Mave Digital - Parameters values is not valid.');

    mongoDB.states.get(
      'country',
      country,
      dataFilter
    )
      .then(data => {
        return res.status(200).send({
          message: 'Grupo Mave Digital - Success!!!',
          data
        })
      })
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

router.post(['/states/register'], middlewareAPI, async (req, res) => {
  let {
    name,
    cities
  } = getReqProps(req, [
    'name',
    'cities'
  ]);

  try {
    /**
     * Validação dos parametros
     */

    if (
      typeof name != 'string' ||
      cities instanceof Array === false
    )
      return res.status(400).send('Grupo Mave Digital - Parameters values is not valid.');

    mongoDB.states.register(
      name,
      cities
    )
      .then(data => {
        return res.status(200).send({
          message: 'Grupo Mave Digital - Success!!!',
          data
        })
      })
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

/**
 * Administrador
 */
router.get(['/admin'], middlewareToken, async (req, res) => {
  let {
    token,
  } = getReqProps(req, [
    'token'
  ]);

  try {
    const privilege = token['data']['privilege'];

    if (privilege != 'administrator') {
      return res.status(400).render('error', {
        title: 'Grupo Mave Digital - Error!!!',
        message: 'Você não tem privilégio para acessar a pagina.',
        path: false,
        menus: [{
          type: 'normal',
          icon: 'rotate-ccw',
          first: false,
          enabled: true,
          title: 'Voltar',
          onclick: "gotoSystem()"
        }],
        error: ''
      });
    }

    let users;

    mongoDB.users.get()
      .then(response => {
        users = response['users'] != undefined ? response['users'] : response['user'];

        return res.status(200).render('administrator', {
          title: 'Grupo Mave Digital',
          menus: [{
            type: 'normal',
            first: true,
            enabled: true,
            title: 'Gestão Administrativa',
            onclick: ""
          }, {
            type: 'normal',
            first: false,
            enabled: true,
            title: 'Voltar',
            onclick: 'gotoSystem()'
          }],
          docs: users.map(user => {
            return {
              user: {
                name: `${user['name']} ${user['surname']}`,
                auth: user['auth']
              },
              data: user['docs']
            }
          }),
          docsCount: users.filter(user => {
            if (Object.keys(user['docs']).length > 0) {
              return Object.keys(user['docs']).filter(key => user['docs'][key]['reading'] === 'pending').length > 0
            } else {
              return false;
            }
          })
        })
      })
      .catch(err => res.status(400).render('error', {
        title: 'Grupo Mave Digital - Error!!!',
        message: err[0],
        path: false,
        menus: [{
          type: 'normal',
          icon: 'rotate-ccw',
          first: false,
          enabled: true,
          title: 'Voltar',
          onclick: "gotoSystem()"
        }],
        error: err
      }))
  } catch (err) {
    return res.status(400).render('error', {
      title: 'Grupo Mave Digital - Error!!!',
      message: err,
      path: false,
      menus: [{
        type: 'normal',
        icon: 'rotate-ccw',
        first: false,
        enabled: true,
        title: 'Voltar',
        onclick: "gotoSystem()"
      }],
      error: err
    });
  }
});

router.get(['/admin/docs/download'], middlewareToken, async (req, res) => {
  let {
    token,
    authorization,
    docname
  } = getReqProps(req, [
    'token',
    'authorization',
    'docname'
  ]);

  try {
    const privilege = token['data']['privilege'];

    if (privilege != 'administrator') {
      return res.status(400).send({
        title: 'Grupo Mave Digital - Error!!!',
        message: 'Você não tem privilégio para acessar a pagina.'
      });
    }

    /**
     * Validação dos parametros
     */
    if (
      typeof authorization != 'string',
      typeof docname != 'string'
    )
      return res.status(400).send('Grupo Mave Digital - Parameters values is not valid.');

    const
      path = require('../modules/localPath'),
      fs = require('fs'),
      folder = path.localPath('public/docs'),
      fileName = `${String(authorization).toLowerCase()} ${String(docname).toLowerCase()}`;

    if (!fs.existsSync(folder)) fs.mkdirSync(folder);

    let file = `${folder}\\${String(fileName).replace(/\s{1,}/g, '_').toLowerCase()}.pdf`;

    if (fs.existsSync(file)) {
      return res.download(file);
    } else {
      return res.status(400).send({
        message: 'Grupo Mave Digital - Error!!!',
        error: `Arquivo ${fileName} não foi encontrado no servidor.`
      });
    }
  } catch (err) {
    return res.status(400).send({
      title: 'Grupo Mave Digital - Error!!!',
      message: err
    });
  }
});

/**
 * Clientes
 */
router.get(['/clients'], middlewareToken, async (req, res) => {
  try {
    let clients;

    mongoDB.clients.get()
      .then(response => {
        clients = response['clients'];

        return res.status(200).render('clients', {
          title: 'Grupo Mave Digital',
          menus: [{
            type: 'normal',
            first: true,
            enabled: true,
            title: 'Gestão de Clientes',
            onclick: ""
          }, {
            type: 'normal',
            first: false,
            enabled: true,
            title: 'Cadastrar',
            onclick: "register()"
          }, {
            type: 'normal',
            first: false,
            enabled: true,
            title: 'Voltar',
            onclick: 'gotoSystem()'
          }],
          clients
        })
      })
      .catch(err => res.status(400).render('error', {
        title: 'Grupo Mave Digital - Error!!!',
        message: err[0],
        path: '/clients',
        menus: [{
          type: 'normal',
          icon: 'rotate-ccw',
          first: false,
          enabled: true,
          title: 'Voltar',
          onclick: "gotoSystem()"
        }],
        error: err
      }))
  } catch (err) {
    return res.status(400).render('error', {
      title: 'Grupo Mave Digital - Error!!!',
      message: err,
      path: '/clients',
      menus: [{
        type: 'normal',
        icon: 'rotate-ccw',
        first: false,
        enabled: true,
        title: 'Voltar',
        onclick: "gotoSystem()"
      }],
      error: err
    });
  }
});

router.get(['/clients/register'], middlewareToken, async (req, res) => {
  try {
    let clients, states, cities;

    mongoDB.states.get('country', 'brasil', ['states', 'cities'])
      .then(response => {
        states = response.data['states'];
        cities = response.data['cities'];

        mongoDB.clients.get()
          .then(response => {
            clients = response['clients'];

            return res.status(200).render('clients-cadastro', {
              title: 'Grupo Mave Digital',
              menus: [{
                type: 'normal',
                first: true,
                enabled: true,
                title: 'Cadastrar Cliente',
                onclick: ""
              }, {
                type: 'normal',
                first: false,
                enabled: true,
                title: 'Salvar',
                onclick: 'send()'
              }, {
                type: 'normal',
                first: false,
                enabled: true,
                title: 'Voltar',
                onclick: 'gotoSystem()'
              }],
              clients: LZString.compressToBase64(JSON.stringify(clients)),
              cities: LZString.compressToBase64(JSON.stringify(cities)),
              states
            })
          })
          .catch(err => res.status(400).render('error', {
            title: 'Grupo Mave Digital - Error!!!',
            message: err[0],
            path: '/clients',
            menus: [{
              type: 'normal',
              icon: 'rotate-ccw',
              first: false,
              enabled: true,
              title: 'Voltar',
              onclick: "gotoSystem()"
            }],
            error: err
          }))
      })
      .catch(err => res.status(400).render('error', {
        title: 'Grupo Mave Digital - Error!!!',
        message: err[0],
        path: '/clients',
        menus: [{
          type: 'normal',
          icon: 'rotate-ccw',
          first: false,
          enabled: true,
          title: 'Voltar',
          onclick: "gotoSystem()"
        }],
        error: err
      }))
  } catch (err) {
    return res.status(400).render('error', {
      title: 'Grupo Mave Digital - Error!!!',
      message: err,
      path: '/clients',
      menus: [{
        type: 'normal',
        icon: 'rotate-ccw',
        first: false,
        enabled: true,
        title: 'Voltar',
        onclick: "gotoSystem()"
      }],
      error: err
    });
  }
});

router.post(['/clients/register'], middlewareToken, async (req, res) => {
  let {
    id,
    person,
    name,
    costcenter,
    cpfcnpj,
    location,
    phone,
    phone2,
    contact,
    email
  } = getReqProps(req, [
    'id',
    'person',
    'name',
    'costcenter',
    'cpfcnpj',
    'location',
    'phone',
    'phone2',
    'contact',
    'email'
  ]);

  try {
    /**
     * Validação dos parametros
     */
    if (
      typeof id != 'string' ||
      typeof person != 'string' ||
      typeof name != 'string' ||
      typeof costcenter != 'string' ||
      typeof cpfcnpj != 'string' ||
      typeof location != 'object' ||
      typeof phone != 'string' ||
      typeof phone2 != 'string' ||
      typeof contact != 'string' ||
      typeof email != 'string'
    )
      return res.status(400).send('Grupo Mave Digital - Parameters values is not valid.');

    mongoDB.clients.register(
      id,
      person,
      name,
      costcenter,
      cpfcnpj,
      location,
      phone,
      phone2,
      contact,
      email
    )
      .then(data => res.status(200).send({
        message: 'Grupo Mave Digital - Success!!!',
        data
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

router.post(['/clients/update'], middlewareToken, async (req, res) => {
  let {
    id,
    person,
    name,
    costcenter,
    cpfcnpj,
    location,
    phone,
    phone2,
    contact,
    email
  } = getReqProps(req, [
    'id',
    'person',
    'name',
    'costcenter',
    'cpfcnpj',
    'location',
    'phone',
    'phone2',
    'contact',
    'email'
  ]);

  try {
    /**
     * Validação dos parametros
     */
    if (
      typeof id != 'string' ||
      typeof person != 'string' ||
      typeof name != 'string' ||
      typeof costcenter != 'string' ||
      typeof cpfcnpj != 'string' ||
      typeof location != 'object' ||
      typeof phone != 'string' ||
      typeof phone2 != 'string' ||
      typeof contact != 'string' ||
      typeof email != 'string'
    )
      return res.status(400).send('Grupo Mave Digital - Parameters values is not valid.');

    mongoDB.clients.update(id, {
      person,
      name,
      costcenter,
      cpfcnpj,
      location,
      phone,
      phone2,
      contact,
      email
    })
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

router.post(['/clients/inactive'], middlewareToken, async (req, res) => {
  let {
    id,
    reason,
    measure
  } = getReqProps(req, [
    'id',
    'reason',
    'measure'
  ]);

  try {
    /**
     * Validação dos parametros
     */
    if (
      typeof id != 'string' ||
      typeof reason != 'string' ||
      typeof measure != 'string'
    )
      return res.status(400).send('Grupo Mave Digital - Parameters values is not valid.');

    mongoDB.clients.inactive(id, reason, measure)
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

router.post(['/clients/inactive/resolutions'], middlewareToken, async (req, res) => {
  let {
    id,
    resolution
  } = getReqProps(req, [
    'id',
    'resolution'
  ]);

  try {
    /**
     * Validação dos parametros
     */
    if (
      typeof id != 'string' ||
      typeof resolution != 'string'
    )
      return res.status(400).send('Grupo Mave Digital - Parameters values is not valid.');

    mongoDB.clients.sendResolution(id, LZString.compressToBase64(resolution))
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

router.post(['/clients/inactive/closingdate'], middlewareToken, async (req, res) => {
  let {
    id,
    closingdate
  } = getReqProps(req, [
    'id',
    'closingdate'
  ]);

  try {
    /**
     * Validação dos parametros
     */
    if (
      typeof id != 'string' ||
      typeof closingdate != 'string'
    )
      return res.status(400).send('Grupo Mave Digital - Parameters values is not valid.');

    mongoDB.clients.sendClosingdate(id, closingdate)
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

router.post(['/clients/inactive/resolutions/remove'], middlewareToken, async (req, res) => {
  let {
    id,
    resolutionIndexOf
  } = getReqProps(req, [
    'id',
    'resolutionIndexOf'
  ]);

  try {
    /**
     * Validação dos parametros
     */
    if (
      typeof id != 'string' ||
      typeof resolutionIndexOf != 'number'
    )
      return res.status(400).send('Grupo Mave Digital - Parameters values is not valid.');

    mongoDB.clients.removeResolution(id, resolutionIndexOf)
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

router.get(['/clients/edit/:id'], middlewareToken, async (req, res) => {
  let {
    id
  } = getReqProps(req, [
    'id'
  ]);

  try {
    /**
     * Validação dos parametros
     */
    if (
      typeof id != 'string'
    )
      return res.status(400).send('Grupo Mave Digital - Parameters values is not valid.');

    let client, states, cities;

    mongoDB.states.get('country', 'brasil', ['states', 'cities'])
      .then(response => {
        states = response.data['states'];
        cities = response.data['cities'];

        mongoDB.clients.get('id', id)
          .then(response => {
            client = response['clients'];

            return res.status(200).render('clients-edit', {
              title: 'Grupo Mave Digital',
              menus: [{
                type: 'normal',
                first: true,
                enabled: true,
                title: 'Atualizar Cliente',
                onclick: ""
              }, {
                type: 'normal',
                first: false,
                enabled: true,
                title: 'Atualizar',
                onclick: 'send()'
              }, {
                type: 'normal',
                first: false,
                enabled: true,
                title: 'Voltar',
                onclick: 'gotoSystem()'
              }],
              client: LZString.compressToBase64(JSON.stringify(client[0])),
              cities: LZString.compressToBase64(JSON.stringify(cities)),
              states
            })
          })
          .catch(err => res.status(400).render('error', {
            title: 'Grupo Mave Digital - Error!!!',
            message: err[0],
            path: '/clients',
            menus: [{
              type: 'normal',
              icon: 'rotate-ccw',
              first: false,
              enabled: true,
              title: 'Voltar',
              onclick: "gotoSystem()"
            }],
            error: err
          }))
      })
      .catch(err => res.status(400).render('error', {
        title: 'Grupo Mave Digital - Error!!!',
        message: err[0],
        path: '/clients',
        menus: [{
          type: 'normal',
          icon: 'rotate-ccw',
          first: false,
          enabled: true,
          title: 'Voltar',
          onclick: "gotoSystem()"
        }],
        error: err
      }))
  } catch (err) {
    return res.status(400).render('error', {
      title: 'Grupo Mave Digital - Error!!!',
      message: err,
      path: '/clients',
      menus: [{
        type: 'normal',
        icon: 'rotate-ccw',
        first: false,
        enabled: true,
        title: 'Voltar',
        onclick: "gotoSystem()"
      }],
      error: err
    });
  }
});

router.get(['/clients/inactive/:id'], middlewareToken, async (req, res) => {
  let {
    id
  } = getReqProps(req, [
    'id'
  ]);

  try {
    /**
     * Validação dos parametros
     */
    if (
      typeof id != 'string'
    )
      return res.status(400).send('Grupo Mave Digital - Parameters values is not valid.');

    let client;

    mongoDB.clients.get('id', id)
      .then(response => {
        client = response['clients'];

        return res.status(200).render('clients-inactive', {
          title: 'Grupo Mave Digital',
          menus: [{
            type: 'normal',
            first: true,
            enabled: true,
            title: 'Inativar Cliente',
            onclick: ""
          }, {
            type: 'normal',
            first: false,
            enabled: true,
            title: 'Confirmar',
            onclick: 'send()'
          }, {
            type: 'normal',
            first: false,
            enabled: true,
            title: 'Voltar',
            onclick: 'gotoSystem()'
          }],
          client: client[0],
          reasons: [
            'Encerramento do contrato por inadimplência',
            'Encerramento do contrato por tempo contratual',
            'Cancelamento do contrato por determinação do cliente'
          ],
          measures: [
            'Acordo de pagamento das faturas em aberto',
            'Reativação do cliente em x anos',
            'Renovação contratual'
          ]
        })
      })
      .catch(err => res.status(400).render('error', {
        title: 'Grupo Mave Digital - Error!!!',
        message: err[0],
        path: '/clients',
        menus: [{
          type: 'normal',
          icon: 'rotate-ccw',
          first: false,
          enabled: true,
          title: 'Voltar',
          onclick: "gotoSystem()"
        }],
        error: err
      }))
  } catch (err) {
    return res.status(400).render('error', {
      title: 'Grupo Mave Digital - Error!!!',
      message: err,
      path: '/clients',
      menus: [{
        type: 'normal',
        icon: 'rotate-ccw',
        first: false,
        enabled: true,
        title: 'Voltar',
        onclick: "gotoSystem()"
      }],
      error: err
    });
  }
});

router.post(['/clients/reactivate'], middlewareToken, async (req, res) => {
  let {
    id
  } = getReqProps(req, [
    'id'
  ]);

  try {
    /**
     * Validação dos parametros
     */
    if (
      typeof id != 'string'
    )
      return res.status(400).send('Grupo Mave Digital - Parameters values is not valid.');

    mongoDB.clients.reactivate(id)
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

router.get(['/clients/inactive/resolutions/:id'], middlewareToken, async (req, res) => {
  let {
    id
  } = getReqProps(req, [
    'id'
  ]);

  try {
    /**
     * Validação dos parametros
     */
    if (
      typeof id != 'string'
    )
      return res.status(400).send('Grupo Mave Digital - Parameters values is not valid.');

    let client;

    mongoDB.clients.get('id', id)
      .then(response => {
        client = response['clients'][0];

        return res.status(200).render('clients-resolutions', {
          title: 'Grupo Mave Digital',
          menus: [{
            type: 'normal',
            first: true,
            enabled: true,
            title: 'Resolução da Inativação do Cliente',
            onclick: ""
          }, {
            type: 'normal',
            first: false,
            enabled: true,
            title: 'Voltar',
            onclick: 'gotoSystem()'
          }],
          clientId: client['id'],
          client: client,
          resolutionId: 0,
          resolutions: client['inactive']['resolution'],
          closingdate: client['inactive']['closingdate']
        })
      })
      .catch(err => res.status(400).render('error', {
        title: 'Grupo Mave Digital - Error!!!',
        message: err[0],
        path: '/clients',
        menus: [{
          type: 'normal',
          icon: 'rotate-ccw',
          first: false,
          enabled: true,
          title: 'Voltar',
          onclick: "gotoSystem()"
        }],
        error: err
      }))
  } catch (err) {
    return res.status(400).render('error', {
      title: 'Grupo Mave Digital - Error!!!',
      message: err,
      path: '/clients',
      menus: [{
        type: 'normal',
        icon: 'rotate-ccw',
        first: false,
        enabled: true,
        title: 'Voltar',
        onclick: "gotoSystem()"
      }],
      error: err
    });
  }
});

/**
 * Aliquots
 */
router.get(['/aliquots'], middlewareToken, async (req, res) => {
  try {
    let aliquots;

    mongoDB.aliquots.get()
      .then(response => {
        aliquots = response['aliquots'];

        return res.status(200).render('aliquots', {
          title: 'Grupo Mave Digital',
          menus: [{
            type: 'normal',
            first: true,
            enabled: true,
            title: 'Gestão de Alíquotas',
            onclick: ""
          }, {
            type: 'normal',
            first: false,
            enabled: true,
            title: 'Cadastrar',
            onclick: 'register()'
          }, {
            type: 'normal',
            first: false,
            enabled: true,
            title: 'Voltar',
            onclick: 'gotoSystem()'
          }],
          aliquots,
          aliquotslength: aliquots.length
        })
      })
      .catch(err => res.status(400).render('error', {
        title: 'Grupo Mave Digital - Error!!!',
        message: err[0],
        path: '/aliquots',
        menus: [{
          type: 'normal',
          icon: 'rotate-ccw',
          first: false,
          enabled: true,
          title: 'Voltar',
          onclick: "gotoSystem()"
        }],
        error: err
      }))
  } catch (err) {
    return res.status(400).render('error', {
      title: 'Grupo Mave Digital - Error!!!',
      message: err,
      path: '/aliquots',
      menus: [{
        type: 'normal',
        icon: 'rotate-ccw',
        first: false,
        enabled: true,
        title: 'Voltar',
        onclick: "gotoSystem()"
      }],
      error: err
    });
  }
});

router.get(['/aliquots/register'], middlewareToken, async (req, res) => {
  try {
    let aliquots, {
      data
    } = await mongoDB.states.get('country', 'brasil', ['states', 'cities']);

    const {
      cities,
      states
    } = data;

    mongoDB.aliquots.get()
      .then(response => {
        aliquots = response['aliquots'];

        return res.status(200).render('aliquots-register', {
          title: 'Grupo Mave Digital',
          menus: [{
            type: 'normal',
            first: true,
            enabled: true,
            title: 'Cadastrar Alíquota',
            onclick: ""
          }, {
            type: 'normal',
            first: false,
            enabled: true,
            title: 'Salvar',
            onclick: 'send()'
          }, {
            type: 'normal',
            first: false,
            enabled: true,
            title: 'Voltar',
            onclick: 'gotoSystem()'
          }],
          aliquots: LZString.compressToBase64(JSON.stringify(aliquots)),
          cities: LZString.compressToBase64(JSON.stringify(cities)),
          states
        })
      })
      .catch(err => res.status(400).render('error', {
        title: 'Grupo Mave Digital - Error!!!',
        message: err[0],
        path: '/aliquots',
        menus: [{
          type: 'normal',
          icon: 'rotate-ccw',
          first: false,
          enabled: true,
          title: 'Voltar',
          onclick: "gotoSystem()"
        }],
        error: err
      }))
  } catch (err) {
    return res.status(400).render('error', {
      title: 'Grupo Mave Digital - Error!!!',
      message: err,
      path: '/aliquots',
      menus: [{
        type: 'normal',
        icon: 'rotate-ccw',
        first: false,
        enabled: true,
        title: 'Voltar',
        onclick: "gotoSystem()"
      }],
      error: err
    });
  }
});

router.post(['/aliquots/register'], middlewareToken, async (req, res) => {
  let {
    percentage,
    city,
    code,
    state
  } = getReqProps(req, [
    'percentage',
    'city',
    'code',
    'state'
  ]);

  try {
    /**
     * Validação dos parametros
     */
    if (
      typeof percentage != 'number' ||
      typeof city != 'string' ||
      typeof code != 'number' ||
      typeof state != 'string'
    )
      return res.status(400).send('Grupo Mave Digital - Parameters values is not valid.');

    mongoDB.aliquots.register(
      percentage,
      city,
      code,
      state
    )
      .then(data => res.status(200).send({
        message: 'Grupo Mave Digital - Success!!!',
        data
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

router.get(['/aliquots/edit/:id'], middlewareToken, async (req, res) => {
  let {
    id
  } = getReqProps(req, [
    'id'
  ]);

  try {
    /**
     * Validação dos parametros
     */
    if (
      typeof id != 'string'
    )
      return res.status(400).send('Grupo Mave Digital - Parameters values is not valid.');

    let aliquots, {
      data
    } = await mongoDB.states.get('country', 'brasil', ['states', 'cities']);

    const {
      cities,
      states
    } = data;

    mongoDB.aliquots.get('_id', id)
      .then(response => {
        aliquots = response['aliquots'];

        return res.status(200).render('aliquots-edit', {
          title: 'Grupo Mave Digital',
          menus: [{
            type: 'normal',
            first: true,
            enabled: true,
            title: 'Atualizar Alíquota',
            onclick: ""
          }, {
            type: 'normal',
            first: false,
            enabled: true,
            title: 'Atualizar',
            onclick: 'send()'
          }, {
            type: 'normal',
            first: false,
            enabled: true,
            title: 'Voltar',
            onclick: 'gotoSystem()'
          }],
          aliquot: LZString.compressToBase64(JSON.stringify(aliquots[0])),
          cities: LZString.compressToBase64(JSON.stringify(cities)),
          states
        })
      })
      .catch(err => res.status(400).render('error', {
        title: 'Grupo Mave Digital - Error!!!',
        message: err[0],
        path: '/aliquots',
        menus: [{
          type: 'normal',
          icon: 'rotate-ccw',
          first: false,
          enabled: true,
          title: 'Voltar',
          onclick: "gotoSystem()"
        }],
        error: err
      }))
  } catch (err) {
    return res.status(400).render('error', {
      title: 'Grupo Mave Digital - Error!!!',
      message: err,
      path: '/aliquots',
      menus: [{
        type: 'normal',
        icon: 'rotate-ccw',
        first: false,
        enabled: true,
        title: 'Voltar',
        onclick: "gotoSystem()"
      }],
      error: err
    });
  }
});

router.post(['/aliquots/update'], middlewareToken, async (req, res) => {
  let {
    prevpercentage,
    percentage,
    state,
    city,
    code
  } = getReqProps(req, [
    'prevpercentage',
    'percentage',
    'state',
    'city',
    'code'
  ]);

  try {
    /**
     * Validação dos parametros
     */
    if (
      typeof prevpercentage != 'number' ||
      typeof percentage != 'number' ||
      typeof code != 'number' ||
      typeof state != 'string' ||
      typeof city != 'string'
    )
      return res.status(400).send('Grupo Mave Digital - Parameters values is not valid.');

    mongoDB.aliquots.update(state, city, code, prevpercentage, {
      percentage
    })
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

router.post(['/aliquots/remove'], middlewareToken, async (req, res) => {
  let {
    percentage,
    state,
    city,
    code
  } = getReqProps(req, [
    'percentage',
    'state',
    'city',
    'code'
  ]);

  try {
    /**
     * Validação dos parametros
     */
    if (
      typeof percentage != 'number' ||
      typeof city != 'string' ||
      typeof code != 'number' ||
      typeof state != 'string'
    )
      return res.status(400).send('Grupo Mave Digital - Parameters values is not valid.');

    mongoDB.aliquots.remove(percentage, city, code, state)
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

/**
 * Esocial
 */
router.get(['/esocial'], middlewareToken, async (req, res) => {
  try {
    let esocial;

    mongoDB.esocial.get()
      .then(response => {
        esocial = response['esocial'];

        return res.status(200).render('esocial', {
          title: 'Grupo Mave Digital',
          menus: [{
            type: 'normal',
            first: true,
            enabled: true,
            title: 'Gestão de Encargos Sociais',
            onclick: ""
          }, {
            type: 'normal',
            first: false,
            enabled: true,
            title: 'Cadastrar',
            onclick: 'register()'
          }, {
            type: 'normal',
            first: false,
            enabled: true,
            title: 'Voltar',
            onclick: 'gotoSystem()'
          }],
          esocial,
          esociallength: esocial.length
        })
      })
      .catch(err => res.status(400).render('error', {
        title: 'Grupo Mave Digital - Error!!!',
        message: err[0],
        path: '/esocial',
        menus: [{
          type: 'normal',
          icon: 'rotate-ccw',
          first: false,
          enabled: true,
          title: 'Voltar',
          onclick: "gotoSystem()"
        }],
        error: err
      }))
  } catch (err) {
    return res.status(400).render('error', {
      title: 'Grupo Mave Digital - Error!!!',
      message: err,
      path: '/esocial',
      menus: [{
        type: 'normal',
        icon: 'rotate-ccw',
        first: false,
        enabled: true,
        title: 'Voltar',
        onclick: "gotoSystem()"
      }],
      error: err
    });
  }
});

router.get(['/esocial/register'], middlewareToken, async (req, res) => {
  try {
    return res.status(200).render('esocial-register', {
      title: 'Grupo Mave Digital',
      menus: [{
        type: 'normal',
        first: true,
        enabled: true,
        title: 'Cadastrar Encargo Social',
        onclick: ""
      }, {
        type: 'normal',
        first: false,
        enabled: true,
        title: 'Salvar',
        onclick: 'send()'
      }, {
        type: 'normal',
        first: false,
        enabled: true,
        title: 'Voltar',
        onclick: 'gotoSystem()'
      }]
    })
  } catch (err) {
    return res.status(400).render('error', {
      title: 'Grupo Mave Digital - Error!!!',
      message: err,
      path: '/esocial',
      menus: [{
        type: 'normal',
        icon: 'rotate-ccw',
        first: false,
        enabled: true,
        title: 'Voltar',
        onclick: "gotoSystem()"
      }],
      error: err
    });
  }
});

router.post(['/esocial/register'], middlewareToken, async (req, res) => {
  let {
    description,
    percentage
  } = getReqProps(req, [
    'description',
    'percentage'
  ]);

  try {
    /**
     * Validação dos parametros
     */
    if (
      typeof description != 'string' ||
      typeof percentage != 'number'
    )
      return res.status(400).send('Grupo Mave Digital - Parameters values is not valid.');

    mongoDB.esocial.register(
      description,
      percentage
    )
      .then(data => res.status(200).send({
        message: 'Grupo Mave Digital - Success!!!',
        data
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

router.get(['/esocial/edit/:id'], middlewareToken, async (req, res) => {
  let {
    id
  } = getReqProps(req, [
    'id'
  ]);

  try {
    /**
     * Validação dos parametros
     */
    if (
      typeof id != 'string'
    )
      return res.status(400).send('Grupo Mave Digital - Parameters values is not valid.');

    let esocial;

    mongoDB.esocial.get('_id', id)
      .then(response => {
        esocial = response['esocial'];

        return res.status(200).render('esocial-edit', {
          title: 'Grupo Mave Digital',
          menus: [{
            type: 'normal',
            first: true,
            enabled: true,
            title: 'Atualizar Encargo Social',
            onclick: ""
          }, {
            type: 'normal',
            first: false,
            enabled: true,
            title: 'Atualizar',
            onclick: 'send()'
          }, {
            type: 'normal',
            first: false,
            enabled: true,
            title: 'Voltar',
            onclick: 'gotoSystem()'
          }],
          esocial: LZString.compressToBase64(JSON.stringify(esocial[0]))
        })
      })
      .catch(err => res.status(400).render('error', {
        title: 'Grupo Mave Digital - Error!!!',
        message: err[0],
        path: '/esocial',
        menus: [{
          type: 'normal',
          icon: 'rotate-ccw',
          first: false,
          enabled: true,
          title: 'Voltar',
          onclick: "gotoSystem()"
        }],
        error: err
      }))
  } catch (err) {
    return res.status(400).render('error', {
      title: 'Grupo Mave Digital - Error!!!',
      message: err,
      path: '/esocial',
      menus: [{
        type: 'normal',
        icon: 'rotate-ccw',
        first: false,
        enabled: true,
        title: 'Voltar',
        onclick: "gotoSystem()"
      }],
      error: err
    });
  }
});

router.post(['/esocial/update'], middlewareToken, async (req, res) => {
  let {
    description,
    percentage
  } = getReqProps(req, [
    'description',
    'percentage'
  ]);

  try {
    /**
     * Validação dos parametros
     */
    if (
      typeof description != 'string' ||
      typeof percentage != 'number'
    )
      return res.status(400).send('Grupo Mave Digital - Parameters values is not valid.');

    mongoDB.esocial.update(description, {
      percentage
    })
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

router.post(['/esocial/remove'], middlewareToken, async (req, res) => {
  let {
    description
  } = getReqProps(req, [
    'description'
  ]);

  try {
    /**
     * Validação dos parametros
     */
    if (
      typeof description != 'string'
    )
      return res.status(400).send('Grupo Mave Digital - Parameters values is not valid.');

    mongoDB.esocial.remove(description)
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

/**
 * benefits
 */
router.get(['/benefits'], middlewareToken, async (req, res) => {
  try {
    let benefits;

    mongoDB.benefits.get()
      .then(response => {
        benefits = response['benefits'];

        return res.status(200).render('benefits', {
          title: 'Grupo Mave Digital',
          menus: [{
            type: 'normal',
            first: true,
            enabled: true,
            title: 'Gestão de Benefícios',
            onclick: ""
          }, {
            type: 'normal',
            first: false,
            enabled: true,
            title: 'Cadastrar',
            onclick: 'register()'
          }, {
            type: 'normal',
            first: false,
            enabled: true,
            title: 'Voltar',
            onclick: 'gotoSystem()'
          }],
          benefits,
          benefitslength: benefits.length
        })
      })
      .catch(err => res.status(400).render('error', {
        title: 'Grupo Mave Digital - Error!!!',
        message: err[0],
        path: '/benefits',
        menus: [{
          type: 'normal',
          icon: 'rotate-ccw',
          first: false,
          enabled: true,
          title: 'Voltar',
          onclick: "gotoSystem()"
        }],
        error: err
      }))
  } catch (err) {
    return res.status(400).render('error', {
      title: 'Grupo Mave Digital - Error!!!',
      message: err,
      path: '/benefits',
      menus: [{
        type: 'normal',
        icon: 'rotate-ccw',
        first: false,
        enabled: true,
        title: 'Voltar',
        onclick: "gotoSystem()"
      }],
      error: err
    });
  }
});

router.get(['/benefits/register'], middlewareToken, async (req, res) => {
  try {
    return res.status(200).render('benefits-register', {
      title: 'Grupo Mave Digital',
      menus: [{
        type: 'normal',
        first: true,
        enabled: true,
        title: 'Cadastrar Beneficio',
        onclick: ""
      }, {
        type: 'normal',
        first: false,
        enabled: true,
        title: 'Salvar',
        onclick: 'send()'
      }, {
        type: 'normal',
        first: false,
        enabled: true,
        title: 'Voltar',
        onclick: 'gotoSystem()'
      }]
    })
  } catch (err) {
    return res.status(400).render('error', {
      title: 'Grupo Mave Digital - Error!!!',
      message: err,
      path: '/benefits',
      menus: [{
        type: 'normal',
        icon: 'rotate-ccw',
        first: false,
        enabled: true,
        title: 'Voltar',
        onclick: "gotoSystem()"
      }],
      error: err
    });
  }
});

router.post(['/benefits/register'], middlewareToken, async (req, res) => {
  let {
    description,
    quantity,
    value,
    total
  } = getReqProps(req, [
    'description',
    'quantity',
    'value',
    'total'
  ]);

  try {
    /**
     * Validação dos parametros
     */
    if (
      typeof description != 'string' ||
      typeof quantity != 'number' ||
      typeof value != 'number' ||
      typeof total != 'number'
    )
      return res.status(400).send('Grupo Mave Digital - Parameters values is not valid.');

    mongoDB.benefits.register(
      description,
      quantity,
      value,
      total
    )
      .then(data => res.status(200).send({
        message: 'Grupo Mave Digital - Success!!!',
        data
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


router.get(['/benefits/edit/:id'], middlewareToken, async (req, res) => {
  let {
    id
  } = getReqProps(req, [
    'id'
  ]);

  try {
    /**
     * Validação dos parametros
     */
    if (
      typeof id != 'string'
    )
      return res.status(400).send('Grupo Mave Digital - Parameters values is not valid.');

    let benefits;

    mongoDB.benefits.get('_id', id)
      .then(response => {
        benefits = response['benefits'];

        return res.status(200).render('benefits-edit', {
          title: 'Grupo Mave Digital',
          menus: [{
            type: 'normal',
            first: true,
            enabled: true,
            title: 'Atualizar Beneficio',
            onclick: ""
          }, {
            type: 'normal',
            first: false,
            enabled: true,
            title: 'Atualizar',
            onclick: 'send()'
          }, {
            type: 'normal',
            first: false,
            enabled: true,
            title: 'Voltar',
            onclick: 'gotoSystem()'
          }],
          benefit: LZString.compressToBase64(JSON.stringify(benefits[0]))
        })
      })
      .catch(err => res.status(400).render('error', {
        title: 'Grupo Mave Digital - Error!!!',
        message: err[0],
        path: '/benefits',
        menus: [{
          type: 'normal',
          first: false,
          enabled: true,
          title: 'Voltar',
          onclick: 'gotoSystem()'
        }],
        error: err
      }))
  } catch (err) {
    return res.status(400).render('error', {
      title: 'Grupo Mave Digital - Error!!!',
      message: err,
      path: '/benefits',
      menus: [{
        type: 'normal',
        icon: 'rotate-ccw',
        first: false,
        enabled: true,
        title: 'Voltar',
        onclick: "gotoSystem()"
      }],
      error: err
    });
  }
});

router.post(['/benefits/update'], middlewareToken, async (req, res) => {
  let {
    description,
    quantity,
    value,
    total
  } = getReqProps(req, [
    'description',
    'quantity',
    'value',
    'total'
  ]);

  try {
    /**
     * Validação dos parametros
     */
    if (
      typeof description != 'string' ||
      typeof quantity != 'number' ||
      typeof value != 'number' ||
      typeof total != 'number'
    )
      return res.status(400).send('Grupo Mave Digital - Parameters values is not valid.');

    mongoDB.benefits.update(description, {
      quantity,
      value,
      total
    })
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

router.post(['/benefits/remove'], middlewareToken, async (req, res) => {
  let {
    description
  } = getReqProps(req, [
    'description'
  ]);

  try {
    /**
     * Validação dos parametros
     */
    if (
      typeof description != 'string'
    )
      return res.status(400).send('Grupo Mave Digital - Parameters values is not valid.');

    mongoDB.benefits.remove(description)
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

/**
 * Uniforms
 */
router.get(['/uniforms'], middlewareToken, async (req, res) => {
  try {
    let uniforms;

    mongoDB.uniforms.get()
      .then(response => {
        uniforms = response['uniforms'];

        return res.status(200).render('uniforms', {
          title: 'Grupo Mave Digital',
          menus: [{
            type: 'normal',
            first: true,
            enabled: true,
            title: 'Gestão de Uniformes',
            onclick: ""
          }, {
            type: 'normal',
            first: false,
            enabled: true,
            title: 'Cadastrar',
            onclick: 'register()'
          }, {
            type: 'normal',
            first: false,
            enabled: true,
            title: 'Voltar',
            onclick: 'gotoSystem()'
          }],
          uniforms,
          uniformslength: uniforms.length
        })
      })
      .catch(err => res.status(400).render('error', {
        title: 'Grupo Mave Digital - Error!!!',
        message: err[0],
        path: '/uniforms',
        menus: [{
          type: 'normal',
          icon: 'rotate-ccw',
          first: false,
          enabled: true,
          title: 'Voltar',
          onclick: "gotoSystem()"
        }],
        error: err
      }))
  } catch (err) {
    return res.status(400).render('error', {
      title: 'Grupo Mave Digital - Error!!!',
      message: err,
      path: '/uniforms',
      menus: [{
        type: 'normal',
        icon: 'rotate-ccw',
        first: false,
        enabled: true,
        title: 'Voltar',
        onclick: "gotoSystem()"
      }],
      error: err
    });
  }
});

router.get(['/uniforms/register'], middlewareToken, async (req, res) => {
  try {
    let uniforms;

    mongoDB.uniforms.get()
      .then(response => {
        uniforms = response['uniforms'];

        return res.status(200).render('uniforms-register', {
          title: 'Grupo Mave Digital',
          menus: [{
            type: 'normal',
            first: true,
            enabled: true,
            title: 'Cadastrar Uniforme',
            onclick: ""
          }, {
            type: 'normal',
            first: false,
            enabled: true,
            title: 'Salvar',
            onclick: 'send()'
          }, {
            type: 'normal',
            first: false,
            enabled: true,
            title: 'Voltar',
            onclick: 'gotoSystem()'
          }],
          uniforms: LZString.compressToBase64(JSON.stringify(uniforms))
        })
      })
      .catch(err => res.status(400).render('error', {
        title: 'Grupo Mave Digital - Error!!!',
        message: err[0],
        path: '/uniforms',
        menus: [{
          type: 'normal',
          icon: 'rotate-ccw',
          first: false,
          enabled: true,
          title: 'Voltar',
          onclick: "gotoSystem()"
        }],
        error: err
      }))
  } catch (err) {
    return res.status(400).render('error', {
      title: 'Grupo Mave Digital - Error!!!',
      message: err,
      path: '/uniforms',
      menus: [{
        type: 'normal',
        icon: 'rotate-ccw',
        first: false,
        enabled: true,
        title: 'Voltar',
        onclick: "gotoSystem()"
      }],
      error: err
    });
  }
});

router.post(['/uniforms/register'], middlewareToken, async (req, res) => {
  let {
    id,
    description,
    quantity,
    unitary,
    total,
    monthlycost
  } = getReqProps(req, [
    'id',
    'description',
    'quantity',
    'unitary',
    'total',
    'monthlycost'
  ]);

  try {
    /**
     * Validação dos parametros
     */
    if (
      typeof id != 'string' ||
      typeof description != 'string' ||
      typeof quantity != 'number' ||
      typeof unitary != 'number' ||
      typeof total != 'number' ||
      typeof monthlycost != 'number'
    )
      return res.status(400).send('Grupo Mave Digital - Parameters values is not valid.');

    mongoDB.uniforms.register(
      id,
      description,
      quantity,
      unitary,
      total,
      monthlycost
    )
      .then(data => res.status(200).send({
        message: 'Grupo Mave Digital - Success!!!',
        data
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

router.get(['/uniforms/edit/:id'], middlewareToken, async (req, res) => {
  let {
    id
  } = getReqProps(req, [
    'id'
  ]);

  try {
    /**
     * Validação dos parametros
     */
    if (
      typeof id != 'string'
    )
      return res.status(400).send('Grupo Mave Digital - Parameters values is not valid.');

    let uniforms;

    mongoDB.uniforms.get('id', id)
      .then(response => {
        uniforms = response['uniforms'];

        return res.status(200).render('uniforms-edit', {
          title: 'Grupo Mave Digital',
          menus: [{
            type: 'normal',
            first: true,
            enabled: true,
            title: 'Atualizar Uniforme',
            onclick: ""
          }, {
            type: 'normal',
            first: false,
            enabled: true,
            title: 'Atualizar',
            onclick: 'send()'
          }, {
            type: 'normal',
            first: false,
            enabled: true,
            title: 'Voltar',
            onclick: 'gotoSystem()'
          }],
          uniform: LZString.compressToBase64(JSON.stringify(uniforms[0]))
        })
      })
      .catch(err => res.status(400).render('error', {
        title: 'Grupo Mave Digital - Error!!!',
        message: err[0],
        path: '/uniforms',
        menus: [{
          type: 'normal',
          icon: 'rotate-ccw',
          first: false,
          enabled: true,
          title: 'Voltar',
          onclick: "gotoSystem()"
        }],
        error: err
      }))
  } catch (err) {
    return res.status(400).render('error', {
      title: 'Grupo Mave Digital - Error!!!',
      message: err,
      path: '/uniforms',
      menus: [{
        type: 'normal',
        icon: 'rotate-ccw',
        first: false,
        enabled: true,
        title: 'Voltar',
        onclick: "gotoSystem()"
      }],
      error: err
    });
  }
});

router.post(['/uniforms/update'], middlewareToken, async (req, res) => {
  let {
    id,
    description,
    quantity,
    unitary,
    total,
    monthlycost
  } = getReqProps(req, [
    'id',
    'description',
    'quantity',
    'unitary',
    'total',
    'monthlycost'
  ]);

  try {
    /**
     * Validação dos parametros
     */
    if (
      typeof id != 'string' ||
      typeof description != 'string' ||
      typeof quantity != 'number' ||
      typeof unitary != 'number' ||
      typeof total != 'number' ||
      typeof monthlycost != 'number'
    )
      return res.status(400).send('Grupo Mave Digital - Parameters values is not valid.');

    mongoDB.uniforms.update(id, {
      description,
      quantity,
      unitary,
      total,
      monthlycost
    })
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

router.post(['/uniforms/remove'], middlewareToken, async (req, res) => {
  let {
    id
  } = getReqProps(req, [
    'id'
  ]);

  try {
    /**
     * Validação dos parametros
     */
    if (
      typeof id != 'string'
    )
      return res.status(400).send('Grupo Mave Digital - Parameters values is not valid.');

    mongoDB.uniforms.remove(id)
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

/**
 * Workdata
 */
router.get(['/workdata'], middlewareToken, async (req, res) => {
  try {
    let workdata, uniforms = {};

    mongoDB.workdata.get()
      .then(async (response) => {
        workdata = response['workdata'];

        let
          i = 0,
          workdataLength = workdata.length,
          uniformslength = 0,
          monthlycost_total = 0;

        for (; i < workdataLength; i++) {
          let id = workdata[i]['id'];

          if (workdata[i]['uniforms'].length > 0) {
            await mongoDB.workdata.getUniforms('id', id)
              .then(response => {
                uniforms[id] = response['uniforms'];
                response['uniforms'].map(uniform => monthlycost_total += uniform['monthlycost']);
                uniformslength = response['uniforms'].length;
              })
              .catch(err => { })
          } else {
            uniforms[id] = [];
          }
        }

        return res.status(200).render('workdata', {
          title: 'Grupo Mave Digital',
          menus: [{
            type: 'normal',
            first: true,
            enabled: true,
            title: 'Gestão de Dados Trabalhistas',
            onclick: ""
          }, {
            type: 'normal',
            first: false,
            enabled: true,
            title: 'Cadastrar',
            onclick: 'register()'
          }, {
            type: 'normal',
            first: false,
            enabled: true,
            title: 'Voltar',
            onclick: 'gotoSystem()'
          }],
          workdata,
          workdataLength,
          uniforms,
          uniformslength,
          monthlycost_total
        })
      })
      .catch(err => res.status(400).render('error', {
        title: 'Grupo Mave Digital - Error!!!',
        message: err[0],
        path: '/workdata',
        menus: [{
          type: 'normal',
          icon: 'rotate-ccw',
          first: false,
          enabled: true,
          title: 'Voltar',
          onclick: "gotoSystem()"
        }],
        error: err
      }))
  } catch (err) {
    return res.status(400).render('error', {
      title: 'Grupo Mave Digital - Error!!!',
      message: err,
      path: '/workdata',
      menus: [{
        type: 'normal',
        icon: 'rotate-ccw',
        first: false,
        enabled: true,
        title: 'Voltar',
        onclick: "gotoSystem()"
      }],
      error: err
    });
  }
});

router.get(['/workdata/register'], middlewareToken, async (req, res) => {
  try {
    let uniforms, workdata;

    mongoDB.uniforms.get()
      .then(response => {
        uniforms = response['uniforms'];

        mongoDB.workdata.get()
          .then(response => {
            workdata = response['workdata'];

            return res.status(200).render('workdata-register', {
              title: 'Grupo Mave Digital',
              menus: [{
                type: 'normal',
                first: true,
                enabled: true,
                title: 'Cadastrar Dado Trabalhista',
                onclick: ""
              }, {
                type: 'normal',
                first: false,
                enabled: true,
                title: 'Salvar',
                onclick: 'send()'
              }, {
                type: 'normal',
                first: false,
                enabled: true,
                title: 'Voltar',
                onclick: 'gotoSystem()'
              }],
              workdata: LZString.compressToBase64(JSON.stringify(workdata)),
              uniforms,
              uniformslength: uniforms.length
            })
          })
          .catch(err => res.status(400).render('error', {
            title: 'Grupo Mave Digital - Error!!!',
            message: err[0],
            path: '/workdata',
            menus: [{
              type: 'normal',
              icon: 'rotate-ccw',
              first: false,
              enabled: true,
              title: 'Voltar',
              onclick: "gotoSystem()"
            }],
            error: err
          }))
      })
      .catch(err => res.status(400).render('error', {
        title: 'Grupo Mave Digital - Error!!!',
        message: err[0],
        path: '/workdata',
        menus: [{
          type: 'normal',
          icon: 'rotate-ccw',
          first: false,
          enabled: true,
          title: 'Voltar',
          onclick: "gotoSystem()"
        }],
        error: err
      }))
  } catch (err) {
    return res.status(400).render('error', {
      title: 'Grupo Mave Digital - Error!!!',
      message: err,
      path: '/workdata',
      menus: [{
        type: 'normal',
        icon: 'rotate-ccw',
        first: false,
        enabled: true,
        title: 'Voltar',
        onclick: "gotoSystem()"
      }],
      error: err
    });
  }
});

router.post(['/workdata/register'], middlewareToken, async (req, res) => {
  let {
    id,
    jobtitle,
    scale,
    salary,
    time,
    dayswork,
    overtime,
    accumulation,
    additionalnight,
    gratification,
    dangerousness,
    insalubrity,
    dsr,
    uniforms
  } = getReqProps(req, [
    'id',
    'jobtitle',
    'scale',
    'salary',
    'time',
    'dayswork',
    'overtime',
    'accumulation',
    'additionalnight',
    'gratification',
    'dangerousness',
    'insalubrity',
    'dsr',
    'uniforms'
  ]);

  try {
    /**
     * Validação dos parametros
     */
    if (
      typeof id != 'string' ||
      typeof jobtitle != 'string' ||
      typeof scale != 'string' ||
      typeof salary != 'number' ||
      typeof time != 'object' ||
      typeof dayswork != 'number' ||
      typeof overtime != 'object' ||
      typeof accumulation != 'object' ||
      typeof additionalnight != 'object' ||
      typeof gratification != 'object' ||
      typeof dangerousness != 'object' ||
      typeof insalubrity != 'object' ||
      typeof dsr != 'object' ||
      uniforms instanceof Array === false
    )
      return res.status(400).send('Grupo Mave Digital - Parameters values is not valid.');

    mongoDB.workdata.register(
      id,
      jobtitle,
      scale,
      salary,
      time,
      dayswork,
      overtime,
      accumulation,
      additionalnight,
      gratification,
      dangerousness,
      insalubrity,
      dsr,
      uniforms
    )
      .then(data => res.status(200).send({
        message: 'Grupo Mave Digital - Success!!!',
        data
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

router.get(['/workdata/edit/:id'], middlewareToken, async (req, res) => {
  let {
    id
  } = getReqProps(req, [
    'id'
  ]);

  try {
    /**
     * Validação dos parametros
     */
    if (
      typeof id != 'string'
    )
      return res.status(400).send('Grupo Mave Digital - Parameters values is not valid.');

    let workdata, {
      uniforms
    } = await mongoDB.uniforms.get(),
      uniformsSelected = await mongoDB.workdata.getUniforms('id', id);

    mongoDB.workdata.get('id', id)
      .then(async response => {
        workdata = response['workdata'];

        return res.status(200).render('workdata-edit', {
          title: 'Grupo Mave Digital',
          menus: [{
            type: 'normal',
            first: true,
            enabled: true,
            title: 'Atualizar Dado Trabalhista',
            onclick: ""
          }, {
            type: 'normal',
            first: false,
            enabled: true,
            title: 'Atualizar',
            onclick: 'send()'
          }, {
            type: 'normal',
            first: false,
            enabled: true,
            title: 'Voltar',
            onclick: 'gotoSystem()'
          }],
          workdata: LZString.compressToBase64(JSON.stringify(workdata[0])),
          uniforms,
          uniformslength: uniforms.length,
          uniformsSelected: LZString.compressToBase64(JSON.stringify(uniformsSelected['uniforms']))
        })
      })
      .catch(err => res.status(400).render('error', {
        title: 'Grupo Mave Digital - Error!!!',
        message: err[0],
        path: '/workdata',
        menus: [{
          type: 'normal',
          icon: 'rotate-ccw',
          first: false,
          enabled: true,
          title: 'Voltar',
          onclick: "gotoSystem()"
        }],
        error: err
      }))
  } catch (err) {
    return res.status(400).render('error', {
      title: 'Grupo Mave Digital - Error!!!',
      message: err,
      path: '/workdata',
      menus: [{
        type: 'normal',
        icon: 'rotate-ccw',
        first: false,
        enabled: true,
        title: 'Voltar',
        onclick: "gotoSystem()"
      }],
      error: err
    });
  }
});

router.post(['/workdata/update'], middlewareToken, async (req, res) => {
  let {
    id,
    jobtitle,
    scale,
    salary,
    time,
    dayswork,
    additionalnight,
    gratification,
    uniforms
  } = getReqProps(req, [
    'id',
    'jobtitle',
    'scale',
    'salary',
    'time',
    'dayswork',
    'additionalnight',
    'gratification',
    'uniforms'
  ]);

  try {
    /**
     * Validação dos parametros
     */
    if (
      typeof id != 'string' ||
      typeof jobtitle != 'string' ||
      typeof scale != 'string' ||
      typeof salary != 'number' ||
      typeof time != 'object' ||
      typeof dayswork != 'number' ||
      typeof additionalnight != 'object' ||
      typeof gratification != 'object' ||
      uniforms instanceof Array === false
    )
      return res.status(400).send('Grupo Mave Digital - Parameters values is not valid.');

    mongoDB.workdata.update(id, {
      jobtitle,
      scale,
      salary,
      time,
      dayswork,
      additionalnight,
      gratification,
      uniforms
    })
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

router.post(['/workdata/remove'], middlewareToken, async (req, res) => {
  let {
    id
  } = getReqProps(req, [
    'id'
  ]);

  try {
    /**
     * Validação dos parametros
     */
    if (
      typeof id != 'string'
    )
      return res.status(400).send('Grupo Mave Digital - Parameters values is not valid.');

    mongoDB.workdata.remove(id)
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

/**
 * Equipments
 */
router.get(['/equipments'], middlewareToken, async (req, res) => {
  try {
    let equipments;

    mongoDB.equipments.get()
      .then(response => {
        equipments = response['equipments'];

        return res.status(200).render('equipments', {
          title: 'Grupo Mave Digital',
          menus: [{
            type: 'normal',
            first: true,
            enabled: true,
            title: 'Gestão de Equipamentos',
            onclick: ""
          }, {
            type: 'normal',
            first: false,
            enabled: true,
            title: 'Cadastrar',
            onclick: "register()"
          }, {
            type: 'normal',
            first: false,
            enabled: true,
            title: 'Voltar',
            onclick: 'gotoSystem()'
          }],
          equipments,
          equipmentslength: equipments.length
        })
      })
      .catch(err => res.status(400).render('error', {
        title: 'Grupo Mave Digital - Error!!!',
        message: err[0],
        path: '/equipments',
        menus: [{
          type: 'normal',
          icon: 'rotate-ccw',
          first: false,
          enabled: true,
          title: 'Voltar',
          onclick: "gotoSystem()"
        }],
        error: err
      }))
  } catch (err) {
    return res.status(400).render('error', {
      title: 'Grupo Mave Digital - Error!!!',
      message: err[0],
      path: '/equipments',
      menus: [{
        type: 'normal',
        icon: 'rotate-ccw',
        first: false,
        enabled: true,
        title: 'Voltar',
        onclick: "gotoSystem()"
      }],
      error: err
    });
  }
});

router.get(['/equipments/register'], middlewareToken, async (req, res) => {
  try {
    let equipments;

    mongoDB.equipments.get()
      .then(response => {
        equipments = response['equipments'];

        return res.status(200).render('equipments-register', {
          title: 'Grupo Mave Digital',
          menus: [{
            type: 'normal',
            first: true,
            enabled: true,
            title: 'Cadastrar Equipamento',
            onclick: ""
          }, {
            type: 'normal',
            first: false,
            enabled: true,
            title: 'Salvar',
            onclick: "send()"
          }, {
            type: 'normal',
            first: false,
            enabled: true,
            title: 'Voltar',
            onclick: 'gotoSystem()'
          }],
          equipments: LZString.compressToBase64(JSON.stringify(equipments))
        })
      })
      .catch(err => res.status(400).render('error', {
        title: 'Grupo Mave Digital - Error!!!',
        message: err[0],
        path: '/equipments',
        menus: [{
          type: 'normal',
          icon: 'rotate-ccw',
          first: false,
          enabled: true,
          title: 'Voltar',
          onclick: "gotoSystem()"
        }],
        error: err
      }))
  } catch (err) {
    return res.status(400).render('error', {
      title: 'Grupo Mave Digital - Error!!!',
      message: err[0],
      path: '/equipments',
      menus: [{
        type: 'normal',
        icon: 'rotate-ccw',
        first: false,
        enabled: true,
        title: 'Voltar',
        onclick: "gotoSystem()"
      }],
      error: err
    });
  }
});

router.post(['/equipments/register'], middlewareToken, async (req, res) => {
  let {
    id,
    depreciation,
    segment,
    description,
    quantity,
    investment,
    amortization,
    investmentTotal
  } = getReqProps(req, [
    'id',
    'depreciation',
    'segment',
    'description',
    'quantity',
    'investment',
    'amortization',
    'investmentTotal'
  ]);

  try {
    /**
     * Validação dos parametros
     */
    if (
      typeof id != 'string' ||
      typeof depreciation != 'number' ||
      typeof segment != 'string' ||
      typeof description != 'string' ||
      typeof quantity != 'number' ||
      typeof investment != 'number' ||
      typeof amortization != 'number' ||
      typeof investmentTotal != 'number'
    )
      return res.status(400).send('Grupo Mave Digital - Parameters values is not valid.');

    mongoDB.equipments.register(
      id,
      depreciation,
      segment,
      description,
      quantity,
      investment,
      amortization,
      investmentTotal
    )
      .then(data => res.status(200).send({
        message: 'Grupo Mave Digital - Success!!!',
        data
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

router.get(['/equipments/edit/:id'], middlewareToken, async (req, res) => {
  let {
    id
  } = getReqProps(req, [
    'id'
  ]);

  try {
    /**
     * Validação dos parametros
     */
    if (
      typeof id != 'string'
    )
      return res.status(400).send('Grupo Mave Digital - Parameters values is not valid.');

    let equipments;

    mongoDB.equipments.get('id', id)
      .then(response => {
        equipments = response['equipments'];

        return res.status(200).render('equipments-edit', {
          title: 'Grupo Mave Digital',
          menus: [{
            type: 'normal',
            first: true,
            enabled: true,
            title: 'Atualizar Equipamento',
            onclick: ""
          }, {
            type: 'normal',
            first: false,
            enabled: true,
            title: 'Salvar',
            onclick: "send()"
          }, {
            type: 'normal',
            first: false,
            enabled: true,
            title: 'Voltar',
            onclick: 'gotoSystem()'
          }],
          equipment: LZString.compressToBase64(JSON.stringify(equipments[0]))
        })
      })
      .catch(err => res.status(400).render('error', {
        title: 'Grupo Mave Digital - Error!!!',
        message: err[0],
        path: '/equipments',
        menus: [{
          type: 'normal',
          icon: 'rotate-ccw',
          first: false,
          enabled: true,
          title: 'Voltar',
          onclick: "gotoSystem()"
        }],
        error: err
      }))
  } catch (err) {
    return res.status(400).render('error', {
      title: 'Grupo Mave Digital - Error!!!',
      message: err[0],
      path: '/equipments',
      menus: [{
        type: 'normal',
        icon: 'rotate-ccw',
        first: false,
        enabled: true,
        title: 'Voltar',
        onclick: "gotoSystem()"
      }],
      error: err
    });
  }
});

router.post(['/equipments/update'], middlewareToken, async (req, res) => {
  let {
    id,
    depreciation,
    segment,
    description,
    quantity,
    investment,
    amortization,
    investmentTotal
  } = getReqProps(req, [
    'id',
    'depreciation',
    'segment',
    'description',
    'quantity',
    'investment',
    'amortization',
    'investmentTotal'
  ]);

  try {
    /**
     * Validação dos parametros
     */
    if (
      typeof id != 'string' ||
      typeof depreciation != 'number' ||
      typeof segment != 'string' ||
      typeof description != 'string' ||
      typeof quantity != 'number' ||
      typeof investment != 'number' ||
      typeof amortization != 'number' ||
      typeof investmentTotal != 'number'
    )
      return res.status(400).send('Grupo Mave Digital - Parameters values is not valid.');

    mongoDB.equipments.update(id, {
      depreciation,
      segment,
      description,
      quantity,
      investment,
      amortization,
      investmentTotal
    })
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

router.post(['/equipments/remove'], middlewareToken, async (req, res) => {
  let {
    id
  } = getReqProps(req, [
    'id'
  ]);

  try {
    /**
     * Validação dos parametros
     */
    if (
      typeof id != 'string'
    )
      return res.status(400).send('Grupo Mave Digital - Parameters values is not valid.');

    mongoDB.equipments.remove(id)
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

/**
 * Rents
 */
router.get(['/rents'], middlewareToken, async (req, res) => {
  try {
    let rents;

    mongoDB.rents.get()
      .then(response => {
        rents = response['rents'];

        return res.status(200).render('rents', {
          title: 'Grupo Mave Digital',
          menus: [{
            type: 'normal',
            first: true,
            enabled: true,
            title: 'Gestão de Alocações',
            onclick: ""
          }, {
            type: 'normal',
            first: false,
            enabled: true,
            title: 'Cadastrar',
            onclick: "register()"
          }, {
            type: 'normal',
            first: false,
            enabled: true,
            title: 'Voltar',
            onclick: 'gotoSystem()'
          }],
          rents,
          rentslength: rents.length
        })
      })
      .catch(err => res.status(400).render('error', {
        title: 'Grupo Mave Digital - Error!!!',
        message: err[0],
        path: '/rents',
        menus: [{
          type: 'normal',
          icon: 'rotate-ccw',
          first: false,
          enabled: true,
          title: 'Voltar',
          onclick: "gotoSystem()"
        }],
        error: err
      }))
  } catch (err) {
    return res.status(400).render('error', {
      title: 'Grupo Mave Digital - Error!!!',
      message: err[0],
      path: '/rents',
      menus: [{
        type: 'normal',
        icon: 'rotate-ccw',
        first: false,
        enabled: true,
        title: 'Voltar',
        onclick: "gotoSystem()"
      }],
      error: err
    });
  }
});

router.get(['/rents/register'], middlewareToken, async (req, res) => {
  try {
    let rents;

    mongoDB.rents.get()
      .then(response => {
        rents = response['rents'];

        return res.status(200).render('rents-register', {
          title: 'Grupo Mave Digital',
          menus: [{
            type: 'normal',
            first: true,
            enabled: true,
            title: 'Cadastrar Alocação',
            onclick: ""
          }, {
            type: 'normal',
            first: false,
            enabled: true,
            title: 'Salvar',
            onclick: "send()"
          }, {
            type: 'normal',
            first: false,
            enabled: true,
            title: 'Voltar',
            onclick: 'gotoSystem()'
          }],
          rents: LZString.compressToBase64(JSON.stringify(rents))
        })
      })
      .catch(err => res.status(400).render('error', {
        title: 'Grupo Mave Digital - Error!!!',
        message: err[0],
        path: '/rents',
        menus: [{
          type: 'normal',
          icon: 'rotate-ccw',
          first: false,
          enabled: true,
          title: 'Voltar',
          onclick: "gotoSystem()"
        }],
        error: err
      }))
  } catch (err) {
    return res.status(400).render('error', {
      title: 'Grupo Mave Digital - Error!!!',
      message: err[0],
      path: '/rents',
      menus: [{
        type: 'normal',
        icon: 'rotate-ccw',
        first: false,
        enabled: true,
        title: 'Voltar',
        onclick: "gotoSystem()"
      }],
      error: err
    });
  }
});

router.post(['/rents/register'], middlewareToken, async (req, res) => {
  let {
    id,
    description,
    quantity,
    unitary,
    total
  } = getReqProps(req, [
    'id',
    'description',
    'quantity',
    'unitary',
    'total'
  ]);

  try {
    /**
     * Validação dos parametros
     */
    if (
      typeof id != 'string' ||
      typeof description != 'string' ||
      typeof quantity != 'number' ||
      typeof unitary != 'number' ||
      typeof total != 'number'
    )
      return res.status(400).send('Grupo Mave Digital - Parameters values is not valid.');

    mongoDB.rents.register(
      id,
      description,
      quantity,
      unitary,
      total
    )
      .then(data => res.status(200).send({
        message: 'Grupo Mave Digital - Success!!!',
        data
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

router.get(['/rents/edit/:id'], middlewareToken, async (req, res) => {
  let {
    id
  } = getReqProps(req, [
    'id'
  ]);

  try {
    /**
     * Validação dos parametros
     */
    if (
      typeof id != 'string'
    )
      return res.status(400).send('Grupo Mave Digital - Parameters values is not valid.');

    let rents;

    mongoDB.rents.get('id', id)
      .then(response => {
        rents = response['rents'];

        return res.status(200).render('rents-edit', {
          title: 'Grupo Mave Digital',
          menus: [{
            type: 'normal',
            first: true,
            enabled: true,
            title: 'Atualizar Alocação',
            onclick: ""
          }, {
            type: 'normal',
            first: false,
            enabled: true,
            title: 'Salvar',
            onclick: "send()"
          }, {
            type: 'normal',
            first: false,
            enabled: true,
            title: 'Voltar',
            onclick: 'gotoSystem()'
          }],
          rental: LZString.compressToBase64(JSON.stringify(rents[0]))
        })
      })
      .catch(err => res.status(400).render('error', {
        title: 'Grupo Mave Digital - Error!!!',
        message: err[0],
        path: '/rents',
        menus: [{
          type: 'normal',
          icon: 'rotate-ccw',
          first: false,
          enabled: true,
          title: 'Voltar',
          onclick: "gotoSystem()"
        }],
        error: err
      }))
  } catch (err) {
    return res.status(400).render('error', {
      title: 'Grupo Mave Digital - Error!!!',
      message: err[0],
      path: '/rents',
      menus: [{
        type: 'normal',
        icon: 'rotate-ccw',
        first: false,
        enabled: true,
        title: 'Voltar',
        onclick: "gotoSystem()"
      }],
      error: err
    });
  }
});

router.post(['/rents/update'], middlewareToken, async (req, res) => {
  let {
    id,
    description,
    quantity,
    unitary,
    total
  } = getReqProps(req, [
    'id',
    'description',
    'quantity',
    'unitary',
    'total'
  ]);

  try {
    /**
     * Validação dos parametros
     */
    if (
      typeof id != 'string' ||
      typeof description != 'string' ||
      typeof quantity != 'number' ||
      typeof unitary != 'number' ||
      typeof total != 'number'
    )
      return res.status(400).send('Grupo Mave Digital - Parameters values is not valid.');

    mongoDB.rents.update(id, {
      description,
      quantity,
      unitary,
      total
    })
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

router.post(['/rents/remove'], middlewareToken, async (req, res) => {
  let {
    id
  } = getReqProps(req, [
    'id'
  ]);

  try {
    /**
     * Validação dos parametros
     */
    if (
      typeof id != 'string'
    )
      return res.status(400).send('Grupo Mave Digital - Parameters values is not valid.');

    mongoDB.rents.remove(id)
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

/**
 * Fuel
 */
router.get(['/fuel'], middlewareToken, async (req, res) => {
  try {
    let fuel;

    mongoDB.fuel.get()
      .then(response => {
        fuel = response['fuel'];

        return res.status(200).render('fuel', {
          title: 'Grupo Mave Digital',
          menus: [{
            type: 'normal',
            first: true,
            enabled: true,
            title: 'Gestão de Combustível',
            onclick: ""
          }, {
            type: 'normal',
            first: false,
            enabled: true,
            title: 'Cadastrar',
            onclick: "register()"
          }, {
            type: 'normal',
            first: false,
            enabled: true,
            title: 'Voltar',
            onclick: 'gotoSystem()'
          }],
          fuel,
          fuellength: fuel.length
        })
      })
      .catch(err => res.status(400).render('error', {
        title: 'Grupo Mave Digital - Error!!!',
        message: err[0],
        path: '/fuel',
        menus: [{
          type: 'normal',
          icon: 'rotate-ccw',
          first: false,
          enabled: true,
          title: 'Voltar',
          onclick: "gotoSystem()"
        }],
        error: err
      }))
  } catch (err) {
    return res.status(400).render('error', {
      title: 'Grupo Mave Digital - Error!!!',
      message: err[0],
      path: '/fuel',
      menus: [{
        type: 'normal',
        icon: 'rotate-ccw',
        first: false,
        enabled: true,
        title: 'Voltar',
        onclick: "gotoSystem()"
      }],
      error: err
    });
  }
});

router.get(['/fuel/register'], middlewareToken, async (req, res) => {
  try {
    let fuel;

    mongoDB.fuel.get()
      .then(response => {
        fuel = response['fuel'];

        return res.status(200).render('fuel-register', {
          title: 'Grupo Mave Digital',
          menus: [{
            type: 'normal',
            first: true,
            enabled: true,
            title: 'Cadastrar Combustível',
            onclick: ""
          }, {
            type: 'normal',
            first: false,
            enabled: true,
            title: 'Salvar',
            onclick: "send()"
          }, {
            type: 'normal',
            first: false,
            enabled: true,
            title: 'Voltar',
            onclick: 'gotoSystem()'
          }],
          fuel: LZString.compressToBase64(JSON.stringify(fuel))
        })
      })
      .catch(err => res.status(400).render('error', {
        title: 'Grupo Mave Digital - Error!!!',
        message: err[0],
        path: '/fuel',
        menus: [{
          type: 'normal',
          icon: 'rotate-ccw',
          first: false,
          enabled: true,
          title: 'Voltar',
          onclick: "gotoSystem()"
        }],
        error: err
      }))
  } catch (err) {
    return res.status(400).render('error', {
      title: 'Grupo Mave Digital - Error!!!',
      message: err[0],
      path: '/fuel',
      menus: [{
        type: 'normal',
        icon: 'rotate-ccw',
        first: false,
        enabled: true,
        title: 'Voltar',
        onclick: "gotoSystem()"
      }],
      error: err
    });
  }
});

router.post(['/fuel/register'], middlewareToken, async (req, res) => {
  let {
    id,
    description,
    tank,
    unitary,
    total
  } = getReqProps(req, [
    'id',
    'description',
    'tank',
    'unitary',
    'total'
  ]);

  try {
    /**
     * Validação dos parametros
     */
    if (
      typeof id != 'string' ||
      typeof description != 'string' ||
      typeof tank != 'number' ||
      typeof unitary != 'number' ||
      typeof total != 'number'
    )
      return res.status(400).send('Grupo Mave Digital - Parameters values is not valid.');

    mongoDB.fuel.register(
      id,
      description,
      tank,
      unitary,
      total
    )
      .then(data => res.status(200).send({
        message: 'Grupo Mave Digital - Success!!!',
        data
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

router.get(['/fuel/edit/:id'], middlewareToken, async (req, res) => {
  let {
    id
  } = getReqProps(req, [
    'id'
  ]);

  try {
    /**
     * Validação dos parametros
     */
    if (
      typeof id != 'string'
    )
      return res.status(400).send('Grupo Mave Digital - Parameters values is not valid.');

    let fuel;

    mongoDB.fuel.get('id', id)
      .then(response => {
        fuel = response['fuel'];

        return res.status(200).render('fuel-edit', {
          title: 'Grupo Mave Digital',
          menus: [{
            type: 'normal',
            first: true,
            enabled: true,
            title: 'Atualizar Combustível',
            onclick: ""
          }, {
            type: 'normal',
            first: false,
            enabled: true,
            title: 'Salvar',
            onclick: "send()"
          }, {
            type: 'normal',
            first: false,
            enabled: true,
            title: 'Voltar',
            onclick: 'gotoSystem()'
          }],
          fuel: LZString.compressToBase64(JSON.stringify(fuel[0]))
        })
      })
      .catch(err => res.status(400).render('error', {
        title: 'Grupo Mave Digital - Error!!!',
        message: err[0],
        path: '/fuel',
        menus: [{
          type: 'normal',
          icon: 'rotate-ccw',
          first: false,
          enabled: true,
          title: 'Voltar',
          onclick: "gotoSystem()"
        }],
        error: err
      }))
  } catch (err) {
    return res.status(400).render('error', {
      title: 'Grupo Mave Digital - Error!!!',
      message: err[0],
      path: '/fuel',
      menus: [{
        type: 'normal',
        icon: 'rotate-ccw',
        first: false,
        enabled: true,
        title: 'Voltar',
        onclick: "gotoSystem()"
      }],
      error: err
    });
  }
});

router.post(['/fuel/update'], middlewareToken, async (req, res) => {
  let {
    id,
    description,
    tank,
    unitary,
    total
  } = getReqProps(req, [
    'id',
    'description',
    'tank',
    'unitary',
    'total'
  ]);

  try {
    /**
     * Validação dos parametros
     */
    if (
      typeof id != 'string' ||
      typeof description != 'string' ||
      typeof tank != 'number' ||
      typeof unitary != 'number' ||
      typeof total != 'number'
    )
      return res.status(400).send('Grupo Mave Digital - Parameters values is not valid.');

    mongoDB.fuel.update(id, {
      description,
      tank,
      unitary,
      total
    })
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

router.post(['/fuel/remove'], middlewareToken, async (req, res) => {
  let {
    id
  } = getReqProps(req, [
    'id'
  ]);

  try {
    /**
     * Validação dos parametros
     */
    if (
      typeof id != 'string'
    )
      return res.status(400).send('Grupo Mave Digital - Parameters values is not valid.');

    mongoDB.fuel.remove(id)
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

/**
 * Budgets
 */
router.get(['/budgets'], middlewareToken, async (req, res) => {
  try {
    let budgets;

    return res.status(200).render('budgets', {
      title: 'Grupo Mave Digital',
      menus: [{
        type: 'normal',
        first: true,
        enabled: true,
        title: 'Gestão de Orçamentos',
        onclick: ""
      }, {
        type: 'normal',
        first: false,
        enabled: true,
        title: 'Novo',
        onclick: "register()"
      }, {
        type: 'normal',
        first: false,
        enabled: true,
        title: 'Voltar',
        onclick: 'gotoSystem()'
      }]
    })
  } catch (err) {
    return res.status(400).render('error', {
      title: 'Grupo Mave Digital - Error!!!',
      message: err[0],
      path: '/budgets',
      menus: [{
        type: 'normal',
        icon: 'rotate-ccw',
        first: false,
        enabled: true,
        title: 'Voltar',
        onclick: "gotoSystem()"
      }],
      error: err
    });
  }
});

router.get(['/budgets/register'], middlewareToken, async (req, res) => {
  try {
    let budgets, uniforms = {},
      monthlycost_total = {};

    const {
      workdata
    } = await mongoDB.workdata.get(), {
      aliquots
    } = await mongoDB.aliquots.get(), {
      esocial
    } = await mongoDB.esocial.get(), {
      benefits
    } = await mongoDB.benefits.get(), {
      equipments
    } = await mongoDB.equipments.get(), {
      rents
    } = await mongoDB.rents.get(), {
      fuel
    } = await mongoDB.fuel.get(), {
      clients
    } = await mongoDB.clients.get();

    let
      i = 0,
      workdataLength = workdata.length;

    for (; i < workdataLength; i++) {
      let id = workdata[i]['id'];

      if (workdata[i]['uniforms'].length > 0) {
        await mongoDB.workdata.getUniforms('id', id)
          .then(response => {
            uniforms[id] = response['uniforms'];
            monthlycost_total[id] = 0;
            response['uniforms'].map(uniform => monthlycost_total[id] += uniform['monthlycost']);
          })
          .catch(err => { })
      } else {
        uniforms[id] = [];
      }
    }

    return res.status(200).render('budgets-register', {
      title: 'Grupo Mave Digital',
      menus: [{
        type: 'normal',
        first: true,
        enabled: true,
        title: 'Novo Orçamento',
        onclick: ""
      }, {
        type: 'dropdown',
        first: false,
        enabled: true,
        title: 'Arquivo',
        items: [{
          type: 'normal',
          title: 'Salvar',
          onclick: "send()"
        }, {
          type: 'normal',
          title: 'Finalizar',
          onclick: "closed()"
        }]
      }, {
        type: 'dropdown',
        first: false,
        enabled: true,
        title: 'Adicionar',
        items: [{
          type: 'normal',
          title: 'Dado Trabalhista',
          onclick: "add_workdata_select()"
        }, {
          type: 'normal',
          title: 'Benefício',
          onclick: "add_benefits_select()"
        }, {
          type: 'normal',
          title: 'Equipamento',
          onclick: "add_equipment_select()"
        }, {
          type: 'normal',
          title: 'Alocação',
          onclick: "add_rental_select()"
        },
        {
          type: 'normal',
          title: 'Combustível',
          onclick: "add_fuel_select()"
        }
        ]
      },
      {
        type: 'dropdown',
        first: false,
        enabled: true,
        title: 'Relatório',
        items: [{
          type: 'normal',
          title: 'Imprimir',
          onclick: "print()"
        }]
      },
      {
        type: 'normal',
        first: false,
        enabled: true,
        title: 'Voltar',
        onclick: 'gotoSystem()'
      }
      ],
      budgets: LZString.compressToBase64(JSON.stringify(budgets)),
      workdata: LZString.compressToBase64(JSON.stringify(workdata)),
      uniforms: LZString.compressToBase64(JSON.stringify(uniforms)),
      aliquots: LZString.compressToBase64(JSON.stringify(aliquots)),
      esocial: LZString.compressToBase64(JSON.stringify(esocial)),
      benefits: LZString.compressToBase64(JSON.stringify(benefits)),
      equipments: LZString.compressToBase64(JSON.stringify(equipments)),
      rents: LZString.compressToBase64(JSON.stringify(rents)),
      fuel: LZString.compressToBase64(JSON.stringify(fuel)),
      monthlycost_total: LZString.compressToBase64(JSON.stringify(monthlycost_total)),
      clients: LZString.compressToBase64(JSON.stringify(clients))
    })
  } catch (err) {
    return res.status(400).render('error', {
      title: 'Grupo Mave Digital - Error!!!',
      message: err[0],
      path: '/budgets',
      menus: [{
        type: 'normal',
        icon: 'rotate-ccw',
        first: false,
        enabled: true,
        title: 'Voltar',
        onclick: "gotoSystem()"
      }],
      error: err
    });
  }
});

router.post(['/budgets/register'], middlewareToken, async (req, res) => {
  let {
    id,
    depreciation,
    segment,
    description,
    quantity,
    investment,
    amortization,
    investmentTotal
  } = getReqProps(req, [
    'id',
    'depreciation',
    'segment',
    'description',
    'quantity',
    'investment',
    'amortization',
    'investmentTotal'
  ]);

  try {
    /**
     * Validação dos parametros
     */
    if (
      typeof id != 'string' ||
      typeof depreciation != 'number' ||
      typeof segment != 'string' ||
      typeof description != 'string' ||
      typeof quantity != 'number' ||
      typeof investment != 'number' ||
      typeof amortization != 'number' ||
      typeof investmentTotal != 'number'
    )
      return res.status(400).send('Grupo Mave Digital - Parameters values is not valid.');

    mongoDB.equipments.register(
      id,
      depreciation,
      segment,
      description,
      quantity,
      investment,
      amortization,
      investmentTotal
    )
      .then(data => res.status(200).send({
        message: 'Grupo Mave Digital - Success!!!',
        data
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

router.get(['/budgets/print'], middlewareToken, async (req, res) => {
  let {
    docname,
    data
  } = getReqProps(req, [
    'docname',
    'data'
  ]);

  try {
    /**
     * Validação dos parametros
     */
    if (
      typeof docname != 'string',
      typeof data != 'string'
    )
      return res.status(400).send('Grupo Mave Digital - Parameters values is not valid.');

    docname = LZString.decompressFromEncodedURIComponent(docname);
    data = JSON.parse(LZString.decompressFromEncodedURIComponent(data));

    const
      path = require('../modules/localPath'),
      fs = require('fs'),
      folder = path.localPath('public/docs'),
      fileName = `${String(docname).toLowerCase()}`;

    if (!fs.existsSync(folder)) fs.mkdirSync(folder);

    let file = `${folder}\\${String(fileName).replace(/\s{1,}/g, '_').toLowerCase()}.pdf`;

    function formatterPDF(__data, __datatotals) {
      // - Soma os valores
      let column = false;
      __data.map(e => {
        if (!column) column = true;

        Object.keys(e)
          .filter(key => {
            if (
              key === 'visibility' ||
              key === 'description' ||
              key === 'scale'
            )
              return false;
            return true;
          })
          .forEach(key => {
            if (typeof __datatotals[key] != 'number')
              __datatotals[key] = 0;

            // - Soma qualquer valor
            if (typeof e[key] === 'number') {
              __datatotals[key] += Number(e[key]);

              if (
                key !== 'quantity' &&
                key !== 'dayswork' &&
                key !== 'depreciation'
              )
                e[key] = Number(parseInt(e[key]).toFixed(2) * 0.01).toLocaleString("pt-BR", {
                  style: 'currency',
                  currency: 'BRL'
                });

              return;
            }

            // - Soma por coluna
            if (
              typeof e[key] === 'object' &&
              e[key]['sumcolumn']
            ) {
              if (column && e['visibility']) {
                __datatotals[key] += Number(e[key]['value']);

                column = false;
              }

              e[key]['value'] = Number(parseInt(e[key]['value']).toFixed(2) * 0.01).toLocaleString("pt-BR", {
                style: 'currency',
                currency: 'BRL'
              });

              return;
            }

            // - Soma pelo total de items
            if (
              typeof e[key] === 'object' &&
              e[key]['items']
            ) {
              if (e['visibility']) {
                __datatotals[key] += Number(e[key]['value']) * Number(e['quantity']);

                e[key]['value'] = Number(parseInt(e[key]['value']).toFixed(2) * 0.01).toLocaleString("pt-BR", {
                  style: 'currency',
                  currency: 'BRL'
                });

                return;
              }
            }

            // - Soma pelo total de items (modo de exibição 2)
            if (
              typeof e[key] === 'object' &&
              e[key]['sumitems']
            ) {
              if (e['visibility']) {
                let n = Number(e[key]['value']) * Number(e['quantity']);
                __datatotals[key] += n;

                e[key]['value'] = Number(parseInt(n).toFixed(2) * 0.01).toLocaleString("pt-BR", {
                  style: 'currency',
                  currency: 'BRL'
                });

                return;
              }
            }

            // - Soma quando a coluna está habilitada
            if (
              typeof e[key] === 'object' &&
              e[key]['enabled']
            ) {
              __datatotals[key] += Number(e[key]['value']);

              e[key]['value'] = Number(parseInt(e[key]['value']).toFixed(2) * 0.01).toLocaleString("pt-BR", {
                style: 'currency',
                currency: 'BRL'
              });

              return;
            }

            // - Define o valor para zero em colunas desabilitadas
            if (
              typeof e[key] === 'object' &&
              !e[key]['enabled']
            ) {
              e[key]['value'] = Number(0).toLocaleString("pt-BR", {
                style: 'currency',
                currency: 'BRL'
              });

              return;
            }
          })
      })

      // - Converte os valores
      Object.keys(__datatotals)
        .filter(key => {
          if (
            key === 'quantity' ||
            key === 'dayswork' ||
            key === 'depreciation'
          )
            return false;
          return true;
        })
        .forEach(key => {
          __datatotals[key] = Number(parseInt(__datatotals[key]).toFixed(2) * 0.01).toLocaleString("pt-BR", {
            style: 'currency',
            currency: 'BRL'
          });
        })

      // - Remove valores em branco
      __data.forEach((e, i) => {
        if (!e['visibility']) {
          if (__datatotals['quantity'])
            __datatotals['quantity'] -= e['quantity'];

          if (__datatotals['dayswork'])
            __datatotals['dayswork'] -= e['dayswork'];

          if (__datatotals['depreciation'])
            __datatotals['depreciation'] -= e['depreciation'];
        }
      });
    }

    formatterPDF(data['workdata'], data['totals']['workdata']);
    formatterPDF(data['benefits'], data['totals']['benefits']);
    formatterPDF(data['uniforms'], data['totals']['uniforms']);
    formatterPDF(data['equipments'], data['totals']['equipments']);

    // - Retira os elementos que não devem ser exibidos
    data['workdata'] = ((__data) => {
      return __data.length > 0 ? __data : false;
    })(data['workdata'].filter(e => !e['visibility'] ? false : true));
    data['benefits'] = ((__data) => {
      return __data.length > 0 ? __data : false;
    })(data['benefits'].filter(e => !e['visibility'] ? false : true));
    data['uniforms'] = ((__data) => {
      return __data.length > 0 ? __data : false;
    })(data['uniforms'].filter(e => !e['visibility'] ? false : true));
    data['equipments'] = ((__data) => {
      return __data.length > 0 ? __data : false;
    })(data['equipments'].filter(e => !e['visibility'] ? false : true));

    pdf.budget(fileName, {
      budgetDesc: data['budgetDesc'],
      budgetID: data['budgetID'],
      datenow: new Date().toLocaleDateString(),
      clientname: data['clientname'],
      chargetotal: data['chargetotal'],
      technicalreserve: data['technicalreserve'],
      indirect: data['indirect'],
      lair: data['lair'],
      iss: data['iss'],
      piscofins: data['piscofins'],
      ir: data['ir'],
      csll: data['csll'],
      totalcost: data['totalcost'],
      taxes: data['taxes'],
      indirectcost: data['indirectcost'],
      profit: data['profit'],
      salevalue: data['salevalue'],
      workdata: data['workdata'],
      benefits: data['benefits'],
      uniforms: data['uniforms'],
      equipments: data['equipments'],
      totals: data['totals']
    })
      .then(() => {
        return res.download(file);
      })
      .catch(err => res.status(400).send({
        message: 'Grupo Mave Digital - Error!!!',
        error: err
      }))
  } catch (err) {
    return res.status(400).send({
      title: 'Grupo Mave Digital - Error!!!',
      message: err
    });
  }
});

/**
 * FILES
 */
router.post(['/upload/file'], middlewareToken, async (req, res) => {
  let {
    custompath
  } = getReqProps(req, [
    'custompath'
  ]);

  try {
    const
      path = require('../modules/localPath'),
      fs = require('fs'),
      file = req.files.attachment,
      folder = typeof custompath === 'string' ? path.localPath(`public/${custompath}`) : path.localPath('public/uploads');

    if (!fs.existsSync(folder)) fs.mkdirSync(folder);

    file.mv(`${folder}\\${file.name}`, (error) => {
      if (error)
        return res.status(400).send({
          success: false,
          data: error
        });

      return res.status(200).send({
        success: true,
        data: file.name
      })
    })
  } catch (err) {
    return res.status(400).render('systemError', {
      title: errorMessages.systemError.title,
      username: email,
      errorResume: errorMessages.systemError.errorResume,
      error: err,
      restoreSession: true
    });
  }
});

// router.get(['/download/file'], async (req, res) => {
//   let {
//     email,
//     webtoken,
//     fileName
//   } = getReqProps(req, ['email', 'webtoken', 'fileName']);

//   if (!email) return res.status(400).render('systemError', {
//     title: errorMessages.emailInvalidError.title,
//     username: email,
//     errorResume: errorMessages.emailInvalidError.errorResume,
//     error: null,
//     restoreSession: true
//   });

//   if (!webtoken) return res.status(401).render('systemError', {
//     title: errorMessages.jwtInvalidError.title,
//     username: email,
//     errorResume: errorMessages.jwtInvalidError.errorResume,
//     error: null,
//     restoreSession: true
//   });

//   if (!fileName) return res.status(401).render('systemError', {
//     title: 'Nome do arquivo não foi encontrado...',
//     username: email,
//     errorResume: 'O nome do arquivo deve ser passado corretamente. Conexão bloqueada!',
//     error: null,
//     restoreSession: null
//   });

//   try {
//     LZString = require('lz-string');

//     email = LZString.decompressFromEncodedURIComponent(email);
//     webtoken = LZString.decompressFromEncodedURIComponent(webtoken);

//     jwt.verify(webtoken)
//       .then((decoded) => {
//         if (decoded['data']['email'] === email) {
//           const
//             path = require('../modules/localPath'),
//             fs = require('fs'),
//             folder = path.localPath('uploads');

//           if (!fs.existsSync(folder)) fs.mkdirSync(folder);

//           let file = `${folder}\\${fileName}`;

//           if (fs.existsSync(file)) {
//             return res.download(file);
//           } else {
//             return res.status(400).send({
//               success: false,
//               data: `Arquivo ${fileName} não foi encontrado no servidor.`
//             });
//           }
//         } else {
//           return res.status(401).render('systemError', {
//             title: errorMessages.jwtToOtherUser.title,
//             username: email,
//             errorResume: errorMessages.jwtToOtherUser.errorResume,
//             error: null,
//             restoreSession: true
//           })
//         }
//       })
//       .catch(err => res.status(400).render('systemError', {
//         title: errorMessages.jwtExpiry.title,
//         username: email,
//         errorResume: errorMessages.jwtExpiry.errorResume,
//         error: err,
//         restoreSession: true
//       }))
//   } catch (err) {
//     return res.status(400).render('systemError', {
//       title: errorMessages.systemError.title,
//       username: email,
//       errorResume: errorMessages.systemError.errorResume,
//       error: err,
//       restoreSession: true
//     });
//   }
// });

router.get(['/help'], middlewareToken, async (req, res) => {
  return res.status(200).render('help', {
    title: 'Grupo Mave Digital',
    menus: [{
      type: 'normal',
      first: false,
      enabled: true,
      title: 'Voltar',
      onclick: 'gotoSystem()'
    }]
  })
});

/**
 * HOME
 */
router.get(['/', '/:usr_token'], middlewareToken, async (req, res) => {
  let {
    token
  } = getReqProps(req, [
    'token'
  ]);

  const { privilege } = token['data'];

  return res.status(200).render('system', {
    title: 'Grupo Mave Digital',
    privilege,
    router: 'Sistema/Tela Inicial.',
    menus: [
      {
        type: 'normal',
        icon: 'home',
        first: true,
        enabled: true,
        title: 'Tela Inicial',
        onclick: ""
      },
      {
        type: 'collapse',
        icon: 'user',
        first: false,
        enabled: true,
        title: 'Minha Conta',
        items: [
          {
            title: 'Minhas Informações',
            icon: 'edit',
            enabled: true,
            onclick: 'perfil()'
          },
          {
            title: 'Meus Documentos',
            icon: 'file-text',
            enabled: false,
            onclick: ''
          }
        ]
      },
      {
        type: 'collapse',
        icon: 'credit-card',
        first: false,
        enabled: privilege === 'administrador' || privilege === 'moderador' ? true : false,
        title: 'Cartões Digitais',
        items: [
          {
            title: 'Criar',
            icon: 'plus-square',
            enabled: true,
            onclick: 'cards_register()'
          },
          {
            title: 'Editar',
            icon: 'edit',
            enabled: true,
            onclick: ''
          },
          {
            title: 'Remover',
            icon: 'x-square',
            enabled: true,
            onclick: ''
          }
        ]
      },
      {
        type: 'collapse',
        icon: 'settings',
        first: false,
        enabled: true,
        title: 'Configurações',
        items: [
          {
            title: 'Segurança',
            icon: 'shield',
            enabled: true,
            onclick: 'securityApp()'
          }
        ]
      },
      {
        type: 'normal',
        icon: 'log-out',
        first: false,
        enabled: true,
        title: 'Sair',
        onclick: "logout()"
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

module.exports = (app) => app.use('/system', router);