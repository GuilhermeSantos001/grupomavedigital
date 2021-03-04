const { SchemaDirectiveVisitor } = require('graphql-tools');
const { defaultFieldResolver } = require('graphql');

module.exports = class AuthDirective extends SchemaDirectiveVisitor {
    visitFieldDefinition(field) {
        const { resolve = defaultFieldResolver } = field
        const { roles: expectedRoles = [] } = this.args
        field.resolve = (...args) => {
            const [, , context] = args

            if (
                expectedRoles.length === 0 ||
                expectedRoles.some(r => context.request.headers['authorization'] === r)
            ) {
                // Call original resolver if role check has passed
                return resolve.apply(this, args)
            }

            // We has two options here. throw an error or return null (if field is nullable).
            throw new Error(
                `You are not authorized.`,
            )
        }
    }
}