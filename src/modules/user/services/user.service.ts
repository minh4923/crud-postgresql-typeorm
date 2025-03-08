import { Injectable, NotFoundException } from '@nestjs/common';
import { UserRepository } from '../repositories/user.repository';
import { UpdateUserDto } from '../dto/update-user.dto';

@Injectable()
export class UserService {
  constructor(private readonly userRepository: UserRepository) {}

  async getAllUsers(page: number, limit: number) {
    const skip = (page - 1) * limit;
    return await this.userRepository.getAllUsers(skip, limit);
  }

  async getUserById(id: number) {
    const user = await this.userRepository.getUserById(id);
    if (!user) throw new NotFoundException(`User with ID: ${id} not found`);
    return user;
  }

  async updateUserById(id: number, data: UpdateUserDto, userId: number) {
    if (userId !== id) throw new NotFoundException('You are not the owner of this user');

    await this.userRepository.updateUserById(id, data);
    const updatedUser = await this.userRepository.getUserById(id);

    if (!updatedUser) throw new NotFoundException(`User with ID: ${id} not found`);
    return updatedUser;
  }

  async deleteUserById(id: number) {
    const deleted = await this.userRepository.deleteUserById(id);
    if (!deleted) throw new NotFoundException(`User with ID: ${id} not found`);
    return { message: 'User deleted successfully' };
  }
}
