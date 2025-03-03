import { Controller, Post, Get, Put, Delete, Param, Body, UseGuards, Req, Query, Request } from '@nestjs/common';
import { PostService } from '../services/post.service';
import { CreatePostDto } from '../dto/create-post.dto';
import { UpdatePostDto } from '../dto/update-post.dto';
import { Post as Posts } from '../schemas/post.schema';
import { AuthenticatedRequest } from 'src/common/interfaces/authenticated-request';
import { Auth } from '../../auth/guards/auth.decorator';
import { RolesGuard } from '../../auth/guards/role.guard';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiQuery, ApiParam, ApiBody } from '@nestjs/swagger';

@ApiTags('Posts')
@ApiBearerAuth()
@Controller('posts')
@UseGuards(RolesGuard)
export class PostController {
  constructor(private readonly postService: PostService) {}

  @Post()
  @Auth()
  @ApiOperation({ summary: 'Create a new post' })
  @ApiBody({ type: CreatePostDto })
  @ApiResponse({ status: 201, description: 'The post has been created' })
  @ApiResponse({ status: 400, description: 'Invalid input data' })
  async createPost(@Body() data: CreatePostDto, @Req() req: AuthenticatedRequest): Promise<Posts> {
    const userId = req.user.id;
    return this.postService.createPost(data, userId);
  }

  @Get()
  @Auth()
  @ApiOperation({ summary: 'Retrieve a list of all posts' })
  @ApiQuery({ name: 'page', required: false, example: 1, description: 'Page number' })
  @ApiQuery({ name: 'limit', required: false, example: 10, description: 'Number of posts per page' })
  @ApiResponse({ status: 200, description: 'The list of posts has been returned' })
  async getAllPost(@Query('page') page: number = 1, @Query('limit') limit: number = 10) {
    return this.postService.getAllPost(page, limit);
  }

  @Get(':id')
  @Auth()
  @ApiOperation({ summary: 'Retrieve a post by ID' })
  @ApiParam({ name: 'id', required: true, description: 'ID of the post' })
  @ApiResponse({ status: 200, description: 'The post has been returned' })
  @ApiResponse({ status: 404, description: 'Post not found' })
  async getPostById(@Param('id') id: string): Promise<Posts> {
    return this.postService.getPostById(id);
  }

  @Get('user/:userId')
  @Auth()
  @ApiOperation({ summary: 'Retrieve all posts of a specific user' })
  @ApiParam({ name: 'userId', required: true, description: 'ID of the user' })
  @ApiQuery({ name: 'page', required: false, example: 1, description: 'Page number' })
  @ApiQuery({ name: 'limit', required: false, example: 10, description: 'Number of posts per page' })
  @ApiResponse({ status: 200, description: 'The list of user posts has been returned' })
  async getAllPostByUserId(@Param('userId') userId: string, @Query('page') page: number = 1, @Query('limit') limit: number = 10) {
    return this.postService.getAllPostByUserId(userId, page, limit);
  }

  @Put(':id')
  @Auth('admin', 'user')
  @ApiOperation({ summary: 'Update a post by ID' })
  @ApiParam({ name: 'id', required: true, description: 'ID of the post' })
  @ApiBody({ type: UpdatePostDto })
  @ApiResponse({ status: 200, description: 'The post has been updated' })
  @ApiResponse({ status: 400, description: 'Invalid input data' })
  @ApiResponse({ status: 403, description: 'No permission to update this post' })
  async updatePostById(@Param('id') id: string, @Body() data: UpdatePostDto, @Request() req): Promise<Posts | null> {
    return this.postService.updatePostById(id, data, req.user.id);
  }

  @Delete(':id')
  @Auth('admin', 'user')
  @ApiOperation({ summary: 'Delete a post by ID' })
  @ApiParam({ name: 'id', required: true, description: 'ID of the post' })
  @ApiResponse({ status: 200, description: 'The post has been deleted' })
  @ApiResponse({ status: 403, description: 'No permission to delete this post' })
  async deletePostById(@Param('id') id: string, @Request() req): Promise<{ message: string }> {
    return this.postService.deletePostById(id, req.user.id);
  }
}
