function decompress(method, value) {
    const LZString = require('lz-string');

    switch (method) {
        case "lz-string":
            return LZString.decompressFromEncodedURIComponent(value) || value;
    }
}

module.exports = (SchemaDirectiveVisitor, defaultFieldResolver) =>
    class EncodeURIDirective extends SchemaDirectiveVisitor {
        visitFieldDefinition(field) {
            const { resolve = defaultFieldResolver } = field;
            const { method } = this.args;

            field.resolve = async (...args) => {
                const
                    [, props, context] = args,
                    encodeuri = eval(String(context.request.headers['encodeuri']));

                if (encodeuri) {
                    let newProps = {};

                    Object
                        .keys(props)
                        .forEach(key => {
                            newProps[key] = decompress(method, props[key])
                        });

                    args[1] = newProps;

                    return resolve.apply(this, args);
                } else {
                    return resolve.apply(this, args);
                }
            }
        }
    }