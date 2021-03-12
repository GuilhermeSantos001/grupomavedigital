
const AuthDirective = require('./auth.directives');
const TokenDirective = require('./token.directives');
const PrivilegeDirective = require('./privilege.directives');

module.exports = {
    auth: AuthDirective,
    token: TokenDirective,
    privilege: PrivilegeDirective
};