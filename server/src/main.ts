import { ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { NestExpressApplication } from '@nestjs/platform-express';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import cookieParser from 'cookie-parser';
import 'dotenv/config';
import helmet from 'helmet';
import { join } from 'path';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);

  // Статические файлы для Swagger
  app.useStaticAssets(join(__dirname, '..', 'public'));

  // Глобальный префикс для всех роутов
  app.setGlobalPrefix('api');

  // Cookie parser
  app.use(cookieParser());

  // Безопасные HTTP заголовки (с разрешением для Swagger)
  app.use(
    helmet({
      contentSecurityPolicy: {
        directives: {
          defaultSrc: ["'self'"],
          scriptSrc: ["'self'", "'unsafe-inline'", "'unsafe-eval'"],
          styleSrc: ["'self'", "'unsafe-inline'"],
          imgSrc: ["'self'", 'data:', 'https:'],
        },
      },
    }),
  );

  // CORS настройка (динамический whitelist для dev и prod)
  const whitelist = [
    process.env.FRONTEND_URL,
    'http://localhost:5173',
    'http://172.19.0.1:5173',
    'http://localhost:3000',
  ].filter(Boolean);

  // !! FIX
  app.enableCors({
    origin: (origin, callback) => {
      // allow requests with no origin like mobile apps or curl
      if (!origin) return callback(null, true);
      if (whitelist.indexOf(origin) !== -1) return callback(null, true);
      return callback(new Error('Not allowed by CORS'));
    },
    credentials: true,
    allowedHeaders: ['Content-Type', 'Authorization'],
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  });

  // Глобальная валидация
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );

  // Swagger документация
  const config = new DocumentBuilder()
    .setTitle('BjuNotFound API')
    .setDescription('API для планировщика питания и расчета КБЖУ')
    .setVersion('1.0')
    .addBearerAuth(
      {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
        name: 'JWT',
        description: 'Введите JWT токен',
        in: 'header',
      },
      'JWT-auth',
    )
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api/docs', app, document, {
    swaggerOptions: {
      persistAuthorization: true,
    },
    customSiteTitle: 'BjuNotFound API',
    customJs: ['/swagger-custom.js'],
  });

  const port = process.env.PORT ?? 5000;
  await app.listen(port);

  console.log(`🚀 Приложение запущено на http://localhost:${port}`);
  console.log(`📚 Swagger документация: http://localhost:${port}/api/docs`);
}
bootstrap();
