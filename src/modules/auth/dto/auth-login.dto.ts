import { IsString, IsEmail } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class LoginDto {
  @ApiProperty({
    example: 'user@example.com',
    description: 'Login email',
    required: true,
  })
  @IsEmail()
  @IsString()
  email: string;

  @ApiProperty({
    example: 'yourpassword',
    description: 'Login password',
    required: true,
  })
  @IsString()
  password: string;
}
