import { Module, forwardRef } from '@nestjs/common';
import { PostRepository } from './repositories/post.repository';
import { PostService } from './services/post.service';
import { PostController } from './controllers/post.controller';
import { TypeOrmModule } from '@nestjs/typeorm'; 
import { Post } from './entities/post.entity'; 
import { UserModule } from '../user/user.module';

@Module({
  imports: [

    TypeOrmModule.forFeature([Post]), 
    forwardRef(() => UserModule),
  ],
  providers: [PostRepository, PostService],
  controllers: [PostController],
  exports: [PostService, PostRepository],
})
export class PostModule {}
