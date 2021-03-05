const express = require('express');
const router = express.Router({
  strict: true,
  caseSensitive: true
});
const getClientAddress = req => (req.headers['x-forwarded-for'] || '').split(',')[0] || req.connection.remoteAddress;
const middlewareAPI = require('../middlewares/api');
const middlewareToken = require('../middlewares/token');
const jwt = require('../modules/jwt');
const bcrypt = require('../modules/bcrypt');
const getReqProps = require('../modules/getReqProps');
const mongoDB = require('../modules/mongodb');
const nodemailer = require('../modules/nodemailer');
const LZString = require('lz-string');
const pdf = require('../modules/pdf');

function usr_econfirm(email, username, authorization) {
  return nodemailer.usr_econfirm(email, username, jwt.sign({
    'econfirm': true,
    'email': email,
    'authorization': authorization
  }, '7d'))
    .then(info => console.log(`Email de confirmação da conta enviado para ${email}`, info))
    .catch(err => console.log(`Email de confirmação da conta não pode ser enviado para ${email}`, err))
}

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
          privilege: privilege,
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
      .catch(err => res.status(400).render('error', {
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
      }))
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

        return res.status(200).send({
          message: 'Grupo Mave Digital',
          notifications
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
        return res.status(200).send({
          message: 'Grupo Mave Digital',
          data: response
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
        return res.status(200).send({
          message: 'Grupo Mave Digital',
          data: response
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
 * DOCS
 */
router.get(['/docs'], middlewareToken, async (req, res) => {
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
          authorization = token['data']['auth'],
          name = users['name'],
          surname = users['surname'],
          cnpj = users['cnpj'],
          location = users['location'],
          dateEx = require('../modules/dateEx');

        return res.status(200).render('userDocs', {
          title: 'Grupo Mave Digital',
          menus: [{
            type: 'normal',
            first: true,
            enabled: true,
            title: 'Meus Documentos',
            onclick: ""
          }, {
            type: 'normal',
            first: false,
            enabled: true,
            title: 'Voltar',
            onclick: 'gotoSystem()'
          }],
          authorization: authorization,
          day: dateEx.nowToPDF('day'),
          month: dateEx.nowToPDF('month'),
          year: dateEx.nowToPDF('year'),
          name: name,
          surname: surname,
          street: location['street'],
          number: location['number'],
          district: location['district'],
          state: location['state'],
          city: location['city'],
          zipcode: location['zipcode'],
          cnpj: cnpj,
          valor: '5.846,00',
          acordo_de_confidencialidade: users['docs']['acordo_de_confidencialidade'] || {},
          confidencialidade_assinado: ((filter) => {
            if (
              users['docs'][filter] &&
              users['docs'][filter]['status']
            )
              return 'Assinado';
            else if (
              users['docs'][filter] &&
              users['docs'][filter]['reading'] === 'pending'
            )
              return 'Aguardando Assinatura';
            else if (
              users['docs'][filter] &&
              users['docs'][filter]['reading'] === 'analyze'
            )
              return 'Aguardando Aprovação';
            else
              return 'Disponível'
          })('acordo_de_confidencialidade'),
          acordo_de_parceria: users['docs']['acordo_de_parceria'] || {},
          parceria_assinado: ((filter) => {
            if (
              users['docs'][filter] &&
              users['docs'][filter]['status']
            )
              return 'Assinado';
            else if (
              users['docs'][filter] &&
              users['docs'][filter]['reading'] === 'pending'
            )
              return 'Aguardando Assinatura';
            else if (
              users['docs'][filter] &&
              users['docs'][filter]['reading'] === 'analyze'
            )
              return 'Aguardando Aprovação';
            else
              return 'Disponível';
          })('acordo_de_parceria')
        })
      })
      .catch(err => res.status(400).render('error', {
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
      }))
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

router.get(['/docs/print'], middlewareToken, async (req, res) => {
  let {
    authorization,
    docname,
    name,
    street,
    number,
    district,
    state,
    city,
    zipcode,
    cnpj,
    day,
    month,
    year,
    valor
  } = getReqProps(req, [
    'authorization',
    'docname',
    'name',
    'street',
    'number',
    'district',
    'state',
    'city',
    'zipcode',
    'cnpj',
    'day',
    'month',
    'year',
    'valor'
  ]);

  try {
    /**
     * Validação dos parametros
     */
    if (
      typeof authorization != 'string' ||
      typeof docname != 'string' ||
      typeof name != 'string' ||
      typeof street != 'string' ||
      typeof number != 'string' ||
      typeof district != 'string' ||
      typeof state != 'string' ||
      typeof city != 'string' ||
      typeof zipcode != 'string' ||
      typeof cnpj != 'string' ||
      typeof day != 'string' ||
      typeof month != 'string' ||
      typeof year != 'string' ||
      typeof valor != 'string'
    )
      return res.status(401).send('Grupo Mave Digital - Parameters values is not valid.');

    const
      path = require('../modules/localPath'),
      fs = require('fs'),
      folder = path.localPath('public/docs'),
      fileName = `${String(authorization).toLowerCase()} ${String(docname).toLowerCase()}`;

    if (!fs.existsSync(folder)) fs.mkdirSync(folder);

    if (docname === 'ACORDO DE CONFIDENCIALIDADE') {
      pdf.termo_confidencialidade(String(fileName).replace(/\s{1,}/g, '_').toLowerCase(), {
        name,
        street,
        number,
        district,
        state,
        city,
        zipcode,
        cnpj,
        day,
        month,
        year
      })
        .then(() => pdf_send())
        .catch(err => res.status(400).send({
          message: 'Grupo Mave Digital - Error!!!',
          error: err
        }))
    } else if (docname === 'ACORDO DE PARCERIA') {
      pdf.contrato_de_parceria(String(fileName).replace(/\s{1,}/g, '_').toLowerCase(), {
        name,
        street,
        number,
        district,
        state,
        city,
        zipcode,
        cnpj,
        day,
        month,
        year,
        valor,
        clientes: []
      })
        .then(() => pdf_send())
        .catch(err => res.status(400).send({
          message: 'Grupo Mave Digital - Error!!!',
          error: err
        }))
    } else
      return res.status(400).send({
        message: 'Grupo Mave Digital - Error!!!',
        error: `O nome do arquivo ${docname} não faz parte dos nossos layouts.`
      });

    function pdf_send() {
      let file = `${folder}\\${String(fileName).replace(/\s{1,}/g, '_').toLowerCase()}.pdf`;

      mongoDB.users.updateDoc(authorization, {
        doc: '',
        readuser: '',
        reading: 'reading',
        status: false,
        postdate: ''
      }, String(docname).replace(/\s{1,}/g, '_').toLowerCase())
        .then(() => {
          if (fs.existsSync(file)) {
            return res.download(file);
          } else {
            return res.status(400).send({
              message: 'Grupo Mave Digital - Error!!!',
              error: `Arquivo ${file} não foi encontrado no servidor.`
            });
          }
        })
        .catch(err => res.status(400).send({
          message: 'Grupo Mave Digital - Error!!!',
          error: err
        }))
    }
  } catch (err) {
    return res.status(400).send({
      message: 'Grupo Mave Digital - Error!!!',
      error: err
    });
  }
});

router.post(['/docs/upload'], middlewareToken, async (req, res) => {
  let {
    authorization,
    docname
  } = getReqProps(req, [
    'authorization',
    'docname'
  ]);

  /**
   * Validação dos parametros
   */
  if (
    typeof authorization != 'string' ||
    typeof docname != 'string'
  )
    return res.status(401).send('Grupo Mave Digital - Parameters values is not valid.');

  try {
    const
      path = require('../modules/localPath'),
      fs = require('fs'),
      file = req.files.attachment,
      folder = path.localPath('public/docs'),
      fileName = `${String(authorization).toLowerCase()} ${String(docname).toLowerCase()}`,
      fileFullPath = `${folder}\\${String(fileName).replace(/\s{1,}/g, '_').toLowerCase()}.pdf`,
      dateEx = require('../modules/dateEx');

    if (!fs.existsSync(folder)) fs.mkdirSync(folder);

    file.mv(fileFullPath, (error) => {
      if (error)
        return res.status(400).send({
          message: 'Grupo Mave Digital - Error!!!',
          error: err
        });

      mongoDB.users.updateDoc(authorization, {
        doc: fileFullPath,
        reading: 'pending',
        postdate: dateEx.now()
      }, String(docname).replace(/\s{1,}/g, '_').toLowerCase())
        .then(() => {
          return res.status(200).send('Documento hospedado com sucesso!');
        })
        .catch(err => res.status(400).send({
          message: 'Grupo Mave Digital - Error!!!',
          error: err
        }))
    })
  } catch (err) {
    return res.status(400).send({
      message: 'Grupo Mave Digital - Error!!!',
      error: err
    });
  }
});

router.post(['/docs/approve'], middlewareToken, async (req, res) => {
  let {
    token,
    authorization,
    docname
  } = getReqProps(req, [
    'token',
    'authorization',
    'docname'
  ]);

  /**
   * Validação dos parametros
   */
  if (
    typeof authorization != 'string' ||
    typeof docname != 'string'
  )
    return res.status(401).send('Grupo Mave Digital - Parameters values is not valid.');

  try {
    const
      path = require('../modules/localPath'),
      fs = require('fs'),
      folder = path.localPath('public/docs'),
      fileName = `${String(authorization).toLowerCase()} ${String(docname).toLowerCase()}`,
      fileFullPath = `${folder}\\${String(fileName).replace(/\s{1,}/g, '_').toLowerCase()}.pdf`;

    if (!fs.existsSync(folder)) fs.mkdirSync(folder);

    if (fs.existsSync(fileFullPath)) {
      mongoDB.users.updateDoc(authorization, {
        readuser: token['data']['auth'],
        reading: 'approve',
        status: true
      }, String(docname).replace(/\s{1,}/g, '_').toLowerCase())
        .then(() => {
          return res.status(200).send('Documento aprovado com sucesso!');
        })
        .catch(err => res.status(400).send({
          message: 'Grupo Mave Digital - Error!!!',
          error: err
        }))
    } else {
      return res.status(400).send({
        message: 'Grupo Mave Digital - Error!!!',
        error: `Arquivo ${fileFullPath} não foi encontrado no servidor.`
      });
    }
  } catch (err) {
    return res.status(400).send({
      message: 'Grupo Mave Digital - Error!!!',
      error: err
    });
  }
});

router.post(['/docs/reject'], middlewareToken, async (req, res) => {
  let {
    token,
    authorization,
    docname
  } = getReqProps(req, [
    'token',
    'authorization',
    'docname'
  ]);

  /**
   * Validação dos parametros
   */
  if (
    typeof authorization != 'string' ||
    typeof docname != 'string'
  )
    return res.status(401).send('Grupo Mave Digital - Parameters values is not valid.');

  try {
    const
      path = require('../modules/localPath'),
      fs = require('fs'),
      folder = path.localPath('public/docs'),
      fileName = `${String(authorization).toLowerCase()} ${String(docname).toLowerCase()}`,
      fileFullPath = `${folder}\\${String(fileName).replace(/\s{1,}/g, '_').toLowerCase()}.pdf`;

    if (!fs.existsSync(folder)) fs.mkdirSync(folder);

    if (fs.existsSync(fileFullPath)) {
      fs.unlinkSync(fileFullPath);

      mongoDB.users.updateDoc(authorization, {
        readuser: token['data']['auth'],
        reading: '',
        status: false
      }, String(docname).replace(/\s{1,}/g, '_').toLowerCase())
        .then(() => {
          return res.status(200).send('Documento recusado com sucesso!');
        })
        .catch(err => res.status(400).send({
          message: 'Grupo Mave Digital - Error!!!',
          error: err
        }))
    } else {
      return res.status(400).send({
        message: 'Grupo Mave Digital - Error!!!',
        error: `Arquivo ${fileFullPath} não foi encontrado no servidor.`
      });
    }
  } catch (err) {
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
  return res.status(200).render('login', {
    title: 'Grupo Mave Digital',
    menus: [{
      type: 'normal',
      icon: 'home',
      first: false,
      enabled: true,
      title: 'Home',
      onclick: "home()"
    },
    {
      type: 'normal',
      icon: 'power',
      first: true,
      enabled: true,
      title: 'Acessar',
      onclick: ""
    }]
  })
});

/**
 * Migrado para GraphQL em 04/03/2021
 */
router.post(['/auth/login'], async (req, res) => {
  let {
    usr_authorization,
    password,
    usr_twofactortoken,
    locationIP,
    internetAdress
  } = getReqProps(req, [
    'usr_authorization',
    'password',
    'usr_twofactortoken',
    'locationIP',
    'internetAdress'
  ]);

  try {
    /**
     * Validação dos parametros
     */
    usr_authorization = LZString.decompressFromEncodedURIComponent(usr_authorization);
    password = LZString.decompressFromEncodedURIComponent(password);
    usr_twofactortoken = LZString.decompressFromEncodedURIComponent(usr_twofactortoken);
    locationIP = LZString.decompressFromEncodedURIComponent(locationIP);
    internetAdress = LZString.decompressFromEncodedURIComponent(internetAdress);

    if (
      typeof usr_authorization != 'string' ||
      typeof password != 'string' ||
      typeof locationIP != 'string' ||
      typeof internetAdress != 'string'
    )
      return res.status(401).send('Grupo Mave Digital - Parameters values is not valid.');

    mongoDB.users.cpassword(usr_authorization, password)
      .then(response => {
        let user = response['user'],
          data = response;

        if (user['authentication']['twofactor']['enabled'] && usr_twofactortoken.length <= 0) {
          return res.status(200).send({
            message: 'Grupo Mave Digital - Success!!!',
            data: 'twofactorVerify'
          })
        } else if (user['authentication']['twofactor']['enabled'] && usr_twofactortoken.length > 0) {
          mongoDB.users.verifytwofactor(usr_authorization, usr_twofactortoken)
            .then(response => {
              if (!response)
                return res.status(200).send({
                  message: 'Grupo Mave Digital - Success!!!',
                  data: 'twofactorDenied'
                })
              else
                __next();
            })
            .catch(err => res.status(400).send({
              message: 'Grupo Mave Digital - Error!!!',
              error: err
            }))
        } else {
          __next();
        }

        async function __next() {
          try {
            user['token'] = jwt.sign({
              "privilege": user['privilege'],
              "auth": usr_authorization,
              "pass": password
            }, `${user['session']['cache']['tmp']}${user['session']['cache']['unit']}`);

            await mongoDB.users.connected(usr_authorization, {
              ip: getClientAddress(req),
              token: user['token'],
              device: req.device['type'],
              location: {
                locationIP,
                internetAdress,
                browser: req.device.parser.useragent['family'],
                os: req.device.parser.useragent['os']['family']
              }
            });

            return res.status(200).send({
              message: 'Grupo Mave Digital - Success!!!',
              data: data
            })
          } catch (e) {
            if (e[1] === 'exceeded')
              return res.status(200).send({
                message: 'Grupo Mave Digital - Success!!!',
                data: 'exceeded'
              })
            else if (e[1] === 'deviceblocked')
              return res.status(200).send({
                message: 'Grupo Mave Digital - Success!!!',
                data: 'deviceblocked'
              })
            else
              return res.status(200).send({
                message: 'Grupo Mave Digital - Success!!!',
                data: e
              })
          }
        }
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

router.post(['/auth/logout'], middlewareToken, async (req, res) => {
  let {
    token,
    usr_token
  } = getReqProps(req, [
    'token',
    'usr_token'
  ]);

  const usr_authorization = token['data']['auth'];

  try {
    if (
      typeof usr_authorization != 'string'
    )
      return res.status(401).send('Grupo Mave Digital - Parameters values is not valid.');

    mongoDB.users.disconnected(usr_authorization, {
      ip: getClientAddress(req),
      token: usr_token
    })
      .then(async () => {
        return res.status(200).send({
          message: 'Grupo Mave Digital - Success!!!',
          data: null
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

router.post(['/auth/expired'], async (req, res) => {
  let {
    usr_authorization,
    usr_token
  } = getReqProps(req, [
    'usr_authorization',
    'usr_token'
  ]);

  try {
    if (
      typeof usr_authorization != 'string' ||
      typeof usr_token != 'string'
    )
      return res.status(401).send('Grupo Mave Digital - Parameters values is not valid.');

    mongoDB.users.disconnected(usr_authorization, {
      ip: getClientAddress(req),
      token: usr_token
    })
      .then(() => {
        return res.status(200).send({
          message: 'Grupo Mave Digital - Success!!!',
          data: null
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

        return res.status(200).render('auth-security', {
          title: 'Grupo Mave Digital',
          router: 'Configurações/Segurança.',
          privilege,
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

router.post(['/auth/security/sign/twofactor'], middlewareToken, async (req, res) => {
  let {
    usr_authorization
  } = getReqProps(req, [
    'usr_authorization'
  ]);

  try {
    /**
     * Validação dos parametros
     */
    if (
      typeof usr_authorization != 'string'
    )
      return res.status(401).send('Grupo Mave Digital - Parameters values is not valid.');

    mongoDB.users.signtwofactor(usr_authorization)
      .then(response => res.status(200).send(response))
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

router.post(['/auth/security/verify/twofactor'], middlewareToken, async (req, res) => {
  let {
    usr_authorization,
    usertoken
  } = getReqProps(req, [
    'usr_authorization',
    'usertoken'
  ]);

  try {
    /**
     * Validação dos parametros
     */
    if (
      typeof usr_authorization != 'string' ||
      typeof usertoken != 'string'
    )
      return res.status(401).send('Grupo Mave Digital - Parameters values is not valid.');

    mongoDB.users.verifytwofactor(usr_authorization, usertoken)
      .then(response => res.status(200).send(response))
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

router.post(['/auth/security/enabled/twofactor'], middlewareToken, async (req, res) => {
  let {
    usr_authorization
  } = getReqProps(req, [
    'usr_authorization'
  ]);

  try {
    /**
     * Validação dos parametros
     */
    if (
      typeof usr_authorization != 'string'
    )
      return res.status(401).send('Grupo Mave Digital - Parameters values is not valid.');

    mongoDB.users.enabledtwofactor(usr_authorization)
      .then(response => res.status(200).send(response))
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

router.post(['/auth/security/disabled/twofactor'], middlewareToken, async (req, res) => {
  let {
    usr_authorization
  } = getReqProps(req, [
    'usr_authorization'
  ]);

  try {
    /**
     * Validação dos parametros
     */
    if (
      typeof usr_authorization != 'string'
    )
      return res.status(401).send('Grupo Mave Digital - Parameters values is not valid.');

    mongoDB.users.disabledtwofactor(usr_authorization)
      .then(response => res.status(200).send(response))
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

router.post(['/auth/security/retrieve/twofactor'], async (req, res) => {
  let {
    usr_authorization
  } = getReqProps(req, [
    'usr_authorization'
  ]);

  try {
    /**
     * Validação dos parametros
     */
    if (
      typeof usr_authorization != 'string'
    )
      return res.status(401).send('Grupo Mave Digital - Parameters values is not valid.');

    mongoDB.users.get('authorization', usr_authorization)
      .then(response => {
        let users = response['users'] != undefined ? response['users'] : response['user'];

        if (users.length >= 1) users = users[0];

        const {
          email,
          username
        } = users;

        nodemailer.usr_account_retrieve_twofactor(email, username, jwt.sign({
          'econfirm': true,
          'authorization': usr_authorization
        }, '7d'))
          .then(info => console.log(`Email de recuperação da conta enviado para ${email}`, info))
          .catch(err => console.log(`Email de recuperação da conta não pode ser enviado para ${email}`, err))
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

router.get(['/auth/security/retrieve/twofactor', '/auth/security/retrieve/twofactor/:token'], async (req, res) => {
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
          mongoDB.users.retrieve(decoded['data']['authorization'])
            .then(() => res.status(200).render('account-retrieve', {
              'message': 'Sua conta foi recuperada, obrigado. Você já pode fechar essa janela!',
              'menus': []
            }))
            .catch(err => res.status(400).render('account-retrieve', {
              'message': 'Sua conta não pode ser recuperada. Fale com o administrador.',
              'menus': [],
              'error': err
            }))
        } else
          return res.status(400).render('account-retrieve', {
            'message': 'Link de recuperação da conta está invalido!',
            'menus': []
          })
      })
      .catch(err => res.status(400).render('account-retrieve', {
        'message': 'Link de recuperação da conta está expirado. Solicite um novo email de recuperação da conta.',
        'menus': [{
          type: 'normal',
          first: false,
          enabled: true,
          title: 'Voltar',
          onclick: 'gotoSystem()'
        }],
        'error': err
      }));
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

// Migrado para GraphQL em 05/03/2021
router.post(['/auth/security/change/password'], middlewareToken, async (req, res) => {
  let {
    usr_authorization,
    password,
    new_password
  } = getReqProps(req, [
    'usr_authorization',
    'password',
    'new_password'
  ]);

  try {
    /**
     * Validação dos parametros
     */
    if (
      typeof usr_authorization != 'string' ||
      typeof password != 'string' ||
      typeof new_password != 'string'
    )
      return res.status(401).send('Grupo Mave Digital - Parameters values is not valid.');

    bcrypt.crypt(new_password)
      .then(async password_encode => {
        try {
          await mongoDB.users.cpassword(usr_authorization, password);

          mongoDB.users.changepassword(usr_authorization, password_encode)
            .then(() => res.status(200).send(true))
            .catch(err => res.status(400).send({
              message: 'Grupo Mave Digital - Error!!!',
              error: err
            }))
        } catch {
          return res.status(200).send(false);
        }
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

router.post(['/register'], middlewareAPI, async (req, res) => {
  let {
    usr_authorization,
    privilege,
    fotoPerfil,
    username,
    password,
    name,
    surname,
    email,
    cnpj,
    location
  } = getReqProps(req, [
    'usr_authorization',
    'privilege',
    'fotoPerfil',
    'username',
    'password',
    'name',
    'surname',
    'email',
    'cnpj',
    'location'
  ]);

  try {
    /**
     * Validação dos parametros
     */

    if (!fotoPerfil) fotoPerfil = 'avatar.png';

    if (
      typeof usr_authorization != 'string' ||
      typeof privilege != 'string' ||
      typeof username != 'string' ||
      typeof password != 'string' ||
      typeof name != 'string' ||
      typeof surname != 'string' ||
      typeof email != 'string' ||
      typeof cnpj != 'string' ||
      typeof location != 'object'
    )
      return res.status(401).send('Grupo Mave Digital - Parameters values is not valid.');

    bcrypt.crypt(password)
      .then(password_encode => {
        mongoDB.users.register(
          usr_authorization,
          privilege,
          fotoPerfil,
          username,
          password_encode,
          name,
          surname, {
          value: email
        },
          cnpj,
          location
        )
          .then(async response => {
            let users = response['users'] != undefined ? response['users'] : response['user'];

            // Envia o email de confirmação da conta
            await usr_econfirm(users['email'], users['username'], usr_authorization);

            return res.status(200).send({
              message: 'Grupo Mave Digital - Success!!!',
              data: users
            })
          })
          .catch(err => res.status(400).send({
            message: 'Grupo Mave Digital - Error!!!',
            error: err
          }))
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

router.post(['/email/resend/confirm'], middlewareAPI, async (req, res) => {
  let {
    usr_authorization
  } = getReqProps(req, [
    'usr_authorization'
  ]);

  try {
    /**
     * Validação dos parametros
     */

    if (
      typeof usr_authorization != 'string'
    )
      return res.status(401).send('Grupo Mave Digital - Parameters values is not valid.');

    mongoDB.users.get('authorization', usr_authorization)
      .then(async response => {
        let users = response['users'] != undefined ? response['users'] : response['user'];

        if (users.length >= 1) users = users[0];

        const email = users['email'],
          username = users['username'];

        await usr_econfirm(email, username, usr_authorization);

        return res.status(200).send(`Foi enviada uma solicitação de envio de email. Para confirmação da conta do ${username} com o email ${email}.`);
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

router.get(['/email/confirm', '/email/confirm/:token'], async (req, res) => {
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
            .then(() => res.status(200).render('email-confirm', {
              'message': 'Sua conta foi verificada, obrigado. Você já pode fechar essa janela!',
              'menus': []
            }))
            .catch(err => res.status(400).render('email-confirm', {
              'message': 'Sua conta não pode ser verificada. Fale com o administrador.',
              'menus': [],
              'error': err
            }))
        } else
          return res.status(400).render('email-confirm', {
            'message': 'Link de confirmação da conta está invalido!',
            'menus': []
          })
      })
      .catch(err => res.status(400).render('email-confirm', {
        'message': 'Link de confirmação da conta está expirado. Solicite um novo email de confirmação da conta para o administrador.',
        'menus': [],
        'error': err
      }));
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

module.exports = (app) => app.use('/user', router);