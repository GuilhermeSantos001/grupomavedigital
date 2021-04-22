var createError = require('http-errors');
var express = require('express');
var path = require('path');
var fileupload = require('express-fileupload');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
var device = require('express-device');
var useragent = require('useragent');
var app = express();

// view engine setup
app.set('views', [
  path.join(__dirname, 'views'),
  path.join(__dirname, 'views/errors'),
  path.join(__dirname, 'views/cards'),
  path.join(__dirname, 'views/users'),
  path.join(__dirname, 'views/rh'),
  path.join(__dirname, 'views/manuals'),
  path.join(__dirname, 'views/materials'),
]);
app.set('view engine', 'pug');
app.set('view options', { layout: false });
app.set('trust proxy', true);
app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({
  extended: true
}));
app.use(fileupload());
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public'), {
  maxAge: '1d',
  setHeaders: function (res, path, stat) {
    res.set('x-timestamp', Date.now());
  }
}));
app.use(express.static(path.join(__dirname, 'node_modules/bootstrap/dist')));
app.use(express.static(path.join(__dirname, 'node_modules/feather-icons/dist')));
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
      `https://${process.env.APP_ADDRESS}:${process.env.APP_PORT}`,
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