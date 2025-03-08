import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Post } from '../entities/post.entity';
import { CreatePostDto } from '../dto/create-post.dto';
import { UpdatePostDto } from '../dto/update-post.dto';
import { UserRepository } from '../../user/repositories/user.repository'; 

@Injectable()
export class PostRepository {
  constructor(
    @InjectRepository(Post)
    private postRepository: Repository<Post>,
    private userRepository: UserRepository 
  ) {}

  
  async createPost(data: CreatePostDto, userId: number): Promise<Post> {
    const user = await this.userRepository.getUserById(userId); 
    if (!user) {
      throw new Error(`User with id ${userId} not found`);
    }
    const newPost = this.postRepository.create({
      ...data,
      author: user, 
    });
    return this.postRepository.save(newPost); 
  }

  async getAllPost(skip: number, limit: number) {
    const [posts, total] = await this.postRepository.findAndCount({
      skip,
      take: limit,
    });
    return {
      data: posts,
      total,
      page: Math.ceil(skip / limit) + 1,
      limit,
    };
  }

  async getPostById(id: number): Promise<Post | null> {
    return this.postRepository.findOne({ where: { id } });
  }

  // Sửa phương thức lấy bài viết của người dùng theo userId
  async getAllPostByUserId(userId: number, skip: number, limit: number) {
    const [posts, total] = await this.postRepository.findAndCount({
      where: { author: { id: userId } }, // Truy vấn bài viết của userId
      skip,
      take: limit,
    });
    return {
      data: posts,
      total,
      page: Math.ceil(skip / limit) + 1,
      limit,
    };
  }

  async updatePostById(id: number, data: UpdatePostDto): Promise<Post | null> {
    await this.postRepository.update(id, data);
    return this.postRepository.findOne({ where: { id } });
  }

  async deletePostById(id: number): Promise<boolean> {
    const result = await this.postRepository.delete(id);
    return (result.affected ?? 0) > 0;
  }
}
