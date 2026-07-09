import {
  Controller,
  Get,
  Param,
  Delete,
  Query,
  UseGuards,
} from '@nestjs/common';
import { UserService } from './user.service';
import { JwtAuthGuard } from 'src/guards/jwtAuthGuards';
import { Role } from 'src/guards/roles.decarator';
import { RolesGuard } from 'src/guards/rolesGuard';
@Controller('user')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Get()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Role('admin')
  async getAllUsers(
    @Query('id') id?: number,
    @Query('username') username?: string,
  ) {
    return await this.userService.getAllUsers(id, username);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Role('admin')
  async delUser(@Param('id') id: number) {
    return await this.userService.delUser(id);
  }
}
