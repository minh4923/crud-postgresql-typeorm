import { Module, forwardRef } from "@nestjs/common";
import { PostRepository } from "./repositories/post.repository";
import { Mongoose } from "mongoose";
import {Post,PostSchema} from "./schemas/post.schema"
import { MongooseModule } from "@nestjs/mongoose";
import { PostService } from "./services/post.service";
import { PostController } from "./controllers/post.controller";
import { UserModule } from "../user/user.module";

@Module({
    imports:[
        MongooseModule.forFeature([{name: Post.name, schema: PostSchema}]),
        forwardRef(() => UserModule),
    ],
    providers:[PostRepository, PostService],
    controllers: [PostController],
    exports: [PostService, PostRepository],
})
export class PostModule{}