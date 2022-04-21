import { mapSchema, getDirectives, MapperKind } from '@graphql-tools/utils';
import { GraphQLSchema } from 'graphql';

import { setSessionCookies } from '@/lib/Cookies';

import { JsonWebToken } from '@/lib/JsonWebToken';
import { UsersManagerDB } from '@/database/UsersManagerDB';
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
                            const
                                usersManagerDB = new UsersManagerDB(),
                                ignore = TokenDirective.args?.ignore;

                            if (ignore)
                                return await resolve(source, args, context, info);

                            const
                                auth = context.express.req.cookies.auth,
                                token = context.express.req.cookies.token,
                                signature = context.express.req.cookies.signature,
                                refreshTokenValue = context.express.req.cookies.refreshTokenValue,
                                refreshTokenSignature = context.express.req.cookies.refreshTokenSignature,
                                { ip } = geoIP(context.express.req),
                                internetadress = ip;

                            if (!auth || !signature || !refreshTokenValue || !refreshTokenSignature)
                                throw new Error(`Credenciais expiradas!`);

                            try {
                                await JsonWebToken.verify(token as string);
                                await usersManagerDB.verifytoken(auth, token as string, signature, clearIPAddress(String(internetadress).replace('::1', '127.0.0.1')));
                                return await resolve(source, args, context, info);
                            } catch {
                                try {
                                    await usersManagerDB.verifyRefreshToken(auth, refreshTokenSignature, refreshTokenValue);
                                    const updateHistory = await usersManagerDB.updateTokenHistory(auth, signature);

                                    await setSessionCookies({
                                        authorization: auth,
                                        token: updateHistory[1],
                                        signature: updateHistory[0],
                                        refreshTokenValue,
                                        refreshTokenSignature,
                                    }, context);

                                    return await resolve(source, args, context, info);
                                } catch (error) {
                                    console.log(error);
                                    throw new Error(`Refresh Token inválido!`);
                                }
                            }
                        };

                    return fieldConfig;
                }
            }
        }),
    };
}