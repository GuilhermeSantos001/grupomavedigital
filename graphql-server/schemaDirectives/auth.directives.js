module.exports = (SchemaDirectiveVisitor, defaultFieldResolver) =>
    class AuthDirective extends SchemaDirectiveVisitor {
        visitFieldDefinition(field) {
            const { resolve = defaultFieldResolver } = field;
            const { keys: expectedKeys = [] } = this.args;
            field.resolve = (...args) => {
                const [, , context] = args;

                if (
                    expectedKeys.length === 0 ||
                    expectedKeys.some(r => {
                        let result = false,
                            data = String(context.request.headers['authorization']).split(','),
                            i = 0,
                            l = data.length;

                        for (; i < l; i++) {
                            if (data[i] === r)
                                return result = true;
                        }

                        return result;
                    })
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