import { RedisClient } from '@/core/drivers/redis-client.driver';

export class Redis {
  constructor() {
    throw new Error('this is static class');
  }

  static async save(key: string, value: string): Promise<boolean> {
    return await RedisClient.set(key, value);
  }

  static async update(key: string, newValue: string): Promise<boolean> {
    if (!(await RedisClient.get(key))) return false;

    return await RedisClient.set(key, newValue);
  }

  static async findAll(): Promise<string[]> {
    const keys = await RedisClient.keys();

    const values: string[] = [];

    for (const key of keys) {
      const value = await RedisClient.get(key);

      if (value) values.push(value);
    }

    return values;
  }

  static async findOne(key: string): Promise<string | never> {
    return await RedisClient.get(key);
  }

  static async delete(key: string): Promise<boolean> {
    return await RedisClient.delete(key);
  }
}
