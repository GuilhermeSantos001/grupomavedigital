/**
 * @description Configurador da aplicação express
 * @author @GuilhermeSantos001
 * @update 17/07/2021
 * @version 2.0.0
 */

import createError from 'http-errors';
import express, { Response } from 'express';
import cors from 'cors';
import busboy from 'connect-busboy';
import cookieParser from 'cookie-parser';
import logger from 'morgan';
import useragent from 'useragent';

import Debug from '@/core/log4';
import { localPath } from '@/utils/localpath';

const device = require('express-device');
const app = express();

// view engine setup
app.set('view engine', 'pug');
app.set('view options', { layout: false });
app.set('views', [
  localPath('views'),
  localPath('views/errors'),
  localPath('views/help'),
  localPath('views/cards'),
  localPath('views/users'),
  localPath('views/rh'),
  localPath('views/manuals'),
  localPath('views/materials'),
  localPath('views/cpanel'),
  localPath('views/storageHercules')
]);

// paths statics
app.use(express.static(localPath('node_modules/animate.css')));
app.use(express.static(localPath('node_modules/@fortawesome/fontawesome-free')));
app.use(express.static(localPath('node_modules/chart.js/dist')));
app.use(express.static(localPath('node_modules/jquery/dist')));
app.use(express.static(localPath('node_modules/jquery-contextmenu/dist')));
app.use(express.static(localPath('node_modules/inputmask/dist')));
app.use(express.static(localPath('node_modules/bootstrap/dist/js')));
app.use(express.static(localPath('node_modules/@popperjs/core/dist/umd')));
app.use(express.static(localPath('node_modules/plyr/dist')));
app.use(express.static(localPath('node_modules/feather-icons/dist')));
app.use(express.static(localPath('node_modules/lz-string/libs')));
app.use(express.static(localPath('node_modules/socket.io/client-dist')));
app.use(express.static(localPath('node_modules/list.js/dist')));
app.use(express.static(localPath('node_modules/please-wait/build')));
app.use(express.static(localPath('node_modules/spinkit')));
app.use(express.static(localPath('public'), {
  maxAge: '1d',
  setHeaders: function (res: Response, path: string, stat: any) {
    res.set('x-timestamp', Date.now().toString());
  }
}));

// app settings
app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(busboy());
app.use(device.capture({
  parseUserAgent: true
})), useragent(true);

app.options('*', function (req, res) {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS");
  res.header("Access-Control-Allow-Headers", "Origin, Content-Type, authorization, token");
  return res.sendStatus(200);
});

app.use(cors({
  "origin": function (requestOrigin: string | undefined, callback: (err: Error | null, origin?: boolean | string | RegExp | (boolean | string | RegExp)[]) => void) {
    let origins = [];

    if (process.env.NODE_ENV === 'production') {
      origins = [
        `https://grupomavedigital.com.br`
      ];
    } else {
      origins = [
        `http://${process.env.APP_HOST}:${process.env.APP_PORT}`,
        `http://${process.env.CLIENT_HOST}:${process.env.CLIENT_PORT}`,
        'file://',
        undefined
      ];
    }

    if (origins.indexOf(requestOrigin) !== -1) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  "methods": "GET, POST, PUT, DELETE, OPTIONS"
}));

// Import Routes
import routerIndex from '@/routers/index';

routerIndex(app);

// catch 404 and forward to error handler
app.use(function (req, res, next) {
  next(createError(404));
});

// error handler
app.use(function (err: any, req: any, res: any, next: any) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  Debug.fatal('default', `Worker ${process.pid} called error handle`);

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

export default app;