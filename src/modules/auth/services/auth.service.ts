import { Injectable, UnauthorizedException } from '@nestjs/common';
import { RegisterDto } from '../dto/auth-register.dto';
import { LoginDto } from '../dto/auth-login.dto';
import * as bcrypt from 'bcrypt';
import { UserRepository } from '../../user/repositories/user.repository';
import { JwtService } from '@nestjs/jwt';
import { User, UserDocument } from '../../user/schemas/user.schema';
import { ConfigService } from '@nestjs/config';
@Injectable()
export class AuthService {
  constructor(
    private readonly userRepository: UserRepository,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService
  ) {}
  async register(RegisterDto: RegisterDto) {
    const hashedPassword = await bcrypt.hash(RegisterDto.password, 10);
    return this.userRepository.createUser({
      ...RegisterDto,
      password: hashedPassword,
    });
  }

  async login(
    loginDto: LoginDto
  ): Promise<{ accessToken: string; refreshToken: string; userId: any }> {
    const user = await this.userRepository.getUserByEmail(loginDto.email);
    if (!user || !(await bcrypt.compare(loginDto.password, user.password))) {
      throw new UnauthorizedException('Invalid credentials');
    }

    console.log(
      'JWT_ACCESS_SECRET from process.env:',
      process.env.JWT_ACCESS_SECRET
    );
    console.log(
      'JWT_ACCESS_SECRET from ConfigService:',
      this.configService.get<string>('jwt.accessSecret')
    );
    console.log('Full JWT config:', this.configService.get('jwt'));

    return {
      accessToken: this.jwtService.sign(
        {
          sub: (user as UserDocument)._id,
          email: user.email,
          role: user.role,
        },
        {
          secret: this.configService.get<string>('jwt.accessSecret'),
          expiresIn: this.configService.get<string>('jwt.accessExpiresIn'),
        }
      ),
      refreshToken: this.jwtService.sign(
        { sub: (user as UserDocument)._id },
        {
          secret: this.configService.get<string>('jwt.refreshSecret'),
          expiresIn: this.configService.get<string>('jwt.refreshExpiresIn'),
        }
      ),
      userId: (user as UserDocument)._id,
    };
  }
}
