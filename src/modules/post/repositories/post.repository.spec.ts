import { PostRepository } from './post.repository';
import { Model, Connection } from 'mongoose';
import { PostDocument } from '../schemas/post.schema';
import { CreatePostDto } from '../dto/create-post.dto';
import { createTestingModule, cleanDatabase, closeConnection } from '../../../../test/setup';
describe('PostRepository (with Docker MongoDB)', () => {
  let repository: PostRepository;
  let connection: Connection;
  let postModel: Model<PostDocument>;

  beforeAll(async () => {
    const { module, postModel: model, connection: dbConnection } = await createTestingModule([PostRepository]);
    postModel = model;
    connection = dbConnection;
    repository = module.get<PostRepository>(PostRepository);
  });

  afterAll(async () => {
    await cleanDatabase([postModel]);
    await closeConnection(connection);
  });

  describe('createPost', () => {
    it('should create a post successfully', async () => {
      const postDto: CreatePostDto = {
        title: 'Test Post',
        content: 'This is a test post content',
      };
      const userId = '65f4c1a8fc13ae5c80000000';

      const saveSpy = jest.spyOn(postModel.prototype, 'save').mockResolvedValueOnce({
        ...postDto,
        author: userId,
      });

      const createdPost = await repository.createPost(postDto, userId);

      expect(createdPost).toBeDefined();
      expect(createdPost.author.toString()).toBe(userId);
      expect(saveSpy).toHaveBeenCalled(); // Kiểm tra xem save có được gọi không
    });
  });
  describe('getAllPost', () => {
    beforeAll(async () => {
      await cleanDatabase([postModel]);
    });

    it('should return all posts with pagination', async () => {
      const skip = 0;
      const limit = 10;
      const postDto: CreatePostDto = {
        title: 'Test 1',
        content: 'Test',
      };
      const userId = '65f4c1a8fc13ae5c80000000';
      await repository.createPost(postDto, userId);
      await repository.createPost({ ...postDto, title: 'Test 2' }, userId);
      const result = await repository.getAllPost(skip, limit);
      expect(result).toHaveProperty('data');
      expect(result).toHaveProperty('page');
      expect(result).toHaveProperty('total');
      expect(result.page).toBe(1);
      expect(result.limit).toBe(limit);
      expect(result.data.length).toBeGreaterThan(0);
      expect(result.total).toBeGreaterThanOrEqual(2);
    });
  });
  describe('getPostById', () => {
    it('should return a post if found', async () => {
      const postDto: CreatePostDto = {
        title: 'test',
        content: 'test',
      };
      const userId = '65f4c1a8fc13ae5c80000000';
      const post = await repository.createPost(postDto, userId);
      const result = await repository.getPostById(post._id as string);
      expect(result).toBeDefined();
      expect(result).toBeInstanceOf(Object);
      expect(result).toHaveProperty('title');
      expect(result).toHaveProperty('content');
      expect(result).toHaveProperty('author');
      expect(result?.title).toBe(postDto.title);
      expect(result?.content).toBe(postDto.content);
      expect(result?.author.toString()).toBe(userId);
    });
    it('should return null if post not found', async () => {
      const postId = '69f4c1a8fc13ae5c80000000';
      const post = await repository.getPostById(postId);
      expect(post).toBeNull();
    });
  });

  describe('getAllPostByUserId', () => {
     beforeAll(async () => {
       await cleanDatabase([postModel]);
     });

    it('should return posts by userId with pagination', async () => {
      const postDto: CreatePostDto = {
        title: 'test 1',
        content: 'test 1',
      };
      const userId = '65f4c1a8fc13ae5c80000000';
      await repository.createPost(postDto, userId);
      await repository.createPost({ ...postDto, title: 'test 2' }, userId);
      await repository.createPost({ ...postDto, title: 'test 3' }, userId);
      const skip = 0;
      const limit = 10;
      const result = await repository.getAllPostByUserId(userId, skip, limit);
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
  describe('deletePostById', () => {
    it('should delete a post successfully', async () => {
      const postDto: CreatePostDto = {
        title: 'test1',
        content: 'test1',
      };
      const userId = '65f4c1a8fc13ae5c80000000';
      const post = await repository.createPost(postDto, userId);
      const result = await repository.deletePostById(post._id as string);
      expect(result).toBe(true);
      const deletePost = await repository.getPostById(post._id as string);
      expect(deletePost).toBeNull();
    });
    it('should return false if post not found for deletion', async () => {
      const postId = '70f4c1a8fc13ae5c80000000';
      const result = await repository.deletePostById(postId);
      expect(result).toBe(false);
    });
  });
});
