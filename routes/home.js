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

router.get('/stream', function (req, res) {
  const
    fs = require('fs'),
    path = require('../modules/localPath'),
    { range } = req.headers;

  const videoPath = path.localPath('public/assets/teste.mp4'),
    videoSize = fs.statSync(videoPath).size,
    CHUNK_SIZE = 10000,
    start = Number(range.replace(/\D/g, "")),
    end = Math.min(start + CHUNK_SIZE, videoSize - 1);

  if (range) {
    const headers = {
      "Content-Range": `bytes ${start}-${end}/${videoSize}`,
      "Accept-Ranges": "bytes",
      "Content-Type": "video/mp4"
    };

    res.writeHead(206, headers);

    fs.createReadStream(videoPath, { start, end });
  } else {
    const head = {
      'Content-Length': fileSize,
      'Content-Type': 'video/mp4'
    }

    res.writeHead(200, head)
    fs.createReadStream(path).pipe(res);
  }
});

router.get('/stream2', function (req, res) {
  const path = require('../modules/localPath');
  const fs = require('fs');
  var filePath = path.localPath('public/assets/Reis da Revoada.mp3');
  var stat = fs.statSync(filePath);
  var total = stat.size;
  if (req.headers.range) {
    var range = req.headers.range;
    var parts = range.replace(/bytes=/, "").split("-");
    var partialstart = parts[0];
    var partialend = parts[1];

    var start = parseInt(partialstart, 10);
    var end = partialend ? parseInt(partialend, 10) : total - 1;
    var chunksize = (end - start) + 1;
    var readStream = fs.createReadStream(filePath, { start: start, end: end });
    res.writeHead(206, {
      'Content-Range': 'bytes ' + start + '-' + end + '/' + total,
      'Accept-Ranges': 'bytes', 'Content-Length': chunksize,
      'Content-Type': 'audio/mpeg'
    });
    readStream.pipe(res);
  } else {
    res.writeHead(200, { 'Content-Length': total, 'Content-Type': 'audio/mpeg' });
    fs.createReadStream(filePath).pipe(res);
  }
});

router.get('/videos/*', function (req, res) {
  const
    fs = require('fs'),
    path = require('../modules/localPath'),
    file = path.localPath('public\\assets\\hls\\videos' + '\\' + (req.url.replace('/videos/', "")));

  fs.createReadStream(file).pipe(res);
});

router.get('/captions/*', function (req, res) {
  const
    fs = require('fs'),
    path = require('../modules/localPath'),
    file = path.localPath('public\\assets\\hls\\captions' + '\\' + (req.url.replace('/captions/', "")));

  fs.createReadStream(file).pipe(res);
});

router.get('/thumbs/*', function (req, res) {
  const
    fs = require('fs'),
    path = require('../modules/localPath'),
    file = path.localPath('public\\assets\\hls\\thumbs' + '\\' + (req.url.replace('/thumbs/', "")));

  fs.createReadStream(file).pipe(res);
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
        }
      ]
    }]
  });
});

module.exports = (app) => app.use('/', router);