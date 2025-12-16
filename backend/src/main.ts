import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Global prefix
  app.setGlobalPrefix('api');

  // CORS
  app.enableCors({
    origin: process.env.CORS_ORIGIN?.split(',') || ['http://localhost:3001', 'http://localhost:8000'],
    credentials: true,
  });

  // Validation pipe
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
      forbidNonWhitelisted: true,
    }),
  );

  // Swagger configuration
  const config = new DocumentBuilder()
    .setTitle('Al Aroma API')
    .setDescription('API документация для системы управления торговлей Al Aroma')
    .setVersion('1.0')
    .addTag('auth', 'Аутентификация и авторизация')
    .addTag('users', 'Управление пользователями')
    .addTag('products', 'Управление товарами')
    .addTag('categories', 'Категории товаров')
    .addTag('sales', 'Продажи')
    .addTag('inventory', 'Управление складом')
    .addTag('locations', 'Локации (склады и точки)')
    .addTag('promotions', 'Акции и скидки')
    .addTag('certificates', 'Подарочные сертификаты')
    .addTag('customers', 'Клиенты')
    .addTag('reports', 'Отчеты и аналитика')
    .addBearerAuth(
      {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
        name: 'JWT',
        description: 'Enter JWT token',
        in: 'header',
      },
      'JWT-auth',
    )
    .addServer('http://localhost:3000', 'Development Server')
    .addServer('http://localhost:8000', 'Kong Gateway (Development)')
    .addServer('https://api.alaroma.com', 'Production Server')
    .build();

  const document = SwaggerModule.createDocument(app, config);

  // Swagger UI
  SwaggerModule.setup('api/docs', app, document, {
    swaggerOptions: {
      persistAuthorization: true,
      docExpansion: 'none',
      filter: true,
      showRequestDuration: true,
    },
    customSiteTitle: 'Al Aroma API Docs',
    customCss: '.swagger-ui .topbar { display: none }',
  });

  // Health check endpoint
  app.getHttpAdapter().get('/health', (req, res) => {
    res.json({
      status: 'ok',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
    });
  });

  const port = process.env.PORT || 3000;
  await app.listen(port);

  console.log(`🚀 Application is running on: http://localhost:${port}`);
  console.log(`📚 Swagger documentation: http://localhost:${port}/api/docs`);
  console.log(`💚 Health check: http://localhost:${port}/health`);
}

bootstrap();
