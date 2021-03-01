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
      enabled: false,
      title: 'Material Gráfico',
      items: [
        {
          title: 'Grupo Mave',
          icon: 'box',
          enabled: true,
          onclick: ''
        },
        {
          title: 'S MAVE',
          icon: 'box',
          enabled: true,
          onclick: ''
        },
        {
          title: 'V MAVE',
          icon: 'box',
          enabled: true,
          onclick: ''
        },
        {
          title: 'Mave Systems',
          icon: 'box',
          enabled: true,
          onclick: ''
        },
        {
          title: 'Mav Quality',
          icon: 'box',
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
          title: 'suporte@grupomave.com.br',
          icon: 'mail',
          enabled: true,
          onclick: 'sendemail("suporte@grupomave.com.br")'
        },
        {
          title: 'ti@grupomave.com.br',
          icon: 'mail',
          enabled: true,
          onclick: 'sendemail("ti@grupomave.com.br")'
        }
      ]
    }]
  });
});

module.exports = (app) => app.use('/', router);