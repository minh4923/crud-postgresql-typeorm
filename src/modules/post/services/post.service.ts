import { Injectable, NotFoundException } from '@nestjs/common';
import { PostRepository } from '../repositories/post.repository';
import { CreatePostDto } from '../dto/create-post.dto';
import { UpdatePostDto } from '../dto/update-post.dto';
import { Post } from '../entities/post.entity';
import { UserRepository } from '../../user/repositories/user.repository';

@Injectable()
export class PostService {
  constructor(
    private readonly postRepository: PostRepository,
    private readonly userRepository: UserRepository
  ) {}

  // Create Post method with TypeORM
  async createPost(data: CreatePostDto, userId: number): Promise<Post> {
    const user = await this.userRepository.getUserById(userId);
    if (!user) {
      throw new NotFoundException(`User with Id: ${userId} not found`);
    }
    return await this.postRepository.createPost(data, userId);
  }

  // Get all posts with pagination
  async getAllPost(page: number, limit: number) {
    const skip = (page - 1) * limit;
    return this.postRepository.getAllPost(skip, limit);
  }

  // Get a post by ID
  async getPostById(id: number): Promise<Post> {
    const post = await this.postRepository.getPostById(id);
    if (!post) throw new NotFoundException(`Post with Id: ${id} not found`);
    return post;
  }

  // Get all posts by a user with pagination
  async getAllPostByUserId(userId: number, page: number, limit: number) {
    const skip = (page - 1) * limit;
    const user = await this.userRepository.getUserById(userId);
    if (!user) throw new NotFoundException(`User with Id: ${userId} not found`);
    return await this.postRepository.getAllPostByUserId(userId, skip, limit);
  }

  // Update post by ID with validation for author
  async updatePostById(id: number, data: UpdatePostDto, userId: number): Promise<Post | null> {
    const post = await this.postRepository.getPostById(id);
    if (!post) throw new NotFoundException(`Post with Id: ${id} not found`);
    if (post.author.id !== userId) throw new NotFoundException(`You are not the author of this post`);
    const postUpdate = await this.postRepository.updatePostById(id, data);
    return postUpdate;
  }

  // Delete post by ID with validation for author
  async deletePostById(id: number, userId: number): Promise<{ message: string }> {
    const post = await this.postRepository.getPostById(id);
    if (!post) throw new NotFoundException(`Post with Id: ${id} not found`);
    if (post.author.id !== userId) throw new NotFoundException(`You are not the author of this post`);
    await this.postRepository.deletePostById(id);
    return { message: 'Post deleted successfully' };
  }
}
