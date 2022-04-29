import { ExpressContext } from 'apollo-server-express';
import { CookieOptions } from 'express';

export type SessionCookies = {
  authorization: string;
  token: string;
  signature: string;
  refreshTokenValue: string;
  refreshTokenSignature: string;
}

export async function setSessionCookies(cookies: SessionCookies, context: { express: ExpressContext, cookieOptions: CookieOptions }) {
  try {
    context.express.res.cookie('auth', cookies.authorization, {
      ...context.cookieOptions,
      maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days
    });
    context.express.res.cookie('token', cookies.token, context.cookieOptions); // 15 minutes (Default)
    context.express.res.cookie('signature', cookies.signature, {
      ...context.cookieOptions,
      maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days
    });
    context.express.res.cookie('refreshTokenValue', cookies.refreshTokenValue, {
      ...context.cookieOptions,
      maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days
    });
    context.express.res.cookie('refreshTokenSignature', cookies.refreshTokenSignature, {
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