/**
 * @description Diretivas para verificar se a rota tem dados criptografados
 * @author @GuilhermeSantos001
 * @update 01/08/2021
 * @version 3.0.0
 */

import { mapSchema, getDirectives, MapperKind } from '@graphql-tools/utils';
import { GraphQLSchema } from 'graphql';

import { decompressFromEncodedURIComponent } from 'lz-string';

function decompress(method: string, value: string): string | object {
    switch (method) {
        case "lz-string":
            const decode = decompressFromEncodedURIComponent(value);

            if (typeof decode === 'string') {
                if (
                    decode.slice(0, 1).indexOf('[') !== -1 ||
                    decode.slice(0, 1).indexOf('{') !== -1
                ) {
                    return JSON.parse(decode);
                } else {
                    return decode;
                }
            } else {
                return value;
            }
        default:
            return value;
    }
}

export default function EncodeUriDirective(directiveName: string) {
    return {
        EncodeUriDirectiveTransformer: (schema: GraphQLSchema) => mapSchema(schema, {
            [MapperKind.OBJECT_FIELD]: (fieldConfig) => {
                const EncodeUriDirective = getDirectives(schema, fieldConfig, [directiveName])?.filter(_directive => _directive.name === directiveName)[0];

                if (EncodeUriDirective) {
                    const { resolve } = fieldConfig;

                    if (resolve)
                        fieldConfig.resolve = async function (source, args, context, info) {
                            const
                                method = EncodeUriDirective.args?.method,
                                bool = String(context.express.req.headers['encodeuri']).match(/true|false/gi),
                                option = bool ? bool[0] : "",
                                encodeuri = eval(option);

                            if (encodeuri) {
                                const newProps: any = {};

                                Object
                                    .keys(args)
                                    .forEach(key => newProps[key] = decompress(method, args[key].toString()));

                                return await await resolve(source, newProps, context, info);
                            } else {
                                return await await resolve(source, args, context, info);
                            }
                        }

                    return fieldConfig;
                }
            }
        }),
    };
}