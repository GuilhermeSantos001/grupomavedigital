/**
 * @description Diretivas para autorização das rotas
 * @author @GuilhermeSantos001
 * @update 01/08/2021
 * @version 3.0.0
 */

import { mapSchema, getDirectives, MapperKind } from '@graphql-tools/utils';
import { GraphQLSchema } from 'graphql';

export default function AuthDirective(directiveName: string) {
    return {
        AuthDirectiveTransformer: (schema: GraphQLSchema) => mapSchema(schema, {
            [MapperKind.OBJECT_FIELD]: (fieldConfig) => {
                const AuthDirective = getDirectives(schema, fieldConfig, [directiveName])?.filter(_directive => _directive.name === directiveName)[0];

                if (AuthDirective) {
                    const { resolve } = fieldConfig;

                    if (resolve)
                        fieldConfig.resolve = async function (source, args, context, info) {
                            if (
                                AuthDirective.args?.keys.length === 0 ||
                                AuthDirective.args?.keys.some((r: string) => {
                                    let result = false,
                                        headers = String(context.req.headers['authorization']).split(',');

                                    for (const header of headers) {
                                        if (header === r)
                                            return result = true;
                                    };

                                    return result;
                                })
                            ) {
                                // Call original resolver if role check has passed
                                return await resolve(source, args, context, info);
                            }

                            throw new Error(`You are not authorized.`);
                        }

                    return fieldConfig;
                }
            }
        }),
    };
};