import { IsEmail, IsString, MinLength } from 'class-validator';
import { UserRole } from 'src/user/entities/user.entity';

export class CreateAuthDto {
  @IsString()
  @MinLength(3, { message: 'min:3' })
  username: string;

  @MinLength(3, { message: 'min:3' })
  @IsEmail()
  email: string;

  @MinLength(3, { message: 'min:3' })
  password: string;

  role?: UserRole;
}

export class LoginDto {
  @IsString()
  @MinLength(3, { message: 'min:3' })
  username: string;

  @MinLength(3, { message: 'min:3' })
  password: string;
}
