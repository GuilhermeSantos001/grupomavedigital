/**
 * @description Diretivas para verificar o token da rota
 * @author @GuilhermeSantos001
 * @update 01/08/2021
 * @version 3.0.0
 */

import { mapSchema, getDirectives, MapperKind } from '@graphql-tools/utils';
import { GraphQLSchema } from 'graphql';

import { decompressFromEncodedURIComponent } from 'lz-string';

import JsonWebToken from '@/core/jsonWebToken';
import userManagerDB from '@/db/user-db';
import geoIP from '@/utils/geoIP';

export default function TokenDirective(directiveName: string) {
    return {
        TokenDirectiveTransformer: (schema: GraphQLSchema) => mapSchema(schema, {
            [MapperKind.OBJECT_FIELD]: (fieldConfig) => {
                const TokenDirective = getDirectives(schema, fieldConfig, [directiveName])?.filter(_directive => _directive.name === directiveName)[0];

                if (TokenDirective) {
                    const { resolve } = fieldConfig;

                    if (resolve)
                        fieldConfig.resolve = async function (source, args, context, info) {
                            const ignore = TokenDirective.args?.ignore;

                            if (ignore)
                                return await resolve(source, args, context, info);

                            const { ip } = geoIP(context.req);

                            const
                                token = decompressFromEncodedURIComponent(String(context.req.headers['token'])) || String(context.req.headers['token']),
                                internetadress = ip;

                            const decoded = await JsonWebToken.verify(token);

                            if (!decoded)
                                throw new Error('Token informado está invalido!');

                            try {
                                await userManagerDB.verifytoken(decoded['auth'], token, internetadress);

                                return await resolve(source, args, context, info);
                            } catch (err: any) {
                                if (err['code'] === 1) {
                                    throw new Error('Você não pode utilizar um token de uma sessão que foi finalizada anteriormente.');
                                } else if (err['code'] === 2) {
                                    throw new Error('Você não pode utilizar um token de uma sessão que está em outro endereço de internet.');
                                } else if (err['code'] === 3) {
                                    throw new Error('Você não pode utilizar um token de uma sessão que está em outro endereço de IP.');
                                };

                                throw new Error(err);
                            };
                        };

                    return fieldConfig;
                }
            }
        }),
    };
};