import { Inject, Injectable } from '@nestjs/common';
import Redis from 'ioredis';
@Injectable()
export class RedisService {
  constructor(@Inject('REDIS_CLIENT') private readonly client: Redis) {}

  async set(key: string, value: any, ttl?: number): Promise<void> {
    const data = JSON.stringify(value);

    if (ttl) {
      await this.client.set(key, data, 'EX', ttl);
    } else {
      await this.client.set(key, data);
    }
  }

  // redis/redis.service.ts
  async get<T = any>(key: string): Promise<T | null> {
    const data = await this.client.get(key);
    return data ? (JSON.parse(data) as T) : null;
  }

  async del(key: string): Promise<void> {
    await this.client.del(key);
  }

  async exists(key: string): Promise<boolean> {
    const result = await this.client.exists(key);
    return result === 1;
  }

  async expire(key: string, seconds: number): Promise<void> {
    await this.client.expire(key, seconds);
  }

  // ✅ Новые методы для Admin Redis Monitor

  // Все ключи по паттерну
  async keys(pattern: string = '*'): Promise<string[]> {
    return await this.client.keys(pattern);
  }

  // TTL ключа в секундах (-1 = без TTL, -2 = не существует)
  async ttl(key: string): Promise<number> {
    return await this.client.ttl(key);
  }

  // Размер значения в байтах
  async memoryUsage(key: string): Promise<number> {
    const result = (await this.client.call('MEMORY', 'USAGE', key)) as number;
    return result || 0;
  }

  // Общая информация о Redis (память, uptime, кол-во ключей)
  async info(): Promise<string> {
    return await this.client.info();
  }

  // Тип ключа (string, list, hash, set...)
  async type(key: string): Promise<string> {
    return await this.client.type(key);
  }
}
