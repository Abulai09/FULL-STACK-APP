import { Controller, Post, Body, UseGuards, Res, Req, UnauthorizedException } from '@nestjs/common';
import { AuthService } from './auth.service';
import { CreateAuthDto, LoginDto } from './dto/create-auth.dto';
import { JwtAuthGuard } from 'src/guards/jwtAuthGuards';
import { Response, Request } from 'express';
import { JwtService } from '@nestjs/jwt';

@Controller('auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly jwtService: JwtService, // ✅ добавляем
  ) {}

  // ✅ Один объект для всех cookie — не дублируем код
  private readonly cookieOptions = {
    maxAge: 5 * 24 * 60 * 60 * 1000,
    httpOnly: true,
    secure: false,
    sameSite: 'lax' as const,
  };

  @Post('registration')
  async registration(
    @Body() dto: CreateAuthDto,
    @Res({ passthrough: true }) res: Response,
  ) {
    const userData = await this.authService.registration(dto);
    res.cookie('refreshToken', userData.refresh_token, this.cookieOptions);
    return { userData };
  }

  @Post('admin')
  async admin(@Body() dto: CreateAuthDto) {
    const userData = await this.authService.registrateAdmin(dto);
    return userData.access_token;
  }

  @Post('login')
  async login(
    @Body() dto: LoginDto,
    @Res({ passthrough: true }) res: Response,
  ) {
    const userData = await this.authService.login(dto);
    res.cookie('refreshToken', userData.refresh_token, this.cookieOptions);
    return userData.access_token;
  }

  @Post('logOut')
  async logOut(@Req() req: Request, @Res({ passthrough: true }) res: Response) {
    const refreshToken = req.cookies?.refreshToken;
    res.clearCookie('refreshToken', this.cookieOptions);

    if (refreshToken) {
      try {
        const payload = this.jwtService.verify(refreshToken, {
          secret: process.env.JWT_REFRESH,
        });
        if (payload?.id) await this.authService.logOut(payload.id);
      } catch (e) {
        // токен истёк — просто очищаем куку
      }
    }

    return { message: 'Logged out' };
  }
  @Post('refresh')
  async refreshToken(
    @Req() req: Request,
    @Res({ passthrough: true }) res: Response,
  ) {
    const refreshToken = req.cookies?.refreshToken;
    if (!refreshToken) throw new UnauthorizedException('Refresh token missing');
    const token = await this.authService.refreshToken(refreshToken);
    res.cookie('refreshToken', token.refresh_token, this.cookieOptions);
    return token;
  }
}
