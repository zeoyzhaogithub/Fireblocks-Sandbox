import process from 'node:process'
import { ghost } from '@hairy/utils'
import { Redis, RedisOptions } from 'ioredis'

export const redis = ghost<Redis>('Redis is not available, please check your environment variables.')

if (process.env.REDIS_HOST && process.env.REDIS_PORT) {
  const options: RedisOptions = {
    host: process.env.REDIS_HOST!,
    port: Number(process.env.REDIS_PORT!),
  }
  redis.resolve(new Redis(options))
}
else if (process.env.REDIS_URL) {
  redis.resolve(new Redis(process.env.REDIS_URL!))
}
