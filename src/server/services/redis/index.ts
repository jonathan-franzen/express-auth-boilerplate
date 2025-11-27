import { Redis } from 'ioredis'

import { REDIS_URL } from '@/constants/environment.constants.js'
import { RedisService } from '@/server/services/redis/redis.service.js'

export const redis = new Redis(REDIS_URL)

export const redisService = new RedisService(redis)
