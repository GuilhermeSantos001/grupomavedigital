/**
 * Variables Environment
 */
import { config } from 'dotenv';
config();

import { CookieOptions } from 'express';

import startedServer from '@/graphql/server';
import typeDefs from '@/graphql/typeDefs';
import resolvers from '@/graphql/resolvers';

export const cookieOptions: CookieOptions = {
  domain: process.env.NODE_ENV === "development" ? 'localhost' : ".grupomavedigital.com.br",
  maxAge: 1000 * 60 * 15, // would expire after 15 minutes
  httpOnly: true, // The cookie only accessible by the web server
  sameSite: "strict", // Enforces the "SameSite" cookie attribute for Session Cookies.
  secure: process.env.NODE_ENV === "development" ? false : true, // Indicates if the cookie should only be transmitted over a secure HTTPS connection from the client
};

startedServer({ typeDefs, resolvers, context: { cookieOptions } });