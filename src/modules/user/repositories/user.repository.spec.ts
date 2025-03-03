import { UserRepository } from './user.repository';
import { createTestingModule, cleanDatabase, closeConnection } from '../../../../test/setup';
import { Model, Connection } from 'mongoose';
import { UserDocument } from '../schemas/user.schema';

describe('UserRepository (with Docker MongoDB)', () => {
  let repository: UserRepository;
  let connection: Connection;
  let userModel: Model<UserDocument>;

  beforeAll(async () => {
    const { module, userModel: model, connection: dbConnection } = await createTestingModule([UserRepository]);
    userModel = model;
    connection = dbConnection;
    repository = module.get<UserRepository>(UserRepository);
  });

  afterAll(async () => {
    await cleanDatabase([userModel]);
    await closeConnection(connection);
  });

  describe('createUser', () => {
    it('should create a user successfully', async () => {
      const userDto = {
        name: 'Test User',
        email: 'test@example.com',
        password: 'hashedpassword',
      };
      const result = await repository.createUser(userDto);

      expect(result).toMatchObject({
        name: 'Test User',
        email: 'test@example.com',
      });
      expect(result._id).toBeDefined();
    });

    it('should not allow duplicate emails', async () => {
      const userDto = {
        name: 'Test User',
        email: 'duplicate@example.com',
        password: 'hashedpassword',
      };
      await repository.createUser(userDto);
      await expect(repository.createUser(userDto)).rejects.toThrow();
    });
  });
  describe('getAllUsers', () => {
    beforeAll(async () => {
      await cleanDatabase([userModel]);
    });
    it('should return all users with pagination', async () => {
      const skip = 0;
      const limit = 10;
      const userDto = {
        name: 'Test User',
        email: 'test1@gmail.com',
        password: 'hashedpassword',
      };
      await repository.createUser(userDto);
      const result = await repository.getAllUsers(skip, limit);
      expect(result).toHaveProperty('data');
      expect(result).toHaveProperty('page');
      expect(result).toHaveProperty('total');
      expect(result.page).toBe(1);
      expect(result.limit).toBe(limit);
      expect(result.data.length).toBeGreaterThan(0);
      expect(result.total).toBeGreaterThanOrEqual(1);
    });
  });
  describe('getUserById', () => {
    it('should return user by ID', async () => {
      const userDto = {
        name: 'User ID Test',
        email: 'userid@example.com',
        password: 'hashedpassword',
      };
      const createdUser = await repository.createUser(userDto);
      const user = await repository.getUserById(createdUser._id.toString());

      expect(user).toBeDefined();
      expect(user?._id.toString()).toBe(createdUser._id.toString());
    });
  });

  describe('deleteUserById', () => {
    it('should delete user successfully', async () => {
      const userDto = {
        name: 'User to Delete',
        email: 'delete@example.com',
        password: 'hashedpassword',
      };
      const createdUser = await repository.createUser(userDto);

      const deleteResult = await repository.deleteUserById(createdUser._id.toString());
      expect(deleteResult).toBe(true);

      const userAfterDelete = await repository.getUserById(createdUser._id.toString());
      expect(userAfterDelete).toBeNull();
    });
  });
});
