import { IsEmail, IsString, MinLength } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class RegisterDto {
  @ApiProperty({
    example: 'John Doe',
    description: 'User name',
    minLength: 3,
    required: true,
  })
  @IsString()
  @MinLength(3)
  name: string;

  @ApiProperty({
    example: 'user@example.com',
    description: "user's valid email",
    required: true,
  })
  @IsEmail()
  @MinLength(3)
  email: string;

  @ApiProperty({
    example: 'securepassword',
    description: 'Password must be at least 6 characters',
    minLength: 6,
    required: true,
  })
  @IsString()
  @MinLength(6)
  password: string;
}
