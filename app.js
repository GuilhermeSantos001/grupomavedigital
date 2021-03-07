var createError = require('http-errors');
var express = require('express');
var bodyParser = require('body-parser');
var path = require('path');
var fileupload = require('express-fileupload');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
var device = require('express-device');
var useragent = require('useragent');
var app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'pug');
app.set('view options', {
  layout: false
});

// Proxy setup
app.set('trust proxy', true);

app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({
  extended: true
}));
app.use(fileupload());
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));
app.use(device.capture({
  parseUserAgent: true
})), useragent(true);

/**
 * Cors configuration
 */
const cors = require('cors');
const corsOptions = {
  "origin": function (origin, callback) {
    if ([
      `http://${process.env.APP_ADDRESS}:${process.env.APP_PORT}`,
      'file://',
      undefined
    ].indexOf(origin) !== -1) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  "methods": "GET, POST, PUT, DELETE, OPTIONS"
}

app.options('*', function (req, res) {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS");
  res.header("Access-Control-Allow-Headers", "Origin, Content-Type, authorization, usr_token, usr_internetadress");
  return res.sendStatus(200);
});

app.use(cors(corsOptions));

// Import Routes
require('./routes/index')(app);

// Import public/scripts
require('./modules/obfuscator')(process.env.NODE_ENV);

// catch 404 and forward to error handler
app.use(function (req, res, next) {
  next(createError(404));
});

// error handler
app.use(function (err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error', {
    title: 'Grupo Mave Digital',
    menus: [{
      type: 'normal',
      icon: 'rotate-ccw',
      first: false,
      enabled: true,
      title: 'Voltar',
      onclick: "gotoSystem()"
    }],
    message: err.message,
    error: err
  });
});

module.exports = app;