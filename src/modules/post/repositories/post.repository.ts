import { InjectModel } from '@nestjs/mongoose';
import { Injectable } from '@nestjs/common';
import { Model } from 'mongoose';
import { AuthGuard } from '@nestjs/passport';
import { CreatePostDto } from '../dto/create-post.dto';
import { UpdatePostDto } from '../dto/update-post.dto';
import { PostDocument, Post } from '../schemas/post.schema';
@Injectable()
export class PostRepository {
  constructor(@InjectModel(Post.name) private postModel: Model<PostDocument>) {}

  async createPost(data: CreatePostDto, userId: string): Promise<PostDocument> {
    const newPost = new this.postModel({ ...data, author: userId });
    return newPost.save();
  }

  async getAllPost(skip: number, limit: number) {
    const posts = await this.postModel.find().skip(skip).limit(limit).exec();
    const total = await this.postModel.countDocuments().exec();
    return {
      data: posts,
      total,
      page: Math.ceil(skip / limit) + 1,
      limit,
    };
  }

  async getPostById(id: string): Promise<PostDocument | null> {
    return this.postModel.findById(id).exec();
  }

  async getAllPostByUserId(UserId: string, skip: number, limit: number) {
    const posts = await this.postModel
      .find({ author: UserId })
      .skip(skip)
      .limit(limit)
      .exec();
    const total = await this.postModel.countDocuments().exec();
    return {
      data: posts,
      total,
      page: Math.ceil(skip / limit) + 1,
      limit,
    };
  }

  async updatePostById(id: string, data: UpdatePostDto): Promise<PostDocument | null> {
    return this.postModel.findByIdAndUpdate(id, data, { new: true }).exec();
  }
  
  async deletePostById(id: string): Promise<boolean> {
    const post = await this.postModel.findByIdAndDelete(id);
    return post !== null;
  }
}
