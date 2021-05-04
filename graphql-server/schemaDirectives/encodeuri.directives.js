function decompress(method, value) {
    const LZString = require('lz-string');

    switch (method) {
        case "lz-string":
            try {
                let decode = LZString.decompressFromEncodedURIComponent(value);

                if (
                    decode.slice(0, 1).indexOf('[') !== -1 ||
                    decode.slice(0, 1).indexOf('{') !== -1
                ) {
                    return JSON.parse(decode);
                } else {
                    return decode;
                }
            } catch {
                return value;
            }
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
                        .forEach(key => newProps[key] = decompress(method, props[key].toString()));

                    args[1] = newProps;

                    return resolve.apply(this, args);
                } else {
                    return resolve.apply(this, args);
                }
            }
        }
    }