const express = require('express');
const router = express.Router({
  strict: true,
  caseSensitive: true
});
const getClientAddress = req => (req.headers['x-forwarded-for'] || '').split(',')[0] || req.connection.remoteAddress;
const geoip = require('geoip-lite');

router.get('/ipinfo', function (req, res) {
  let ip = getClientAddress(req),
    info = geoip.lookup(ip) || { 'country': 'Unknow', 'region': 'Unknow', 'city': 'Unknow' };

  return res.status(200).send({
    country: info['country'],
    region: info['region'],
    city: info['city'],
    ip: ip
  });
});

/* GET home page. */
router.get(`/`, async (req, res) => {
  return res.render('index', {
    title: 'Grupo Mave Digital',
    menus: [{
      type: 'normal',
      icon: 'home',
      first: true,
      enabled: true,
      title: 'Home',
      onclick: ""
    },
    {
      type: 'normal',
      icon: 'power',
      first: false,
      enabled: true,
      title: 'Acessar',
      onclick: "gotoSystem()"
    },
    {
      type: 'normal',
      icon: 'credit-card',
      first: false,
      enabled: true,
      title: 'Cartões Digitais',
      onclick: "cards()"
    }, {
      type: 'normal',
      icon: 'cpu',
      first: false,
      enabled: true,
      title: 'Softwares',
      onclick: ""
    }, {
      type: 'collapse',
      icon: 'pen-tool',
      first: false,
      enabled: true,
      title: 'Material Gráfico',
      items: [
        {
          title: 'S. Mave',
          icon: 'bookmark',
          enabled: true,
          onclick: ''
        },
        {
          title: 'V. Mave',
          icon: 'bookmark',
          enabled: true,
          onclick: ''
        },
        {
          title: 'Mave Systems',
          icon: 'bookmark',
          enabled: true,
          onclick: ''
        },
        {
          title: 'Mav Quality',
          icon: 'bookmark',
          enabled: true,
          onclick: ''
        }
      ]
    }, {
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
          onclick: ''
        },
        {
          title: 'HelpDesk/TI (GLPI)',
          icon: 'tool',
          enabled: true,
          onclick: ''
        },
        {
          title: 'HelpDesk/TI (GLPI)',
          icon: 'tool',
          enabled: true,
          onclick: ''
        },
        {
          title: 'HelpDesk/TI (GLPI)',
          icon: 'tool',
          enabled: true,
          onclick: ''
        },
        {
          title: 'HelpDesk/TI (GLPI)',
          icon: 'tool',
          enabled: true,
          onclick: ''
        },
        {
          title: 'HelpDesk/TI (GLPI)',
          icon: 'tool',
          enabled: true,
          onclick: ''
        },
        {
          title: 'HelpDesk/TI (GLPI)',
          icon: 'tool',
          enabled: true,
          onclick: ''
        },
        {
          title: 'HelpDesk/TI (GLPI)',
          icon: 'tool',
          enabled: true,
          onclick: ''
        },
        {
          title: 'HelpDesk/TI (GLPI)',
          icon: 'tool',
          enabled: true,
          onclick: ''
        },
        {
          title: 'HelpDesk/TI (GLPI)',
          icon: 'tool',
          enabled: true,
          onclick: ''
        },
        {
          title: 'HelpDesk/TI (GLPI)',
          icon: 'tool',
          enabled: true,
          onclick: ''
        },
        {
          title: 'HelpDesk/TI (GLPI)',
          icon: 'tool',
          enabled: true,
          onclick: ''
        },
        {
          title: 'HelpDesk/TI (GLPI)',
          icon: 'tool',
          enabled: true,
          onclick: ''
        },
        {
          title: 'HelpDesk/TI (GLPI)',
          icon: 'tool',
          enabled: true,
          onclick: ''
        },
        {
          title: 'HelpDesk/TI (GLPI)',
          icon: 'tool',
          enabled: true,
          onclick: ''
        },
        {
          title: 'HelpDesk/TI (GLPI)',
          icon: 'tool',
          enabled: true,
          onclick: ''
        },
        {
          title: 'HelpDesk/TI (GLPI)',
          icon: 'tool',
          enabled: true,
          onclick: ''
        },
        {
          title: 'HelpDesk/TI (GLPI)',
          icon: 'tool',
          enabled: true,
          onclick: ''
        },
        {
          title: 'HelpDesk/TI (GLPI)',
          icon: 'tool',
          enabled: true,
          onclick: ''
        },
        {
          title: 'HelpDesk/TI (GLPI)',
          icon: 'tool',
          enabled: true,
          onclick: ''
        },
        {
          title: 'HelpDesk/TI (GLPI)',
          icon: 'tool',
          enabled: true,
          onclick: ''
        },
        {
          title: 'HelpDesk/TI (GLPI)',
          icon: 'tool',
          enabled: true,
          onclick: ''
        },
        {
          title: 'HelpDesk/TI (GLPI)',
          icon: 'tool',
          enabled: true,
          onclick: ''
        },
        {
          title: 'HelpDesk/TI (GLPI)',
          icon: 'tool',
          enabled: true,
          onclick: ''
        },
        {
          title: 'HelpDesk/TI (GLPI)',
          icon: 'tool',
          enabled: true,
          onclick: ''
        },
        {
          title: 'HelpDesk/TI (GLPI)',
          icon: 'tool',
          enabled: true,
          onclick: ''
        },
        {
          title: 'HelpDesk/TI (GLPI)',
          icon: 'tool',
          enabled: true,
          onclick: ''
        },
        {
          title: 'HelpDesk/TI (GLPI)',
          icon: 'tool',
          enabled: true,
          onclick: ''
        },
        {
          title: 'HelpDesk/TI (GLPI)',
          icon: 'tool',
          enabled: true,
          onclick: ''
        },
        {
          title: 'HelpDesk/TI (GLPI)',
          icon: 'tool',
          enabled: true,
          onclick: ''
        },
        {
          title: 'HelpDesk/TI (GLPI)',
          icon: 'tool',
          enabled: true,
          onclick: ''
        },
        {
          title: 'HelpDesk/TI (GLPI)',
          icon: 'tool',
          enabled: true,
          onclick: ''
        },
        {
          title: 'HelpDesk/TI (GLPI)',
          icon: 'tool',
          enabled: true,
          onclick: ''
        },
        {
          title: 'HelpDesk/TI (GLPI)',
          icon: 'tool',
          enabled: true,
          onclick: ''
        },
        {
          title: 'HelpDesk/TI (GLPI)',
          icon: 'tool',
          enabled: true,
          onclick: ''
        },
        {
          title: 'HelpDesk/TI (GLPI)',
          icon: 'tool',
          enabled: true,
          onclick: ''
        },
        {
          title: 'HelpDesk/TI (GLPI)',
          icon: 'tool',
          enabled: true,
          onclick: ''
        },
        {
          title: 'HelpDesk/TI (GLPI)',
          icon: 'tool',
          enabled: true,
          onclick: ''
        },
        {
          title: 'HelpDesk/TI (GLPI)',
          icon: 'tool',
          enabled: true,
          onclick: ''
        },
        {
          title: 'HelpDesk/TI (GLPI)',
          icon: 'tool',
          enabled: true,
          onclick: ''
        },
        {
          title: 'HelpDesk/TI (GLPI)',
          icon: 'tool',
          enabled: true,
          onclick: ''
        },
        {
          title: 'HelpDesk/TI (GLPI)',
          icon: 'tool',
          enabled: true,
          onclick: ''
        },
        {
          title: 'HelpDesk/TI (GLPI)',
          icon: 'tool',
          enabled: true,
          onclick: ''
        },
        {
          title: 'HelpDesk/TI (GLPI)',
          icon: 'tool',
          enabled: true,
          onclick: ''
        },
        {
          title: 'HelpDesk/TI (GLPI)',
          icon: 'tool',
          enabled: true,
          onclick: ''
        },
        {
          title: 'HelpDesk/TI (GLPI)',
          icon: 'tool',
          enabled: true,
          onclick: ''
        },
        {
          title: 'HelpDesk/TI (GLPI)',
          icon: 'tool',
          enabled: true,
          onclick: ''
        },
        {
          title: 'HelpDesk/TI (GLPI)',
          icon: 'tool',
          enabled: true,
          onclick: ''
        },
        {
          title: 'HelpDesk/TI (GLPI)',
          icon: 'tool',
          enabled: true,
          onclick: ''
        },
        {
          title: 'HelpDesk/TI (GLPI)',
          icon: 'tool',
          enabled: true,
          onclick: ''
        },
        {
          title: 'HelpDesk/TI (GLPI)',
          icon: 'tool',
          enabled: true,
          onclick: ''
        },
        {
          title: 'HelpDesk/TI (GLPI)',
          icon: 'tool',
          enabled: true,
          onclick: ''
        },
        {
          title: 'HelpDesk/TI (GLPI)',
          icon: 'tool',
          enabled: true,
          onclick: ''
        },
        {
          title: 'HelpDesk/TI (GLPI)',
          icon: 'tool',
          enabled: true,
          onclick: ''
        },
        {
          title: 'HelpDesk/TI (GLPI)',
          icon: 'tool',
          enabled: true,
          onclick: ''
        },
        {
          title: 'HelpDesk/TI (GLPI)',
          icon: 'tool',
          enabled: true,
          onclick: ''
        },
        {
          title: 'HelpDesk/TI (GLPI)',
          icon: 'tool',
          enabled: true,
          onclick: ''
        },
        {
          title: 'HelpDesk/TI (GLPI)',
          icon: 'tool',
          enabled: true,
          onclick: ''
        },
        {
          title: 'HelpDesk/TI (GLPI)',
          icon: 'tool',
          enabled: true,
          onclick: ''
        },
        {
          title: 'HelpDesk/TI (GLPI)',
          icon: 'tool',
          enabled: true,
          onclick: ''
        },
        {
          title: 'HelpDesk/TI (GLPI)',
          icon: 'tool',
          enabled: true,
          onclick: ''
        },
        {
          title: 'HelpDesk/TI (GLPI)',
          icon: 'tool',
          enabled: true,
          onclick: ''
        },
        {
          title: 'HelpDesk/TI (GLPI)',
          icon: 'tool',
          enabled: true,
          onclick: ''
        },
        {
          title: 'HelpDesk/TI (GLPI)',
          icon: 'tool',
          enabled: true,
          onclick: ''
        },
        {
          title: 'HelpDesk/TI (GLPI)',
          icon: 'tool',
          enabled: true,
          onclick: ''
        },
        {
          title: 'HelpDesk/TI (GLPI)',
          icon: 'tool',
          enabled: true,
          onclick: ''
        },
        {
          title: 'HelpDesk/TI (GLPI)',
          icon: 'tool',
          enabled: true,
          onclick: ''
        },
        {
          title: 'HelpDesk/TI (GLPI)',
          icon: 'tool',
          enabled: true,
          onclick: ''
        },
        {
          title: 'HelpDesk/TI (GLPI)',
          icon: 'tool',
          enabled: true,
          onclick: ''
        },
        {
          title: 'HelpDesk/TI (GLPI)',
          icon: 'tool',
          enabled: true,
          onclick: ''
        },
        {
          title: 'HelpDesk/TI (GLPI)',
          icon: 'tool',
          enabled: true,
          onclick: ''
        },
        {
          title: 'HelpDesk/TI (GLPI)',
          icon: 'tool',
          enabled: true,
          onclick: ''
        },
        {
          title: 'HelpDesk/TI (GLPI)',
          icon: 'tool',
          enabled: true,
          onclick: ''
        },
        {
          title: 'HelpDesk/TI (GLPI)',
          icon: 'tool',
          enabled: true,
          onclick: ''
        },
        {
          title: 'HelpDesk/TI (GLPI)',
          icon: 'tool',
          enabled: true,
          onclick: ''
        },
        {
          title: 'HelpDesk/TI (GLPI)',
          icon: 'tool',
          enabled: true,
          onclick: ''
        },
        {
          title: 'HelpDesk/TI (GLPI)',
          icon: 'tool',
          enabled: true,
          onclick: ''
        },
        {
          title: 'HelpDesk/TI (GLPI)',
          icon: 'tool',
          enabled: true,
          onclick: ''
        },
        {
          title: 'HelpDesk/TI (GLPI)',
          icon: 'tool',
          enabled: true,
          onclick: ''
        },
        {
          title: 'HelpDesk/TI (GLPI)',
          icon: 'tool',
          enabled: true,
          onclick: ''
        },
        {
          title: 'HelpDesk/TI (GLPI)',
          icon: 'tool',
          enabled: true,
          onclick: ''
        },
        {
          title: 'HelpDesk/TI (GLPI)',
          icon: 'tool',
          enabled: true,
          onclick: ''
        },
        {
          title: 'HelpDesk/TI (GLPI)',
          icon: 'tool',
          enabled: true,
          onclick: ''
        },
        {
          title: 'HelpDesk/TI (GLPI)',
          icon: 'tool',
          enabled: true,
          onclick: ''
        },
        {
          title: 'HelpDesk/TI (GLPI)',
          icon: 'tool',
          enabled: true,
          onclick: ''
        },
        {
          title: 'HelpDesk/TI (GLPI)',
          icon: 'tool',
          enabled: true,
          onclick: ''
        },
        {
          title: 'HelpDesk/TI (GLPI)',
          icon: 'tool',
          enabled: true,
          onclick: ''
        },
        {
          title: 'HelpDesk/TI (GLPI)',
          icon: 'tool',
          enabled: true,
          onclick: ''
        },
        {
          title: 'HelpDesk/TI (GLPI)',
          icon: 'tool',
          enabled: true,
          onclick: ''
        },
        {
          title: 'HelpDesk/TI (GLPI)',
          icon: 'tool',
          enabled: true,
          onclick: ''
        },
        {
          title: 'HelpDesk/TI (GLPI)',
          icon: 'tool',
          enabled: true,
          onclick: ''
        },
        {
          title: 'HelpDesk/TI (GLPI)',
          icon: 'tool',
          enabled: true,
          onclick: ''
        },
        {
          title: 'HelpDesk/TI (GLPI)',
          icon: 'tool',
          enabled: true,
          onclick: ''
        },
        {
          title: 'HelpDesk/TI (GLPI)',
          icon: 'tool',
          enabled: true,
          onclick: ''
        },
        {
          title: 'HelpDesk/TI (GLPI)',
          icon: 'tool',
          enabled: true,
          onclick: ''
        },
        {
          title: 'HelpDesk/TI (GLPI)',
          icon: 'tool',
          enabled: true,
          onclick: ''
        },
        {
          title: 'HelpDesk/TI (GLPI)',
          icon: 'tool',
          enabled: true,
          onclick: ''
        },
        {
          title: 'HelpDesk/TI (GLPI)',
          icon: 'tool',
          enabled: true,
          onclick: ''
        },
        {
          title: 'HelpDesk/TI (GLPI)',
          icon: 'tool',
          enabled: true,
          onclick: ''
        },
        {
          title: 'HelpDesk/TI (GLPI)',
          icon: 'tool',
          enabled: true,
          onclick: ''
        },
        {
          title: 'HelpDesk/TI (GLPI)',
          icon: 'tool',
          enabled: true,
          onclick: ''
        },
        {
          title: 'HelpDesk/TI (GLPI)',
          icon: 'tool',
          enabled: true,
          onclick: ''
        },
        {
          title: 'HelpDesk/TI (GLPI)',
          icon: 'tool',
          enabled: true,
          onclick: ''
        },
        {
          title: 'HelpDesk/TI (GLPI)',
          icon: 'tool',
          enabled: true,
          onclick: ''
        },
        {
          title: 'HelpDesk/TI (GLPI)',
          icon: 'tool',
          enabled: true,
          onclick: ''
        },
      ]
    }]
  });
});

module.exports = (app) => app.use('/', router);