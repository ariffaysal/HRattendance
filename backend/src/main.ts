import { NestFactory } from '@nestjs/core';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { ValidationPipe } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import helmet from 'helmet';
import { AppModule } from './app.module';
import { AllExceptionsFilter } from './common/filters/http-exception.filter';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const configService = app.get(ConfigService);

  const isProduction = process.env.NODE_ENV === 'production';

  // Fail fast in production when the JWT signing secret is missing or still
  // the development default - a predictable secret means forgeable tokens.
  const jwtSecret = configService.get<string>('JWT_SECRET') || '';
  const insecureSecrets = ['', 'change-me-to-a-long-random-string', 'skyview-dev-secret-change-me'];
  if (isProduction && insecureSecrets.includes(jwtSecret)) {
    throw new Error(
      'JWT_SECRET must be set to a strong random value in production (e.g. `openssl rand -hex 32`)',
    );
  }

  // Security headers: HSTS, X-Content-Type-Options, frame/code injection guards, etc.
  app.use(helmet());

  app.enableCors({
    origin: configService.get<string>('FRONTEND_URL') || 'http://localhost:3000',
    credentials: true,
  });

  // Consistent error shape; internals hidden in production.
  app.useGlobalFilters(new AllExceptionsFilter());

  app.useGlobalPipes(new ValidationPipe({
    whitelist: true,
    transform: true,
  }));

  // API docs are dev tooling - never expose them in production.
  const swaggerEnabled = configService.get<string>('SWAGGER_ENABLED', 'true') !== 'false';
  if (!isProduction && swaggerEnabled) {
    const config = new DocumentBuilder()
      .setTitle('Attendance API')
      .setDescription('Attendance System API Documentation')
      .setVersion('1.0')
      .addTag('attendance')
      .addBearerAuth()
      .build();
    const document = SwaggerModule.createDocument(app, config);
    SwaggerModule.setup('api/docs', app, document);
  }

  const port = configService.get<number>('PORT') || 3001;
  await app.listen(port);
  console.log(`Application is running on: http://localhost:${port}`);
}
bootstrap();
