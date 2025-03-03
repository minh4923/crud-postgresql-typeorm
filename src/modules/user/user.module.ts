import { Module, forwardRef } from '@nestjs/common';
import { UserController } from './controllers/user.controller';
import { UserRepository } from './repositories/user.repository';
import { User, UserSchema } from './schemas/user.schema';
import { MongooseModule } from '@nestjs/mongoose';
import { UserService } from './services/user.service';
import { PostModule } from '../post/post.module';
@Module({
  imports: [MongooseModule.forFeature([{ name: User.name, schema: UserSchema }]), forwardRef(() => PostModule)],
  providers: [UserService, UserRepository],
  controllers: [UserController],
  exports: [UserService, UserRepository, MongooseModule],
})
export class UserModule {}
