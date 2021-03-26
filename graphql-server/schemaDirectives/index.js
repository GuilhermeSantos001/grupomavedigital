
const AuthDirective = require('./auth.directives');
const TokenDirective = require('./token.directives');
const PrivilegeDirective = require('./privilege.directives');
const EncodeURIDirective = require('./encodeuri.directives');

module.exports = {
    auth: AuthDirective,
    token: TokenDirective,
    privilege: PrivilegeDirective,
    encodeuri: EncodeURIDirective,
};