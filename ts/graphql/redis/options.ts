export default {
    host: process.env.REDIS_HOST || "localhost",
    port: Number(process.env.REDIS_PORT) || 6379,
    db: 4,
    retryStrategy: (times: any) => {
        // reconnect after
        return Math.min(times * 50, 2000);
    }
};