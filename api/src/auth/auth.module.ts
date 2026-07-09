import { Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from 'src/user/entities/user.entity';
import { TokenModule } from 'src/token/token.module';
import { JwtService } from '@nestjs/jwt';

@Module({
  imports: [TypeOrmModule.forFeature([User]), TokenModule],
  controllers: [AuthController],
  providers: [AuthService, JwtService],
})
export class AuthModule {}
