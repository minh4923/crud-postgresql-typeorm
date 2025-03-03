import { IsString, MinLength, IsNotEmpty } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreatePostDto {
  @ApiProperty({
    example: 'Post title',
    description: 'Post title',
    minLength: 1,
  })
  @IsNotEmpty()
  @IsString()
  @MinLength(1)
  title: string;

  @ApiProperty({
    example: 'Post content',
    description: 'Detailed content of the post',
    minLength: 1,
  })
  @IsNotEmpty()
  @IsString()
  @MinLength(1)
  content: string;
}
