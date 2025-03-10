import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ConfigService } from '@nestjs/config';
import { ValidationPipe } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import helmet from 'helmet';
async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.use(
    helmet({
      contentSecurityPolicy: {
        directives: {
          defaultSrc: ["'self'"], // Chỉ cho phép tài nguyên từ cùng nguồn gốc
          scriptSrc: ["'self'", "'nonce-randomNonce'"], // Cho phép script nội bộ, nhưng hạn chế script từ bên ngoài
          styleSrc: ["'self'", "'unsafe-inline'"], // Cho phép CSS nội bộ và inline styles
          imgSrc: ["'self'", 'data:'], // Hình ảnh có thể đến từ cùng nguồn gốc hoặc dạng base64
          connectSrc: ["'self'"], // Hạn chế kết nối WebSocket, AJAX, fetch
          fontSrc: ["'self'", 'https://fonts.gstatic.com'], // Cho phép tải font từ Google Fonts
          objectSrc: ["'none'"], // Ngăn chặn plugin như Flash
          upgradeInsecureRequests: [], // Tự động nâng cấp HTTP thành HTTPS
        },
      },
    })
  );
  app.enableCors({
    origin: ['https://myapp.com', 'http://localhost:3000'], 
    methods: 'GET, POST, PUT, DELETE',
    credentials: true, 
  });
  const configService = app.get(ConfigService);
  const port = configService.get<number>('PORT', 3000);
  const config = new DocumentBuilder()
    .setTitle('NestJS API')
    .setDescription('Document APIs with Swagger')
    .setVersion('1.0')
    .addBearerAuth()
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api', app, document);
  app.useGlobalPipes(new ValidationPipe({ whitelist: true }));
  await app.listen(port);
  console.log(` Server running on http://localhost:${port}`);
}
bootstrap();
