/**
 * @description Diretivas para verificar o privilegio do usuário através do token da rota
 * @author @GuilhermeSantos001
 * @update 01/08/2021
 * @version 3.0.0
 */

import { mapSchema, getDirectives, MapperKind } from '@graphql-tools/utils';
import { GraphQLSchema } from 'graphql';

import { decompressFromEncodedURIComponent } from 'lz-string';

import JsonWebToken from '@/core/jsonWebToken';

export default function PrivilegeDirective(directiveName: string) {
    return {
        PrivilegeDirectiveTransformer: (schema: GraphQLSchema) => mapSchema(schema, {
            [MapperKind.OBJECT_FIELD]: (fieldConfig) => {
                const PrivilegeDirective = getDirectives(schema, fieldConfig, [directiveName])?.filter(_directive => _directive.name === directiveName)[0];

                if (PrivilegeDirective) {
                    const { resolve } = fieldConfig;

                    if (resolve)
                        fieldConfig.resolve = async function (source, args, context, info) {
                            const token = decompressFromEncodedURIComponent(String(context.express.req.headers['token'])) || String(context.express.req.headers['token']);

                            const keys = PrivilegeDirective.args?.keys;

                            if (
                                keys.length === 0 ||
                                keys.some(async (r: string) => {
                                    try {
                                        const
                                            { data } = await JsonWebToken.verify(token),
                                            { privileges } = data;

                                        return privileges.indexOf(r) !== -1;
                                    } catch (error) {
                                        return false;
                                    }
                                })
                            ) {
                                // Call original resolver if role check has passed
                                return await await resolve(source, args, context, info);
                            }

                            // We has two options here. throw an error or return null (if field is nullable).
                            throw new TypeError(
                                `You have no privileges.`,
                            )
                        }

                    return fieldConfig;
                }
            }
        }),
    };
}