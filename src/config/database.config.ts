import { ConfigService } from '@nestjs/config';

export const databaseConfig = (configService: ConfigService) => ({
  uri: configService.get<string>(
    'MONGODB_URI',
    process.env.NODE_ENV === 'test' ? 'mongodb://localhost:27018/nestjs' : 'mongodb://localhost:27017/nestjs'
  ),
});
