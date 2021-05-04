const express = require('express');
const router = express.Router({
  strict: true,
  caseSensitive: true
});
const middlewareAPI = require('../middlewares/api');
const middlewareToken = require('../middlewares/token');
const getReqProps = require('../modules/getReqProps');
const hasPrivilege = require('../modules/hasPrivilege');

/**
 * States
 */
require('./includes/states/all')(router, middlewareAPI);

/**
 * FILES
*/
require('./includes/files/all')(router, middlewareToken);

/**
 * RH
 */
require('./includes/rh/all')(router, middlewareToken);

/**
 * Manuals
 */
require('./includes/manuals/all')(router, middlewareToken);

/**
 * Materials
 */
require('./includes/materials/all')(router, middlewareToken);

/**
 * HOME
 */
router.get(['/'], middlewareToken, async (req, res) => {
  let {
    token
  } = getReqProps(req, [
    'token'
  ]);

  const { privilege } = token['data'];

  return res.status(200).render('system', {
    title: 'Grupo Mave Digital',
    privilege: hasPrivilege.alias(privilege.reverse()[0]),
    router: 'Sistema/Tela Inicial.',
    menus: [
      {
        type: 'normal',
        icon: 'home',
        first: false,
        enabled: true,
        title: 'Home',
        onclick: "home()"
      },
      {
        type: 'normal',
        icon: 'settings',
        first: false,
        enabled: hasPrivilege.staff(privilege),
        title: 'Painel de Controle',
        onclick: "cpanel()"
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
          }
        ]
      },
      {
        type: 'collapse',
        icon: 'book-open',
        first: false,
        enabled: true,
        title: 'Manuais',
        items: [
          {
            title: 'HelpDesk',
            icon: 'book',
            enabled: true,
            onclick: 'manuals(\'helpdesk\')'
          },
          {
            title: 'Monday',
            icon: 'book',
            enabled: true,
            onclick: 'manuals(\'monday\')'
          }
        ]
      },
      {
        type: 'collapse',
        icon: 'users',
        first: false,
        enabled: true,
        title: 'Recursos Humanos',
        items: [
          {
            title: 'APP Meu RH',
            icon: 'pocket',
            enabled: true,
            onclick: 'app_meu_rh()'
          }
        ]
      },
      {
        type: 'collapse',
        icon: 'pen-tool',
        first: false,
        enabled: true,
        title: 'Materiais Gráficos',
        items: [
          {
            title: 'Grupo Mave',
            icon: 'bookmark',
            enabled: true,
            onclick: "materials(\"Grupo Mave\")"
          },
          {
            title: 'S. Mave',
            icon: 'bookmark',
            enabled: true,
            onclick: "materials(\"S. MAVE\")"
          },
          {
            title: 'V. Mave',
            icon: 'bookmark',
            enabled: true,
            onclick: 'materials(\"V. MAVE\")'
          },
          {
            title: 'V. Mave(Policia Federal)',
            icon: 'bookmark',
            enabled: true,
            onclick: 'materials(\"V. Mave(Policia Federal)\")'
          },
          {
            title: 'Mave Systems',
            icon: 'bookmark',
            enabled: true,
            onclick: 'materials(\"Mave Systems\")'
          },
          {
            title: 'Mav Quality',
            icon: 'bookmark',
            enabled: true,
            onclick: 'materials(\"Mav Quality\")'
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
        type: 'collapse',
        icon: 'help-circle',
        first: false,
        enabled: true,
        title: 'Precisa de Ajuda?',
        items: [
          {
            title: 'HelpDesk/TI (GLPI)',
            icon: 'tool',
            enabled: true,
            onclick: 'helpdesk()'
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