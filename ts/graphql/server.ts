/**
 * @description Configurações do servidor
 * @author GuilhermeSantos001
 * @update 31/01/2022
 */

import { createServer } from "http";
import { DocumentNode, execute, subscribe } from "graphql";
import { SubscriptionServer } from "subscriptions-transport-ws";
import { makeExecutableSchema } from "@graphql-tools/schema";
import { IResolvers } from "@graphql-tools/utils";
import { ApolloServer } from "apollo-server-express";
import { GraphQLUpload, graphqlUploadExpress } from 'graphql-upload';
import { createBullBoard } from '@bull-board/api';
import { BullMQAdapter } from '@bull-board/api/bullMQAdapter';
import { ExpressAdapter } from '@bull-board/express';
import { Server } from "socket.io";
import path from "path";
import express from "express";
import cors from 'cors';
import APIMiddleware from '@/graphql/middlewares/api-middleware';
import routerFiles from "@/graphql/router/files";
import routerUtils from "@/graphql/router/utils";
import { routerAPI } from '@/graphql/router/api/routes';

/**
 * @description Cluster
 */
import cluster from 'cluster';
import { cpus } from 'os';
const numCPUs = cpus().length;

/**
 * @description Dependencies
 */
import { Debug } from '@/lib/Log4';
import { CreateHLSServer } from '@/lib/HLSServer';
import { SocketIO } from '@/lib/Socket-io';
import { MongoDBClient } from '@/database/MongoDBClient';
import Queue from '@/lib/Queue';

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

    app.use(device.capture({
        parseUserAgent: true
    })), useragent(true);

    app.use(graphqlUploadExpress({
        maxFileSize: 100000000, // 100 MB
        maxFieldSize: 100000000 // 100 MB
    }));

    //options for cors middlewares
    let corsOptions: cors.CorsOptions = {};

    if (process.env.NODE_ENV === 'development') {
        corsOptions = {
            origin: process.env.NODE_ENV === 'development' ? "*" : "https://grupomavedigital.com.br",
            methods: ['GET', 'POST', 'PUT', 'DELETE'],
        };
    } else {
        corsOptions = {
            origin: process.env.NODE_ENV === 'development' ? "*" : "https://grupomavedigital.com.br",
            methods: ['GET', 'POST', 'PUT', 'DELETE'],
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

    //use API
    app.use(express.json());
    app.use('/api/v1/', routerAPI);

    //use Bull Board
    const serverAdapter = new ExpressAdapter();

    const { addQueue, removeQueue, setQueues, replaceQueues } = createBullBoard({
        queues: Queue.queues.map(queue => new BullMQAdapter(queue.bull)),
        serverAdapter: serverAdapter
    })

    if (process.env.NODE_ENV === 'development')
        app.use('/admin/queues', serverAdapter.getRouter());
    else
        app.use('/admin/queues', APIMiddleware, serverAdapter.getRouter());

    serverAdapter.setBasePath('/admin/queues');

    const
        { AuthDirectiveTransformer } = AuthDirective('auth'),
        { TokenDirectiveTransformer } = TokenDirective('token'),
        { PrivilegeDirectiveTransformer } = PrivilegeDirective('privilege'),
        { EncodeUriDirectiveTransformer } = EncodeUriDirective('encodeuri');

    const startServer = async () => {
        const mongoDBClient = new MongoDBClient();

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
                mongoDBClient.shutdown();
                throw error;
            }

            // handle specific listen errors with friendly messages
            switch (error.code) {
                case 'EACCES':
                    Debug.fatal('default', `Port ${PORT} requires elevated privileges`);
                    mongoDBClient.shutdown();
                    return process.exit(1);
                case 'EADDRINUSE':
                    Debug.fatal('default', `Port ${PORT} is already in use`);
                    mongoDBClient.shutdown();
                    return process.exit(1);
                default:
                    Debug.fatal('default', `Fatal error: ${error}`);
                    mongoDBClient.shutdown();
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
        CreateHLSServer(httpServer);

        /**
          * @description Web Socket Server
         */
        const io = new Server(5000, {
            cors: {
                origin: '*',
                methods: ['GET', 'POST']
            }
        });

        SocketIO(io);
    }

    if (!cluster.isWorker) {
        Debug.console('default', `Master ${process.pid} is running`);

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