import { IsNumber, IsString, IsNotEmpty } from 'class-validator';
import { plainToInstance } from 'class-transformer';
import { validateSync } from 'class-validator';
class EnvConfig {
  @IsNumber()
  @IsNotEmpty()
  PORT: number;

  @IsString()
  @IsNotEmpty()
  DATABASE_HOST: string; // Sử dụng DATABASE_HOST cho PostgreSQL

  @IsNumber()
  @IsNotEmpty()
  DATABASE_PORT: number; // Cổng cho PostgreSQL

  @IsString()
  @IsNotEmpty()
  DATABASE_USER: string; // Tên người dùng cho PostgreSQL

  @IsString()
  @IsNotEmpty()
  DATABASE_PASSWORD: string; // Mật khẩu cho PostgreSQL

  @IsString()
  @IsNotEmpty()
  DATABASE_NAME: string; // Tên cơ sở dữ liệu cho PostgreSQL

  @IsNotEmpty()
  @IsString()
  JWT_ACCESS_SECRET: string;

  @IsNotEmpty()
  @IsString()
  JWT_REFRESH_SECRET: string;
}

export function validateEnv(config: Record<string, unknown>) {
  const validatedConfig = plainToInstance(EnvConfig, config, {
    enableImplicitConversion: true,
  });

  const errors = validateSync(validatedConfig, {
    skipMissingProperties: false,
  });

  if (errors.length > 0) {
    console.error('Invalid environment variables:');
    errors.forEach((error) => console.error(error.toString()));
    process.exit(1);
  }

  return validatedConfig;
}
