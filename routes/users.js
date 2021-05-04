const express = require('express');
const router = express.Router({
  strict: true,
  caseSensitive: true
});
const getClientAddress = require('../modules/getClientAddress');
const debug = require('../modules/log4');
const middlewareAPI = require('../middlewares/api');
const middlewareToken = require('../middlewares/token');
const jwt = require('../modules/jwt');
const bcrypt = require('../modules/bcrypt');
const getReqProps = require('../modules/getReqProps');
const mongoDB = require('../modules/mongodb');
const nodemailer = require('../modules/nodemailer');
const LZString = require('lz-string');
const hasPrivilege = require('../modules/hasPrivilege');

router.get(['/perfil'], middlewareToken, async (req, res) => {
  let {
    token
  } = getReqProps(req, [
    'token'
  ]);

  try {
    mongoDB.users.get('authorization', token['data']['auth'])
      .then(response => {
        let users = response['users'] != undefined ? response['users'] : response['user'];

        if (users.length >= 1) users = users[0];

        const
          privilege = token['data']['privilege'],
          fotoPerfil = users['fotoPerfil'],
          email = users['email'],
          username = users['username'],
          name = users['name'],
          surname = users['surname'],
          cnpj = users['cnpj'],
          location = users['location'];

        debug.info('user', `Pagina de Perfil(${token['data']['auth']}) Entregue`, [`IP-Request: ${getClientAddress(req)}`, `Router - GET`, `Path: /user/perfil`]);

        return res.status(200).render('userPerfil', {
          title: 'Grupo Mave Digital',
          router: 'Sistema/Minha Conta/Minhas Informações.',
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
          privilege: hasPrivilege.alias(privilege.reverse()[0]),
          fotoPerfil: fotoPerfil,
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
        debug.fatal('user', `Erro na entrega da pagina de Perfil(${token['data']['auth']})`, err, [`IP-Request: ${getClientAddress(req)}`, `Router - GET`, `Path: /user/perfil`]);

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
    debug.fatal('user', `Erro na entrega da pagina de Perfil(${token['data']['auth']})`, err, [`IP-Request: ${getClientAddress(req)}`, `Router - GET`, `Path: /user/perfil`]);

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
 * Notifications
 */
router.get(['/notifications'], middlewareToken, async (req, res) => {
  let {
    token
  } = getReqProps(req, [
    'token'
  ]);

  try {
    mongoDB.users.get('authorization', token['data']['auth'])
      .then(response => {
        let users = response['users'] != undefined ? response['users'] : response['user'];

        if (users.length >= 1) users = users[0];

        const notifications = users['notifications'];

        debug.info('user', `Notificações da conta(${token['data']['auth']}) Entregue`, [`IP-Request: ${getClientAddress(req)}`, `Router - GET`, `Path: /user/notifications`]);

        return res.status(200).send({
          message: 'Grupo Mave Digital',
          notifications
        })
      })
      .catch(err => {
        debug.fatal('user', `Erro na hora de entregar as notificações da conta(${token['data']['auth']})`, err, [`IP-Request: ${getClientAddress(req)}`, `Router - GET`, `Path: /user/notifications`]);

        return res.status(400).send({
          message: 'Grupo Mave Digital - Error!!!',
          error: err
        });
      })
  } catch (err) {
    debug.fatal('user', `Erro na hora de entregar as notificações da conta(${token['data']['auth']})`, err, [`IP-Request: ${getClientAddress(req)}`, `Router - GET`, `Path: /user/notifications`]);

    return res.status(400).send({
      message: 'Grupo Mave Digital - Error!!!',
      error: err
    });
  }
});

router.post(['/notifications/create'], middlewareToken, async (req, res) => {
  let {
    authorization,
    title,
    subtitle,
    body,
    background,
    expires
  } = getReqProps(req, [
    'authorization',
    'title',
    'subtitle',
    'body',
    'background',
    'expires'
  ]);

  try {
    /**
     * Validação dos parametros
     */
    if (
      typeof authorization != 'string',
      typeof title != 'string',
      typeof subtitle != 'string',
      typeof body != 'string',
      typeof background != 'string',
      typeof expires != 'string'
    )
      return res.status(401).send('Grupo Mave Digital - Parameters values is not valid.');

    mongoDB.users.notificationCreate(authorization, title, subtitle, body, background, expires)
      .then(response => {
        debug.info('user', `Notificação criada para a conta(${authorization})`, [`IP-Request: ${getClientAddress(req)}`, `Router - POST`, `Path: /user/notifications/create`]);

        return res.status(200).send({
          message: 'Grupo Mave Digital',
          data: response
        })
      })
      .catch(err => {
        debug.fatal('user', `Erro na hora de criar a notificação para a conta(${authorization})`, err, [`IP-Request: ${getClientAddress(req)}`, `Router - POST`, `Path: /user/notifications/create`]);

        return res.status(400).send({
          message: 'Grupo Mave Digital - Error!!!',
          error: err
        });
      })
  } catch (err) {
    debug.fatal('user', `Erro na hora de criar a notificação para a conta(${authorization})`, err, [`IP-Request: ${getClientAddress(req)}`, `Router - POST`, `Path: /user/notifications/create`]);

    return res.status(400).send({
      message: 'Grupo Mave Digital - Error!!!',
      error: err
    });
  }
});

router.post(['/notifications/remove'], middlewareToken, async (req, res) => {
  let {
    token,
    id
  } = getReqProps(req, [
    'token',
    'id'
  ]);

  try {
    /**
     * Validação dos parametros
     */
    if (
      typeof id != 'number'
    )
      return res.status(401).send('Grupo Mave Digital - Parameters values is not valid.');

    mongoDB.users.notificationRemove(token['data']['auth'], id)
      .then(response => {
        debug.info('user', `Notificação removida para a conta(${token['data']['auth']})`, `Notificação ID(${id})`, [`IP-Request: ${getClientAddress(req)}`, `Server - POST`, `Path: /user/notifications/remove`]);

        return res.status(200).send({
          message: 'Grupo Mave Digital',
          data: response
        })
      })
      .catch(err => {
        debug.fatal('user', `Erro na hora de remover a notificação para a conta(${token['data']['auth']})`, err, [`IP-Request: ${getClientAddress(req)}`, `Router - POST`, `Path: /user/notifications/remove`]);

        return res.status(400).send({
          message: 'Grupo Mave Digital - Error!!!',
          error: err
        })
      })
  } catch (err) {
    debug.fatal('user', `Erro na hora de remover a notificação para a conta(${token['data']['auth']})`, err, [`IP-Request: ${getClientAddress(req)}`, `Router - POST`, `Path: /user/notifications/remove`]);

    return res.status(400).send({
      message: 'Grupo Mave Digital - Error!!!',
      error: err
    });
  }
});

/**
 * Auth
 */

router.get(['/auth'], async (req, res) => {
  debug.info('', `Pagina de Autenticação Entregue`, [`IP-Request: ${getClientAddress(req)}`, `Server - GET`, `Path: /user/auth`]);

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
 * Auth Security
 */
router.get(['/auth/security'], middlewareToken, async (req, res) => {
  let {
    token
  } = getReqProps(req, [
    'token'
  ]);

  try {
    /**
     * Validação dos parametros
     */
    if (
      typeof token != 'object'
    )
      return res.status(401).send('Grupo Mave Digital - Parameters values is not valid.');

    const {
      auth,
      privilege
    } = token['data'];

    mongoDB.users.get('authorization', auth)
      .then(response => {
        let {
          users
        } = response;

        let {
          twofactor
        } = users[0]['authentication'];

        debug.info('user', `Pagina de Configurações de Segurança Entregue`, auth, [`IP-Request: ${getClientAddress(req)}`, `Server - GET`, `Path: /user/auth/security`]);

        return res.status(200).render('auth-security', {
          title: 'Grupo Mave Digital',
          router: 'Configurações/Segurança.',
          privilege: hasPrivilege.alias(privilege.reverse()[0]),
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
          twofactor_enabled: twofactor['enabled']
        })
      })
      .catch(err => {
        debug.fatal('user', `Erro na entrega da pagina de Configurações de Segurança`, auth, err, [`IP-Request: ${getClientAddress(req)}`, `Server - GET`, `Path: /user/auth/security`]);

        return res.status(400).send({
          message: 'Grupo Mave Digital - Error!!!',
          error: err
        })
      })
  } catch (err) {
    debug.fatal('user', `Erro na entrega da pagina de Configurações de Segurança`, auth, err, [`IP-Request: ${getClientAddress(req)}`, `Server - GET`, `Path: /user/auth/security`]);

    return res.status(400).send({
      message: 'Grupo Mave Digital - Error!!!',
      error: err
    });
  }
});

router.get(['/auth/security/retrieve/twofactor'], async (req, res) => {
  let {
    token
  } = getReqProps(req, [
    'token'
  ]);

  try {
    /**
     * Validação dos parametros
     */

    if (
      typeof token != 'string'
    )
      return res.status(401).send('Grupo Mave Digital - Parameters values is not valid.');

    jwt.verify(token)
      .then(decoded => {
        if (decoded['data'] && decoded['data']['econfirm']) {
          debug.info('user', `Pagina de Recuperação da Conta Entregue`, decoded['data']['authorization'], [`IP-Request: ${getClientAddress(req)}`, `Server - GET`, `Path: /user/auth/security/retrieve/twofactor`]);

          mongoDB.users.retrieve(decoded['data']['authorization'])
            .then(() => {
              debug.info('user', `Conta(${decoded['data']['authorization']}) Recuperada`, [`IP-Request: ${getClientAddress(req)}`, `Server - GET`, `Path: /user/auth/security/retrieve/twofactor`]);

              return res.status(200).render('account-retrieve', {
                'message': 'Sua conta foi recuperada, obrigado. Você já pode fechar essa janela!',
                'menus': []
              })
            })
            .catch(err => {
              debug.fatal('user', `Erro na hora de recuperar a conta(${decoded['data']['authorization']})`, err, [`IP-Request: ${getClientAddress(req)}`, `Server - GET`, `Path: /user/auth/security/retrieve/twofactor`]);

              return res.status(400).render('account-retrieve', {
                'message': 'Sua conta não pode ser recuperada. Fale com o administrador.',
                'menus': [],
                'error': err
              })
            })
        } else {
          debug.fatal('user', `Erro na hora de recuperar a conta`, [`IP-Request: ${getClientAddress(req)}`, `Server - GET`, `Path: /user/auth/security/retrieve/twofactor`]);

          return res.status(400).render('account-retrieve', {
            'message': 'Link de recuperação da conta está invalido!',
            'menus': []
          })
        }
      })
      .catch(err => {
        let msg = 'Link de recuperação da conta está expirado. Solicite um novo email de recuperação da conta.';

        debug.fatal('user', msg, err, [`IP-Request: ${getClientAddress(req)}`, `Server - GET`, `Path: /user/auth/security/retrieve/twofactor`]);

        return res.status(400).render('account-retrieve', {
          'message': msg,
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
    debug.fatal('user', `Erro na exibição da pagina de recuperação da conta`, err, [`IP-Request: ${getClientAddress(req)}`, `Server - GET`, `Path: /user/auth/security/retrieve/twofactor`]);

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

router.get(['/email/confirm'], async (req, res) => {
  let {
    token
  } = getReqProps(req, [
    'token'
  ]);

  try {
    /**
     * Validação dos parametros
     */

    if (
      typeof token != 'string'
    )
      return res.status(401).send('Grupo Mave Digital - Parameters values is not valid.');

    jwt.verify(token)
      .then(decoded => {
        if (decoded['data'] && decoded['data']['econfirm']) {
          mongoDB.users.cemail(decoded['data']['email'], decoded['data']['authorization'])
            .then(() => {
              debug.info('user', `Conta(${decoded['data']['authorization']}) confirmada`, [`IP-Request: ${getClientAddress(req)}`, `Server - GET`, `Path: /user/email/confirm`]);

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
              debug.fatal('user', `Erro na hora de confirmar a conta(${decoded['data']['authorization']})`, err, [`IP-Request: ${getClientAddress(req)}`, `Server - GET`, `Path: /user/email/confirm`]);

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
          let msg = 'Link de confirmação da conta está invalido!';

          debug.fatal('user', msg, [`IP-Request: ${getClientAddress(req)}`, `Server - GET`, `Path: /user/email/confirm`]);

          return res.status(400).render('email-confirm', {
            'title': 'Talvez seja necessário pedir outro email para o administrador.',
            'message': msg,
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
        let msg = 'Link de confirmação da conta está expirado. Solicite um novo email de confirmação da conta para o administrador.';

        debug.fatal('user', msg, err, [`IP-Request: ${getClientAddress(req)}`, `Server - GET`, `Path: /user/email/confirm`]);

        return res.status(400).render('email-confirm', {
          'title': 'Não se preocupe, você poderá ativar sua conta em outro momento.',
          'message': msg,
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
    debug.fatal('user', `Erro na exibição da pagina de confirmação da conta`, err, [`IP-Request: ${getClientAddress(req)}`, `Server - GET`, `Path: /user/email/confirm`]);

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

router.use(['*'], async (req, res) => {
  debug.fatal('user', `Pagina não roteada solicitada`, req.originalUrl, [`IP-Request: ${getClientAddress(req)}`, `Server - *`, `Path: /user/*`]);

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

module.exports = (app) => app.use('/user', router);