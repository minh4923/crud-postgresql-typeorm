import { ConfigService } from '@nestjs/config';

export const appConfig = (configService: ConfigService) => ({
  port: configService.get<number>('PORT', 3000),
});
