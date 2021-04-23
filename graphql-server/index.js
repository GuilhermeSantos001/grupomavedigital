const { GraphQLServer } = require('graphql-yoga');
const schemaDirectives = require('./schemaDirectives/index');
const typeDefs = require('./typeDefs/index');
const resolvers = require('./resolvers/index');
const { default: costAnalysis } = require('graphql-cost-analysis');
const device = require('express-device');
const useragent = require('useragent');

const server = new GraphQLServer({
    typeDefs,
    resolvers,
    schemaDirectives,
    context: req => ({ ...req }),
});

server.express.use(device.capture({
    parseUserAgent: true
})), useragent(true);

server.express.use(function (req, res, next) {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Headers", "Origin, Content-Type, authorization, usr_token, usr_internetadress");
    next();
});

server.start({
    port: process.env.GRAPHQL_PORT,
    cors: {
        origin: '*'
    },
    validationRules: (req) => [
        costAnalysis({
            variables: req.query.variables,
            maximumCost: Number(process.env.GRAPHQL_MAXIMUMCOST),
            defaultCost: Number(process.env.GRAPHQL_DEFAULTCOST),
            onComplete(cost) {
                if (process.env.NODE_ENV === "development")
                    console.log(`Cost analysis score: ${cost}`)
            },
        })
    ]
}).then(() => {
    console.log(`GraphQL-Yoga Server is running on http://localhost:${process.env.GRAPHQL_PORT}`)
}).catch(() => {
    console.error('Server start failed', err)
    process.exit(1)
})