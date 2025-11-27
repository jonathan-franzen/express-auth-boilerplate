import { Redis } from 'ioredis'

export class RedisService {
  constructor(private readonly redis: Redis) {}

  async set(key: string, value: string, ttlSeconds?: number) {
    if (ttlSeconds) {
      return this.redis.set(key, value, 'EX', ttlSeconds)
    } else {
      return this.redis.set(key, value)
    }
  }

  async setIfNotExists(key: string, value: string, ttlSeconds?: number) {
    if (ttlSeconds) {
      return this.redis.set(key, value, 'EX', ttlSeconds, 'NX')
    } else {
      return this.redis.set(key, value, 'NX')
    }
  }

  async get(key: string): Promise<string | null> {
    return this.redis.get(key)
  }
}
