// setup.ts
import { Test, TestingModule } from '@nestjs/testing';
import { MongooseModule, getConnectionToken } from '@nestjs/mongoose';
import { getModelToken } from '@nestjs/mongoose';
import { Model, Connection } from 'mongoose';
import { ConfigModule } from '@nestjs/config';
import jwtConfig from '../src/config/jwt.config';
import { AppModule } from '../src/app.module';
import { User, UserSchema, UserDocument } from '../src/modules/user/schemas/user.schema';
import { Post, PostSchema, PostDocument } from '../src/modules/post/schemas/post.schema';
export async function createTestingModule(providers: any[] = []) {
  const module: TestingModule = await Test.createTestingModule({
    imports: [
      ConfigModule.forRoot({
        isGlobal: true,
        envFilePath: '.env.test',
        load: [jwtConfig], 
      }),
      MongooseModule.forRoot(process.env.MONGODB_URI as string),
      MongooseModule.forFeature([
        { name: User.name, schema: UserSchema },
        { name: Post.name, schema: PostSchema },
      ]),
    ],
    providers: [...providers],
  }).compile();

  const userModel = module.get<Model<UserDocument>>(getModelToken(User.name));
  const postModel = module.get<Model<PostDocument>>(getModelToken(Post.name));
  const connection = module.get<Connection>(getConnectionToken());

  return { module, userModel, postModel, connection };
}

export async function cleanDatabase(models: Model<any>[] = []) {
  for (const model of models) {
    if (model) {
      await model.deleteMany({});
    }
  }
}


export async function closeConnection(connection: Connection) {
  await connection.close();
  console.log('MongoDB connection closed');
}
