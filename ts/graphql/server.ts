/**
 * @description Configurações do servidor
 * @author GuilhermeSantos001
 * @update 18/11/2021
 */

import { createServer } from "http";
import { DocumentNode, execute, subscribe } from "graphql";
import { SubscriptionServer } from "subscriptions-transport-ws";
import { makeExecutableSchema } from "@graphql-tools/schema";
import { IResolvers } from "@graphql-tools/utils";
import { ApolloServer } from "apollo-server-express";
import { GraphQLUpload, graphqlUploadExpress } from 'graphql-upload';
import path from "path";
import express from "express";
import cors from 'cors';
import routerFiles from "@/router/files";
import routerUtils from "@/router/utils";

/**
 * @description Cluster
 */
import cluster from 'cluster';
import { cpus } from 'os';
const numCPUs = cpus().length;

/**
 * @description Dependencies
 */
import Debug from '@/core/log4';
import hls from '@/core/hls-server';
import socketIO from '@/core/socket-io';
import Jobs from '@/core/jobs';
import mongoDB from '@/controllers/mongodb';

/**
 * @description Directives
 */
import AuthDirective from '@/graphql/schemaDirectives/authDirective';
import TokenDirective from '@/graphql/schemaDirectives/tokenDirective';
import PrivilegeDirective from '@/graphql/schemaDirectives/privilegeDirective';
import EncodeUriDirective from '@/graphql/schemaDirectives/encodeuriDirective';

const device = require('express-device');
const useragent = require('useragent');

export default async (options: { typeDefs: DocumentNode, resolvers: IResolvers, context: object }) => {
    const PORT = process.env.APP_PORT;

    const app = express();

    const
        origin = process.env.NODE_ENV === 'development' ? "*" : "https://grupomavedigital.com.br",
        allowedHeaders = [
            'host',
            'origin',
            'x-requested-with',
            'x-real-ip',
            'x-access-token',
            'content-type',
            'accept',
            'referer',
            'accept-encoding',
            'accept-language',
            'connection',
            'authorization',
            'auth',
            'token',
            'refreshToken',
            'signature',
            'encodeuri',
            'temporarypass'
        ];

    app.use(device.capture({
        parseUserAgent: true
    })), useragent(true);

    app.use(function (req, res, next) {
        res.header("Access-Control-Allow-Origin", origin);
        res.header("Access-Control-Allow-Headers", allowedHeaders.join(','));
        next();
    });

    app.use(graphqlUploadExpress({
        maxFileSize: 100000000, // 100 MB
        maxFieldSize: 100000000 // 100 MB
    }));

    //options for cors middlewares
    let corsOptions: cors.CorsOptions = {};

    if (process.env.NODE_ENV === 'development') {
        corsOptions = {
            origin,
            methods: 'GET, POST',
            allowedHeaders,
            credentials: false,
        };
    } else {
        corsOptions = {
            origin,
            methods: 'GET, POST',
            allowedHeaders,
            credentials: true,
            preflightContinue: false,
        };
    }

    //use cors middleware
    app.use(cors(corsOptions));

    // View engine setup
    app.set('view engine', 'pug');
    app.set('views', path.join(__dirname, 'views'));

    //use routers
    app.use('/files', routerFiles);
    app.use('/utils', routerUtils);

    const
        { AuthDirectiveTransformer } = AuthDirective('auth'),
        { TokenDirectiveTransformer } = TokenDirective('token'),
        { PrivilegeDirectiveTransformer } = PrivilegeDirective('privilege'),
        { EncodeUriDirectiveTransformer } = EncodeUriDirective('encodeuri');

    const startServer = async () => {
        Debug.console('default', `Worker ${process.pid} started`);

        let
            httpServer = createServer(app),
            schema = makeExecutableSchema({
                typeDefs: options.typeDefs,
                resolvers: { Upload: GraphQLUpload, ...options.resolvers }
            });

        /**
         * @description Event listener for HTTP server "error" event.
         */
        function onError(error: any) {
            if (error.syscall !== 'listen') {
                mongoDB.shutdown();
                throw error;
            }

            // handle specific listen errors with friendly messages
            switch (error.code) {
                case 'EACCES':
                    Debug.fatal('default', `Port ${PORT} requires elevated privileges`);
                    mongoDB.shutdown();
                    return process.exit(1);
                case 'EADDRINUSE':
                    Debug.fatal('default', `Port ${PORT} is already in use`);
                    mongoDB.shutdown();
                    return process.exit(1);
                default:
                    Debug.fatal('default', `Fatal error: ${error}`);
                    mongoDB.shutdown();
                    throw error;
            }
        }

        /**
         * @description Event listener for HTTP server "listening" event.
         */
        function onListening() {
            Debug.console('default', `Server is now running on http://localhost:${PORT}/graphql`);
        }

        schema = AuthDirectiveTransformer(schema);
        schema = TokenDirectiveTransformer(schema);
        schema = PrivilegeDirectiveTransformer(schema);
        schema = EncodeUriDirectiveTransformer(schema);

        const server = new ApolloServer({
            schema,
            introspection: true,
            context: req => ({ express: req, ...options.context })
        });

        await server.start();

        server.applyMiddleware({
            app,
            cors: corsOptions
        });

        SubscriptionServer.create(
            { schema, execute, subscribe },
            { server: httpServer, path: server.graphqlPath },
        );

        httpServer.listen(PORT);
        httpServer.on('error', onError);
        httpServer.on('listening', onListening);

        /**
         * @description HTTP Live Streaming
         */
        hls(httpServer);

        /**
         * @description Web Socket Server
         */
        socketIO();
    }

    if (!cluster.isWorker) {
        Debug.console('default', `Master ${process.pid} is running`);

        /**
         * @description Jobs started
         */
        Jobs.reset();
        Jobs.start();

        if (eval(String(process.env.APP_CLUSTER).toLowerCase())) {
            // Fork workers.
            for (let i = 0; i < numCPUs; i++) {
                cluster.fork();
            }

            cluster.on('exit', (worker, code, signal) => {
                Debug.console('default', `worker ${worker.process.pid} died`);
            });
        } else {
            return startServer();
        }
    } else {
        return startServer();
    }
};