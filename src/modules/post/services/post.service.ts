import { Injectable, NotFoundException } from '@nestjs/common';
import { PostRepository } from '../repositories/post.repository';
import { CreatePostDto } from '../dto/create-post.dto';
import { UpdatePostDto } from '../dto/update-post.dto';
import { Post, PostDocument } from '../schemas/post.schema';
import { UserRepository } from '../../user/repositories/user.repository';

@Injectable()
export class PostService {
  constructor(
    private readonly postRepository: PostRepository,
    private readonly userRepository: UserRepository
  ) {}

  async createPost(data: CreatePostDto, userId: string): Promise<PostDocument> {
    try {
      const user = await this.userRepository.getUserById(userId);
      if (!user) {
        throw new NotFoundException(`User with Id: ${userId} not found`);
      }
      return await this.postRepository.createPost(data, userId);
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      throw new Error('Error while creating post');
    }
  }

  async getAllPost(page: number, limit: number) {
    const skip = (page - 1) * limit;
    return this.postRepository.getAllPost(skip, limit);
  }

  async getPostById(id: string): Promise<PostDocument> {
    const post = await this.postRepository.getPostById(id);
    if (!post) throw new NotFoundException(`Post with Id: ${id} not found`);
    return post;
  }

  async getAllPostByUserId(userId: string, page: number, limit: number) {
    const skip = (page - 1) * limit;
    const user = await this.userRepository.getUserById(userId);
    if (!user) throw new NotFoundException(`User with Id: ${userId} not found`);
    return await this.postRepository.getAllPostByUserId(userId, skip, limit);
  }

  async updatePostById(id: string, data: UpdatePostDto, userId: string): Promise<PostDocument | null> {
    const post = await this.postRepository.getPostById(id);
    if (!post) throw new NotFoundException(`Post with Id: ${id} not found`);
    if (post.author.toString() !== userId) throw new NotFoundException(`You are not the author of this post`);
    const postUpdate = await this.postRepository.updatePostById(id, data);
    return postUpdate;
  }

  async deletePostById(id: string, userId: string): Promise<{ message: string }> {
    const post = await this.postRepository.getPostById(id);
    if(!post) throw new NotFoundException(`Post with Id: ${id} not found`);
    if(post.author.toString() !== userId) throw new NotFoundException(`You are not the author of this post`);
    const postDelete  = await this.postRepository.deletePostById(id);
    return { message: 'Post deleted successfully' };
  }
}
