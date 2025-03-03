import { Controller, Get, Param, Put, Delete, Body, Query, Request} from '@nestjs/common';
import { UserService } from '../services/user.service';
import { UpdateUserDto } from '../dto/update-user.dto';
import { Auth } from '../../auth/guards/auth.decorator';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiQuery, ApiParam, ApiBody } from '@nestjs/swagger';

@ApiTags('Users')
@ApiBearerAuth()
@Controller('users')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Get()
  @Auth('Admin') 
  @ApiOperation({ summary: 'Get a list of all users' })
  @ApiQuery({ name: 'page', required: false, example: 1, description: 'Page number' })
  @ApiQuery({ name: 'limit', required: false, example: 10, description: 'Number of users per page' })
  @ApiResponse({ status: 200, description: 'The list of users is returned' })
  async getAllUsers(@Query('page') page: number = 1, @Query('limit') limit: number = 10) {
    return this.userService.getAllUsers(page, limit);
  }

  @Get(':id')
  @Auth('admin') 
  @ApiOperation({ summary: 'Get user information by ID' })
  @ApiParam({ name: 'id', required: true, description: 'User ID' })
  @ApiResponse({ status: 200, description: 'User information is returned' })
  @ApiResponse({ status: 404, description: 'User does not exist' })
  async getUserById(@Param('id') id: string) {
    return this.userService.getUserById(id);
  }

  @Put(':id')
  @Auth('admin ','user') 
  @ApiOperation({ summary: 'Update user information' })
  @ApiParam({ name: 'id', required: true, description: 'User ID' })
  @ApiBody({ type: UpdateUserDto })
  @ApiResponse({ status: 200, description: 'User information is updated' })
  @ApiResponse({ status: 400, description: 'Invalid input data' })
  async updateUserById(@Param('id') id: string, @Body() updateUserDto: UpdateUserDto, @Request() req) {
    return this.userService.updateUserById(id, updateUserDto , req.user.id);  
  }

  @Delete(':id')
  @Auth('admin')
  @ApiOperation({ summary: 'Delete users by ID (Admin only)' })
  @ApiParam({ name: 'id', required: true, description: 'User ID' })
  @ApiResponse({ status: 200, description: 'User has been deleted' })
  @ApiResponse({ status: 403, description: 'No access' })
  async deleteUserById(@Param('id') id: string) {
    return this.userService.deleteUserById(id);
  }
}
