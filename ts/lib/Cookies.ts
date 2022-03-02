import { ExpressContext } from 'apollo-server-express';
import { CookieOptions, Response } from 'express';

import { JsonWebToken } from '@/lib/JsonWebToken';
import { jwtVerify } from 'jose'
import { compressToUint8Array } from 'lz-string'

export type SessionCookies = {
  authorization: string;
  token: string;
  signature: string;
  refreshTokenValue: string;
  refreshTokenSignature: string;
}

export async function setSessionCookies(cookies: SessionCookies, context: { express: ExpressContext, cookieOptions: CookieOptions }) {
  try {
    context.express.res.cookie('auth', await JsonWebToken.signCookie(cookies.authorization, '7d'), {
      ...context.cookieOptions,
      maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days
    });
    context.express.res.cookie('token', await JsonWebToken.signCookie(cookies.token, '15m'), context.cookieOptions); // 15 minutes (Default)
    context.express.res.cookie('signature', await JsonWebToken.signCookie(cookies.signature, '7d'), {
      ...context.cookieOptions,
      maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days
    });
    context.express.res.cookie('refreshTokenValue', await JsonWebToken.signCookie(cookies.refreshTokenValue, '7d'), {
      ...context.cookieOptions,
      maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days
    });
    context.express.res.cookie('refreshTokenSignature', await JsonWebToken.signCookie(cookies.refreshTokenSignature, '7d'), {
      ...context.cookieOptions,
      maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days
    });
  } catch (error) {
    throw new Error(String(error));
  }
}

export async function clearSessionCookies(context: { express: ExpressContext, cookieOptions: CookieOptions }) {
  try {
    context.express.res.clearCookie('auth', {
      ...context.cookieOptions,
      maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days
    });
    context.express.res.clearCookie('token', context.cookieOptions); // 15 minutes (Default)
    context.express.res.clearCookie('signature', {
      ...context.cookieOptions,
      maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days
    });
    context.express.res.clearCookie('refreshTokenValue', {
      ...context.cookieOptions,
      maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days
    });
    context.express.res.clearCookie('refreshTokenSignature', {
      ...context.cookieOptions,
      maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days
    });
  } catch (error) {
    throw new Error(String(error));
  }
}

export async function readyCookie(cookie: string) {
  try {
    const verified = await jwtVerify(
      cookie,
      compressToUint8Array(process.env.APP_SECRET!)
    );

    return verified.payload.value as string;
  } catch {
    return false;
  }
}