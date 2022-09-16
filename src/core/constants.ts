import { RedisClientOptions } from 'redis';

import { CoreOptions } from '@/constants';

export const redisOptions: RedisClientOptions = {
  database: CoreOptions.redis.database,
  url: process.env.REDIS_HOST,
  password: process.env.REDIS_PASSWORD,
};

export const smtpOptions = {
  host: process.env.SMTP_HOST,
  port: parseInt(process.env.SMTP_PORT),
  secure: eval(process.env.SMTP_SECURE),
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
};
