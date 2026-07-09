import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  Query,
} from '@nestjs/common';
import { RedisService } from './redis.service';
import { JwtAuthGuard } from 'src/guards/jwtAuthGuards';
import { RolesGuard } from 'src/guards/rolesGuard';
import { Role } from 'src/guards/roles.decarator';

@Controller('redis')
@UseGuards(JwtAuthGuard, RolesGuard)
@Role('admin')
export class RedisController {
  constructor(private readonly redisService: RedisService) {}

  @Get('keys')
  async getAllKeys(@Query('pattern') pattern: string = '*') {
    const keys = await this.redisService.keys(pattern);

    const result = await Promise.all(
      keys.map(async (key) => {
        const ttl = await this.redisService.ttl(key);
        const size = await this.redisService.memoryUsage(key);
        const type = await this.redisService.type(key);

        return { key, ttl, size, type };
      }),
    );

    return result.sort((a, b) => {
      if (a.ttl === -1) return 1;
      if (b.ttl === -1) return -1;
      return a.ttl - b.ttl;
    });
  }

  @Get('info')
  async getInfo() {
    const raw = await this.redisService.info();

    // Парсим нужные поля из INFO строки
    const parse = (key: string): string => {
      const match = raw.match(new RegExp(`${key}:(.*)`));
      return match ? match[1].trim() : '—';
    };

    return {
      connected_clients: parse('connected_clients'),
      used_memory_human: parse('used_memory_human'),
      total_commands_processed: parse('total_commands_processed'),
      uptime_in_seconds: parse('uptime_in_seconds'),
      total_keys: (await this.redisService.keys('*')).length,
    };
  }

  // Получить значение конкретного ключа
  @Get('key/:key')
  async getKey(@Param('key') key: string) {
    const value = await this.redisService.get(key);
    const ttl = await this.redisService.ttl(key);
    const size = await this.redisService.memoryUsage(key);
    const type = await this.redisService.type(key);

    return { key, value, ttl, size, type };
  }

  // Удалить ключ
  @Delete('key/:key')
  async deleteKey(@Param('key') key: string) {
    await this.redisService.del(key);
    return { message: `Key "${key}" deleted` };
  }
}
