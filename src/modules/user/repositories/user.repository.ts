import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { User, UserDocument } from '../schemas/user.schema';
import { Model } from 'mongoose';
import { UpdateUserDto } from '../dto/update-user.dto';
import { boolean } from 'joi';
@Injectable()
export class UserRepository {
  constructor(@InjectModel(User.name) private userModel: Model<UserDocument>) {}
  async createUser(data: Partial<User>): Promise<UserDocument> {
    return await this.userModel.create(data);
  }

  async getUserByEmail(email: string): Promise<UserDocument | null> {
    return this.userModel.findOne({ email }).exec();
  }
  async getAllUsers(skip: number, limit: number) {
    const users = await this.userModel.find().skip(skip).limit(limit).exec();
    const total = await this.userModel.countDocuments().exec();
    return {
      data: users,
      total,
      page: Math.ceil(skip / limit) + 1,
      limit,
    };
  }
  async getUserById(id: string): Promise<UserDocument | null> {
    return this.userModel.findById(id).exec();
  }
  async updateUserById(
    id: string,
    data: UpdateUserDto,
  ): Promise<UserDocument | null> {
    return this.userModel.findByIdAndUpdate(id, data, { new: true }).exec();
  }
  async deleteUserById(id: string): Promise<Boolean> {
    const result = await this.userModel.findByIdAndDelete(id).exec();
    return result !== null;
  }
}
