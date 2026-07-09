import { Global, Module } from '@nestjs/common';
import { RedisService } from './redis.service';
import { RedisController } from './redis.controller';
import Redis from 'ioredis';

@Global()
@Module({
  controllers: [RedisController],
  providers: [
    RedisService,
    {
      provide: 'REDIS_CLIENT',
      useFactory: () => {
        const redis = new Redis({
          host: process.env.REDIS_HOST,
          port: Number(process.env.REDIS_PORT),
          password: process.env.REDIS_PASSWORD,
        });

        redis.on('connect', () => {
          console.log('✅ Redis connected');
        });

        redis.on('error', (err) => {
          console.error('❌ Redis error:', err);
        });

        return redis;
      },
    },
  ],
  exports: [RedisService, 'REDIS_CLIENT'],
})
export class RedisModule {}
