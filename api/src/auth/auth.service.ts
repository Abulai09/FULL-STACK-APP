import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { CreateAuthDto, LoginDto } from './dto/create-auth.dto';
import { UpdateAuthDto } from './dto/update-auth.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { User, UserRole } from 'src/user/entities/user.entity';
import { Repository } from 'typeorm';
import { TokenService } from 'src/token/token.service';
import * as bcrypt from 'bcrypt';

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(User) private userRepo: Repository<User>,
    private readonly tokenServ: TokenService,
  ) {}

  async saveAndGenerateTokens(
    user: Pick<User, 'id' | 'username' | 'role' | 'email'>,
  ) {
    const tokens = this.tokenServ.generateWebTokens({
      id: user.id,
      username: user.username,
      email: user.email,
      role: user.role, // ← обязательно
    });
    await this.tokenServ.saveInDb(tokens.refresh_token, user.id);
    return {
      ...tokens,
      user: {
        id: user.id,
        username: user.username,
        role: user.role,
      },
    };
  }

  async registration(dto: CreateAuthDto) {
    const candidate = await this.userRepo.findOne({
      where: { username: dto.username },
    });
    if (candidate) throw new BadRequestException('Already exists');

    const hashpassword = await bcrypt.hash(dto.password, 10);

    const user = this.userRepo.create({
      username: dto.username,
      email: dto.email,
      password: hashpassword,
      role: UserRole.USER,
    });
    await this.userRepo.save(user);

    return await this.saveAndGenerateTokens(user);
  }

  async login(dto: LoginDto) {
    const user = await this.userRepo.findOne({
      where: { username: dto.username },
    });
    if (!user) throw new NotFoundException('Invalid username or password');

    const validPassword = await bcrypt.compare(dto.password, user.password);
    if (!validPassword)
      throw new NotFoundException('Invalid username or password');

    return await this.saveAndGenerateTokens(user);
  }

  async registrateAdmin(dto: CreateAuthDto) {
    const hashpassword = await bcrypt.hash(dto.password, 10);
    const user = this.userRepo.create({
      username: dto.username,
      email: dto.email,
      password: hashpassword,
      role: UserRole.ADMIN,
    });

    await this.userRepo.save(user);

    return await this.saveAndGenerateTokens(user);
  }

  async logOut(userId: number) {
    return await this.tokenServ.logOut(userId);
  }

  async refreshToken(token: string) {
    return await this.tokenServ.refreshing(token);
  }
}
