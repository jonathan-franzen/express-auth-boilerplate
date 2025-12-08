import { Redis } from 'ioredis'

import { REDIS_URL } from '@/config/env.config.js'
import { RedisService } from '@/server/services/redis/redis.service.js'

const redis = new Redis(REDIS_URL)

export const redisService = new RedisService(redis)
