/**
 * @description Configurações do servidor
 * @author @GuilhermeSantos001
 * @update 17/07/2021
 * @version 1.0.0
 */

import { createServer } from "http";
import { DocumentNode, execute, subscribe } from "graphql";
import { SubscriptionServer } from "subscriptions-transport-ws";
import { makeExecutableSchema } from "@graphql-tools/schema";
import { IResolvers } from "@graphql-tools/utils";
import { ApolloServer } from "apollo-server-express";
import express from "express";
import cors from 'cors';

import AuthDirective from '@/graphql/schemaDirectives/authDirective';
import TokenDirective from '@/graphql/schemaDirectives/tokenDirective';
import PrivilegeDirective from '@/graphql/schemaDirectives/privilegeDirective';
import EncodeUriDirective from '@/graphql/schemaDirectives/encodeuriDirective';

const device = require('express-device');
const useragent = require('useragent');

export default async (options: { typeDefs: DocumentNode, resolvers: IResolvers, context: object }) => {
    const PORT = 4000;

    const app = express();

    const
        origin = process.env.NODE_ENV === 'development' ? "*" : "https://grupomavedigital.com.br",
        allowedHeaders = [
            'Origin',
            'X-Requested-With',
            'Content-Type',
            'Accept',
            'X-Access-Token',
            'authorization',
            'encodeuri',
            'token',
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

    //options for cors middlewares
    let corsOptions: cors.CorsOptions = {};

    if (process.env.NODE_ENV === 'development') {
        corsOptions = {
            allowedHeaders,
            credentials: true,
            methods: 'POST',
            origin,
            preflightContinue: false,
        };
    } else {
        corsOptions = {
            allowedHeaders: [
                'Origin',
                'X-Requested-With',
                'Content-Type',
                'Accept',
                'X-Access-Token',
                'authorization',
                'encodeuri',
                'token',
                'temporarypass'
            ],
            credentials: true,
            methods: 'POST',
            origin,
            preflightContinue: false,
        };
    };

    //use cors middleware
    app.use(cors(corsOptions));

    const
        { AuthDirectiveTransformer } = AuthDirective('auth'),
        { TokenDirectiveTransformer } = TokenDirective('token'),
        { PrivilegeDirectiveTransformer } = PrivilegeDirective('privilege'),
        { EncodeUriDirectiveTransformer } = EncodeUriDirective('encodeuri');

    let
        httpServer = createServer(app),
        schema = makeExecutableSchema({
            typeDefs: options.typeDefs,
            resolvers: options.resolvers
        });

    schema = AuthDirectiveTransformer(schema);
    schema = TokenDirectiveTransformer(schema);
    schema = PrivilegeDirectiveTransformer(schema);
    schema = EncodeUriDirectiveTransformer(schema);

    const server = new ApolloServer({
        schema,
        context: req => ({ ...req, ...options.context })
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

    httpServer.listen(PORT, () =>
        console.log(`Server is now running on http://localhost:${PORT}/graphql`)
    );
};