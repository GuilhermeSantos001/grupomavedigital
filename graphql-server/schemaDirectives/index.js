const { SchemaDirectiveVisitor } = require('graphql-tools');
const { defaultFieldResolver } = require('graphql');

const AuthDirective = require('./auth.directives')(SchemaDirectiveVisitor, defaultFieldResolver);
const TokenDirective = require('./token.directives')(SchemaDirectiveVisitor, defaultFieldResolver);
const PrivilegeDirective = require('./privilege.directives')(SchemaDirectiveVisitor, defaultFieldResolver);
const EncodeURIDirective = require('./encodeuri.directives')(SchemaDirectiveVisitor, defaultFieldResolver);

module.exports = {
    auth: AuthDirective,
    token: TokenDirective,
    privilege: PrivilegeDirective,
    encodeuri: EncodeURIDirective,
};