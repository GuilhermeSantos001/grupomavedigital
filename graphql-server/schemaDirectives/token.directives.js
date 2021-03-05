const { SchemaDirectiveVisitor } = require('graphql-tools');
const { defaultFieldResolver } = require('graphql');

module.exports = class TokenDirective extends SchemaDirectiveVisitor {
    visitFieldDefinition(field) {
        const jwt = require('../../modules/jwt');
        const mongoDB = require('../../modules/mongodb');
        const LZString = require('lz-string');
        const { resolve = defaultFieldResolver } = field;
        const { ignore: ignoreToken = false } = this.args;

        field.resolve = (...args) => {
            const [, , context] = args;

            if (ignoreToken)
                return resolve.apply(this, args);

            const
                token = String(context.request.headers['token']),
                internetadress = LZString.decompressFromEncodedURIComponent(String(context.request.headers['internetadress'])) || String(context.request.headers['internetadress']);

            return jwt.verify(token)
                .then(async result => {
                    if (!result)
                        throw new Error('Token informado está invalido!');

                    try {
                        await mongoDB.users.verifytoken(result['data']['auth'], token, internetadress, internetadress)

                        return resolve.apply(this, args);
                    } catch (err) {
                        if (err['code'] === 1) {
                            throw new Error('Você não pode utilizar um token de uma sessão que foi finalizada anteriormente.');
                        } else if (err['code'] === 2) {
                            throw new Error('Você não pode utilizar um token de uma sessão que está em outro endereço de internet.');
                        } else if (err['code'] === 3) {
                            throw new Error('Você não pode utilizar um token de uma sessão que está em outro endereço de IP.');
                        }
                    }
                })
                .catch(error => { throw new Error(error) });
        }
    }
}