/**
 * Variables Environment
 */
import { config } from 'dotenv';
config();

import mongoDB from '@/controllers/mongodb';
import startedServer from '@/app/graphql/server';
import typeDefs from '@/app/graphql/typeDefs';
import resolvers from '@/app/graphql/resolvers';

startedServer({ typeDefs, resolvers, context: { mongoDB } });