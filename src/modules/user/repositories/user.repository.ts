import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from '../entities/user.entity';
import { UpdateUserDto } from '../dto/update-user.dto';

@Injectable()
export class UserRepository {
  constructor(
    @InjectRepository(User)
    private userRepository: Repository<User>
  ) {}

  async createUser(data: Partial<User>): Promise<User> {
    const newUser = this.userRepository.create(data);
    return await this.userRepository.save(newUser);
  }

  async getUserByEmail(email: string): Promise<User | null> {
    return await this.userRepository.findOne({ where: { email } });
  }

  async getAllUsers(skip: number, limit: number) {
    const [users, total] = await this.userRepository.findAndCount({
      skip,
      take: limit,
    });

    return {
      data: users,
      total,
      page: Math.ceil(skip / limit) + 1,
      limit,
    };
  }

  async getUserById(id: number): Promise<User | null> {
    return await this.userRepository.findOne({ where: { id } });
  }

  async updateUserById(id: number, data: UpdateUserDto): Promise<User | null> {
    await this.userRepository.update(id, data);
    return await this.userRepository.findOne({ where: { id } });
  }

  async deleteUserById(id: number): Promise<boolean | null> {
    const result = await this.userRepository.delete(id);
    return (result.affected ?? 0) > 0;
  }
}
