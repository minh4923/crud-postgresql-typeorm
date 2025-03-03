import { Test, TestingModule } from '@nestjs/testing';
import { AuthService } from './auth.service';
import { UserRepository } from '../../user/repositories/user.repository';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import * as bcrypt from 'bcrypt';
import { UnauthorizedException } from '@nestjs/common';
import { RegisterDto } from '../dto/auth-register.dto';
import {
  createTestingModule,
  cleanDatabase,
  closeConnection,
} from '../../../../test/setup';
import { Model, Connection } from 'mongoose';
import { User, UserDocument } from '../../user/schemas/user.schema';
import { LoginDto } from '../dto/auth-login.dto';

describe('AuthService (with Docker MongoDB)', () => {
  let authService: AuthService;
  let userRepository: UserRepository;
  let jwtService: JwtService;
  let configService: ConfigService;
  let connection: Connection;
  let userModel: Model<UserDocument>;

  beforeAll(async () => {
    const {
      module,
      userModel: model,
      connection: dbConnection,
    } = await createTestingModule([
      AuthService,
      UserRepository,
      JwtService,
      ConfigService,
    ]);

    userModel = model;
    connection = dbConnection;
    authService = module.get<AuthService>(AuthService);
    userRepository = module.get<UserRepository>(UserRepository);
    jwtService = module.get<JwtService>(JwtService);
    configService = module.get<ConfigService>(ConfigService);
  });


  afterAll(async () => {
    await cleanDatabase([userModel]);
    await closeConnection(connection);
  });

  describe('register', () => {
    it('should register a new user successfully', async () => {
      const registerDto: RegisterDto = {
        name: 'New User',
        email: 'newuser@example.com',
        password: 'password123',
      };

      const newUser = await authService.register(registerDto);

      const savedUser = await userRepository.getUserByEmail(registerDto.email);

      expect(savedUser).toBeDefined();
      if (savedUser) {
        expect(savedUser.email).toBe(registerDto.email);

        const isPasswordCorrect = await bcrypt.compare(
          registerDto.password,
          savedUser.password
        );
        expect(isPasswordCorrect).toBe(true);
      }
    });

    it('should not register a user with duplicate email', async () => {
      const registerDto: RegisterDto = {
        name: 'Duplicate User',
        email: 'duplicate@example.com',
        password: 'password123',
      };

      await authService.register(registerDto);

      await expect(authService.register(registerDto)).rejects.toThrow();
    });
  });

  describe('login', () => {
    it(' should return tokens when credentials are valid', async () => {
      const registerDto: RegisterDto = {
        name: 'Login Test User',
        email: 'logintest@example.com',
        password: 'password123',
      };

      await authService.register(registerDto);

      const loginDto: LoginDto = {
        email: registerDto.email,
        password: registerDto.password,
      };

      const result = await authService.login(loginDto);

      expect(result.accessToken).toBeDefined();
      expect(result.refreshToken).toBeDefined();
      expect(result.userId).toBeDefined();
    });

    it('should throw UnauthorizedException if credentials are invalid', async () => {
      const loginDto: LoginDto = {
        email: 'wronguser@example.com',
        password: 'wrongpassword',
      };

      await expect(authService.login(loginDto)).rejects.toThrowError(
        new UnauthorizedException('Invalid credentials')
      );
    });

    it('should throw UnauthorizedException if password is incorrect', async () => {
      const registerDto: RegisterDto = {
        name: 'Wrong Password Test',
        email: 'wrongpass@example.com',
        password: 'password123',
      };

      await authService.register(registerDto);

      const loginDto: LoginDto = {
        email: registerDto.email,
        password: 'wrongpassword',
      };

      await expect(authService.login(loginDto)).rejects.toThrowError(
        new UnauthorizedException('Invalid credentials')
      );
    });
  });
});
