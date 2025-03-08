import { CanActivate, ExecutionContext, Injectable, ForbiddenException, UnauthorizedException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { ROLES_KEY } from '../guards/auth.decorator';
import { PostRepository } from '../../post/repositories/post.repository';
import { User } from 'src/modules/user/entities/user.entity';
import { InjectRepository } from '@nestjs/typeorm'; //Import tu TypeORM
import { Repository } from 'typeorm';

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(
    private reflector: Reflector,
    private readonly postRepository: PostRepository,
    @InjectRepository(User) private userRepository: Repository<User>
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const requiredRoles = this.reflector.get<string[]>(ROLES_KEY, context.getHandler());
    const req = context.switchToHttp().getRequest();
    const userId = req.user?.id;

    if (!userId) {
      throw new UnauthorizedException('You are not logged in yet!');
    }

    const user = await this.userRepository.findOne({ where: { id: userId } });
    if (!user) {
      throw new UnauthorizedException('User not found!');
    }

    if (requiredRoles.includes(user.role)) {
      return true;
    }

    throw new ForbiddenException('You do not have permission to perform this action!');
  }
}
