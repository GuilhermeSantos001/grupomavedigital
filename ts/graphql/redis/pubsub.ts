import { RedisPubSub } from 'graphql-redis-subscriptions';
import Redis from 'ioredis';

import options from '@/graphql/redis/options';

const pubsub = new RedisPubSub({
    // Tells RedisPubSub to register callbacks on the messageBuffer and pmessageBuffer EventEmitters
    messageEventName: 'messageBuffer',
    pmessageEventName: 'pmessageBuffer',
    publisher: new Redis(options),
    subscriber: new Redis(options),
});

export default pubsub;
