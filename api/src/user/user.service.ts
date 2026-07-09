import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from './entities/user.entity';
import { ILike, Repository } from 'typeorm';

@Injectable()
export class UserService {
  constructor(@InjectRepository(User) private userRepo: Repository<User>) {}

  async getAllUsers(id?: number, username?: string) {
    const where: any = {};

    if (id !== undefined) where.id = id;

    if (username !== undefined) where.username = username;

    if (username) {
      where.username = ILike(`%${username}%`);
    }

    return await this.userRepo.find({ where, order: { id: 'DESC' } });
  }

  async delUser(id: number) {
    const user = await this.userRepo.findOne({ where: { id } });
    if (!user) throw new NotFoundException('Not found:<');

    await this.userRepo.remove(user);
    return { message: 'Deleted Successfully' };
  }
}
