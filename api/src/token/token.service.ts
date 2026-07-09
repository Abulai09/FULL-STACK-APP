import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { InjectRepository } from '@nestjs/typeorm';
import { RedisService } from 'src/redis/redis.service';
import { User } from 'src/user/entities/user.entity';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';

@Injectable()
export class TokenService {
  constructor(
    private readonly redis: RedisService,
    private readonly jwtServ: JwtService,
    @InjectRepository(User) private userRepo: Repository<User>,
  ) {}

  generateWebTokens(payload: Pick<User, 'id' | 'username' | 'email' | 'role'>) {
    const access_token = this.jwtServ.sign({
      id: payload.id,
      username: payload.username,
      role: payload.role,
    });

    const refresh_token = this.jwtServ.sign(
      {
        id: payload.id,
        username: payload.username,
        role: payload.role,
      },
      { expiresIn: '5d', secret: process.env.JWT_REFRESH },
    );

    return { access_token, refresh_token };
  }

  async saveInDb(token: string, userId: number) {
    const user = await this.userRepo.findOne({ where: { id: userId } });
    if (!user) throw new UnauthorizedException('UnauthorizedException');
    const tokenKey = `${user.id}:token`;

    const hashedTokenValue = await bcrypt.hash(token, 5);

    const alreadyExists = await this.redis.exists(tokenKey);
    if (alreadyExists) await this.redis.del(tokenKey);

    await this.redis.set(tokenKey, hashedTokenValue, 60 * 60 * 24 * 5);
    return { message: 'savedInDb' };
  }

  async logOut(userId: number) {
    const tokenKey = `${userId}:token`;
    await this.redis.del(tokenKey);
    return { message: 'Logged out successfully' };
  }

  async refreshing(token: string) {
    const payload = this.jwtServ.verify(token, {
      secret: process.env.JWT_REFRESH,
    });

    const user = await this.userRepo.findOne({ where: { id: payload.id } });
    if (!user) throw new UnauthorizedException('UnauthorizedException');
    const tokenKey = `${user.id}:token`;

    const tokenVal = await this.redis.get(tokenKey);
    if (!tokenVal) throw new UnauthorizedException('token not found');

    const validToken = await bcrypt.compare(token, tokenVal);
    if (!validToken) throw new UnauthorizedException('Invalid token');

    const tokens = this.generateWebTokens(user);
    await this.saveInDb(tokens.refresh_token, user.id);

    return tokens;
  }
}
