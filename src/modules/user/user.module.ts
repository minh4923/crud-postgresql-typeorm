import { Module, forwardRef } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserController } from './controllers/user.controller';
import { User } from './entities/user.entity';
import { UserService } from './services/user.service';
import { PostModule } from '../post/post.module';
import { UserRepository } from './repositories/user.repository';

@Module({
  imports: [
    TypeOrmModule.forFeature([User]), 
    forwardRef(() => PostModule),
  ],
  providers: [UserService, UserRepository],
  controllers: [UserController],
  exports: [UserService, TypeOrmModule, UserRepository], 
})
export class UserModule {}
