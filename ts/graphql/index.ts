/**
 * Variables Environment
 */
import { config } from 'dotenv';
config();

import startedServer from '@/graphql/server';
import typeDefs from '@/graphql/typeDefs';
import resolvers from '@/graphql/resolvers';

startedServer({ typeDefs, resolvers, context: {  } });