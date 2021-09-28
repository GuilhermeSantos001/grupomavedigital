#!/usr/bin/env node

/**
 * @description Configurações pre-execução do sistema
 * @author @GuilhermeSantos001
 * @update 17/07/2021
 * @version 2.0.0
 */

/**
 * Cluster
 */
import cluster from 'cluster';
import { cpus } from 'os';

const numCPUs = cpus().length;
const http = require('http');

/**
 * Variables Environment
 */
import { config } from 'dotenv';
config();

/**
 * Module dependencies.
 */

import Debug from '@/core/log4';
import app from '@/app/app';
import hls from '@/core/hls-server';
import socketIO from '@/core/socket-io';
import Jobs from '@/core/jobs';
import mongoDB from '@/controllers/mongodb';

/**
 * Get port from environment and store in Express.
 */

var port = normalizePort(process.env.APP_PORT || "3000");

app.set('port', port);

/**
 * Normalize a port into a string.
 */
function normalizePort(val: string) {
  var port = parseInt(val, 10);

  if (isNaN(port)) {
    // named pipe
    return val;
  };

  if (port >= 0) {
    // port number
    return port;
  };

  return false;
};

if (cluster.isMaster) {
  Debug.console('default', `Master ${process.pid} is running`);

  if (eval(String(process.env.APP_CLUSTER).toLowerCase())) {
    // Fork workers.
    for (let i = 0; i < numCPUs; i++) {
      cluster.fork();
    };

    cluster.on('exit', (worker, code, signal) => {
      Debug.console('default', `worker ${worker.process.pid} died`);
    });
  } else {
    startServer();
  }
} else {
  startServer();
}

function startServer(): void {
  /**
     * Create HTTP server.
     */

  const server = http.createServer(app);

  /**
   * Listen on provided port, on all network interfaces.
   */

  server.listen(port);
  server.on('error', onError);
  server.on('listening', onListening);

  Debug.console('default', `Worker ${process.pid} started`);

  /**
   * HTTP Live Streaming
   */
  hls(server);

  /**
   * Web Socket Server
   */
  socketIO(server);

  /**
   * Jobs
   */
  Jobs.reset();
  Jobs.start();

  /**
   * Event listener for HTTP server "error" event.
   */

  function onError(error: any) {
    if (error.syscall !== 'listen') {
      mongoDB.shutdown();

      throw error;
    };

    var bind = typeof port === 'string' ?
      'Pipe ' + port :
      'Port ' + port;

    // handle specific listen errors with friendly messages
    switch (error.code) {
      case 'EACCES':
        Debug.fatal('default', bind + ' requires elevated privileges');

        mongoDB.shutdown();

        return process.exit(1);
      case 'EADDRINUSE':
        Debug.fatal('default', bind + ' is already in use');

        mongoDB.shutdown();

        return process.exit(1);
      default:
        throw error;
    };
  };

  /**
   * Event listener for HTTP server "listening" event.
   */

  function onListening() {
    Debug.console('default', `\n\r> Express started on http://${process.env.APP_HOST}` + ':' + app.get('port') + '; press Ctrl-C to terminate.\n\r');
  };
}