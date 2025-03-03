import { PostRepository } from '../repositories/post.repository';
import { PostService } from './post.service';
import { Model, Connection } from 'mongoose';
import { PostDocument } from '../schemas/post.schema';
import { CreatePostDto } from '../dto/create-post.dto';
import { RegisterDto as CreateUserDto } from 'src/modules/auth/dto/auth-register.dto';
import { createTestingModule, cleanDatabase, closeConnection } from '../../../../test/setup';
import { UserRepository } from '../../user/repositories/user.repository';
import { NotFoundException } from '@nestjs/common';
import { UserDocument } from '../../user/schemas/user.schema';
import { UpdatePostDto } from '../dto/update-post.dto';

describe('PostRepository (with Docker MongoDB)', () => {
  let postRepository: PostRepository;
  let connection: Connection;
  let userModel: Model<UserDocument>;
  let postModel: Model<PostDocument>;
  let postService: PostService;
  let userRepository: UserRepository;
  beforeAll(async () => {
    const {
      module,
      userModel: model1,
      postModel: model2,
      connection: dbConnection,
    } = await createTestingModule([PostRepository, PostService, UserRepository]);
    userModel = model1;
    postModel = model2;
    connection = dbConnection;
    postRepository = module.get<PostRepository>(PostRepository);
    postService = module.get<PostService>(PostService);
    userRepository = module.get<UserRepository>(UserRepository);
  });

  afterAll(async () => {
    await cleanDatabase([postModel, userModel]);
    await closeConnection(connection);
  });
  describe('creatPost', () => {
    it('should create a post successfully', async () => {
      const userDto: CreateUserDto = {
        name: 'test',
        email: 'test@gmail.com',
        password: 'test',
      };
      const user = await userRepository.createUser(userDto);

      const postDto: CreatePostDto = {
        title: 'test',
        content: 'test',
      };
      const result = await postService.createPost(postDto, user._id.toString());
      expect(result).toHaveProperty('_id');
      expect(result).toHaveProperty('author');
      expect(result.title).toBe(postDto.title);
      expect(result.content).toBe(postDto.content);
    });

    it('should throw NotFoundException if user does not exist', async () => {
      const userId = '69f4c1a8fc13ae5c80000000';
      const postDto: CreatePostDto = {
        title: 'test',
        content: 'test',
      };

      await expect(postService.createPost(postDto, userId)).rejects.toThrowError(
        new NotFoundException(`User with Id: ${userId} not found`)
      );
    });

    it('should throw Error while creating post if database error occurs', async () => {
      const userDto: CreateUserDto = {
        name: 'test',
        email: 'test2@gmail.com',
        password: 'test',
      };
      const user = await userRepository.createUser(userDto);
      const postDto = { title: 'test', content: '' };
      await expect(postService.createPost(postDto, user._id.toString())).rejects.toThrowError('Error while creating post');
    });
  });

  describe('geAllPost', () => {
    beforeAll(async () => {
      await cleanDatabase([postModel, userModel]);
    });
    it('should return paginated posts', async () => {
      const page = 1;
      const limit = 10;
      const userDto1: CreateUserDto = {
        name: 'test1',
        email: 'test1@gmail.com',
        password: 'test1',
      };
      const userDto2: CreateUserDto = {
        name: 'test2',
        email: 'test2@gmail.com',
        password: 'test2',
      };
      const user1 = await userRepository.createUser(userDto1);
      const user2 = await userRepository.createUser(userDto2);
      const postDto: CreatePostDto = {
        title: 'test',
        content: 'test',
      };
      await postService.createPost(postDto, user1._id.toString());
      await postService.createPost({ ...postDto, title: 'test2' }, user1._id.toString());
      await postService.createPost({ ...postDto, title: 'test2' }, user2._id.toString());
      const result = await postService.getAllPost(page, limit);
      result.data.forEach((post) => {
        expect(post).toHaveProperty('title');
        expect(post).toHaveProperty('author');
        expect(post).toHaveProperty('content');
      });
      expect(result.page).toBe(1);
      expect(result.limit).toBe(limit);
      expect(result).toHaveProperty('page');
      expect(result).toHaveProperty('limit');

      expect(result.data.length).toBeGreaterThan(0);
      expect(result.total).toBeGreaterThanOrEqual(3);
    });
  });

  describe('getPostById', () => {
    beforeAll(async () => {
      await cleanDatabase([postModel, userModel]);
    });
    it('should return a post if found', async () => {
      const userDto: CreateUserDto = {
        name: 'test',
        email: 'test3@gmail.com',
        password: 'test',
      };
      const user = await userRepository.createUser(userDto);
      const postDto: CreatePostDto = {
        title: 'test',
        content: 'test',
      };
      const post = await postService.createPost(postDto, user._id.toString());
      const result = await postService.getPostById(post._id as string);
      expect(result).toBeInstanceOf(Object);
      expect(result).toHaveProperty('title');
      expect(result).toHaveProperty('content');
      expect(result).toHaveProperty('author');
      expect(result?.title).toBe(postDto.title);
      expect(result?.content).toBe(postDto.content);
      expect(result?.author.toString()).toBe(user._id.toString());
    });

    it('should throw NotFoundException if post not found', async () => {
      const postId = '66f4c1a8fc13ae5c80000000';
      await expect(postService.getPostById(postId)).rejects.toThrowError(new NotFoundException(`Post with Id: ${postId} not found`));
    });
  });

  describe('updatePostById', () => {
    it('should update a post successfully', async () => {
      const userDto: CreateUserDto = {
        name: 'test',
        email: 'test4@gmail.com',
        password: 'test',
      };
      const postDto: CreatePostDto = {
        title: 'test',
        content: 'test',
      };
      const user = await userRepository.createUser(userDto);
      const post = await postService.createPost(postDto, user._id.toString());

      const updateDto: UpdatePostDto = {
        title: 'test_update',
      };
      const result = await postService.updatePostById(post._id as string, updateDto, user._id.toString());
      expect(result).toHaveProperty('_id');
      expect(result!.title).toBe(updateDto.title);
      expect(result).toHaveProperty('content');
    });
    it('should throw NotFoundException if post not found', async () => {
      const postId = '66f4c1a8fc13ae5c80000000';
      const updateDto: UpdatePostDto = {
        title: 'test_update',
      };
      const userId = '66f4c1a8fc13ae5c80000000';
      await expect(postService.updatePostById(postId, updateDto, userId)).rejects.toThrowError(
        new NotFoundException(`Post with Id: ${postId} not found`)
      );
    });
  });

  describe('deletePostById', () => {
    it('should delete a post successfully', async () => {
      const userDto: CreateUserDto = {
        name: 'test',
        email: 'test5@gmail.com',
        password: 'test',
      };
      const user = await userRepository.createUser(userDto);
      const postDto: CreatePostDto = {
        title: 'test',
        content: 'test',
      };
      const post = await postService.createPost(postDto, user._id.toString());
      const result = await postService.deletePostById(post._id as string, user._id.toString());
      expect(result).toEqual({ message: 'Post deleted successfully' });
    });
    it('should throw NotFoundException if post not found', async () => {
      const postId = '66f4c1a8fc13ae5c80000000';
      const userId = ' 66f4c1a8fc13ae5c80000000';
      await expect(postService.deletePostById(postId,userId)).rejects.toThrowError(new NotFoundException(`Post with Id: ${postId} not found`));
    });
  });
});
