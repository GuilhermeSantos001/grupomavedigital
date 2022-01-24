/**
 * @description Diretivas para verificar o token da rota
 * @author GuilhermeSantos001
 * @update 14/01/2022
 */

import { mapSchema, getDirectives, MapperKind } from '@graphql-tools/utils';
import { GraphQLSchema } from 'graphql';

import { decompressFromEncodedURIComponent } from 'lz-string';

import JsonWebToken from '@/core/jsonWebToken';
import userManagerDB from '@/db/user-db';
import geoIP, { clearIPAddress } from '@/utils/geoIP';

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

                            const
                                auth = decompressFromEncodedURIComponent(String(context.express.req.headers['auth'])) || String(context.express.req.headers['auth']),
                                token = decompressFromEncodedURIComponent(String(context.express.req.headers['token'])) || String(context.express.req.headers['token']),
                                refreshToken = JSON.parse(decompressFromEncodedURIComponent(String(context.express.req.headers['refreshtoken'])) || String(context.express.req.headers['refreshtoken'])),
                                signature = decompressFromEncodedURIComponent(String(context.express.req.headers['signature'])) || String(context.express.req.headers['signature']),
                                { ip } = geoIP(context.express.req),
                                internetadress = ip;

                            try {
                                await JsonWebToken.verify(token);
                                await userManagerDB.verifytoken(auth, token, signature, clearIPAddress(String(internetadress).replace('::1', '127.0.0.1')));
                                return await resolve(source, args, context, info);
                            } catch {
                                if (refreshToken) {
                                    await userManagerDB.verifyRefreshToken(auth, refreshToken.signature, refreshToken.value);
                                    const updateHistory = await userManagerDB.updateTokenHistory(auth, token);
                                    return await resolve(source, { ...args, updatedToken: { signature: updateHistory[0], token: updateHistory[1] } }, context, info);
                                }

                                throw new Error(`Token informado está invalido!`);
                            }
                        };

                    return fieldConfig;
                }
            }
        }),
    };
}