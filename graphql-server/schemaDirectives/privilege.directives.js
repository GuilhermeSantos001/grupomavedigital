const jwt = require('../../modules/jwt');
const LZString = require('lz-string');

module.exports = (SchemaDirectiveVisitor, defaultFieldResolver) =>
    class PrivilegeDirective extends SchemaDirectiveVisitor {
        visitFieldDefinition(field) {
            const { resolve = defaultFieldResolver } = field;
            const { keys: expectedKeys = [] } = this.args;
            field.resolve = (...args) => {
                const [, , context] = args;

                const
                    token = LZString.decompressFromEncodedURIComponent(String(context.request.headers['token'])) || String(context.request.headers['token']);

                if (
                    expectedKeys.length === 0 ||
                    expectedKeys.some(async (r) => {
                        try {
                            const { data } =
                                await jwt.verify(token),
                                { privilege } = data;

                            return privilege.indexOf(r) !== -1;
                        } catch (error) {
                            return false;
                        }
                    })
                ) {
                    // Call original resolver if role check has passed
                    return resolve.apply(this, args)
                }

                // We has two options here. throw an error or return null (if field is nullable).
                throw new Error(
                    `You have no privilege.`,
                )
            }
        }
    }