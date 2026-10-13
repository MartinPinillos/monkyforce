import 'reflect-metadata';
import { ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { ConfigService } from '@nestjs/config';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import cookieParser from 'cookie-parser';
import helmet from 'helmet';
import { AppModule } from './app.module.js';
import { AllExceptionsFilter } from './common/filters/all-exceptions.filter.js';
import { correlationIdMiddleware } from './common/middleware/correlation-id.middleware.js';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const config = app.get(ConfigService);

  const apiPrefix = config.get<string>('API_PREFIX') ?? 'api';
  const port = Number(config.get<string>('PORT') ?? 3000);
  const frontendOrigin =
    config.get<string>('FRONTEND_ORIGIN') ?? 'http://localhost:4200';

  app.setGlobalPrefix(apiPrefix);
  app.use(helmet());
  app.use(cookieParser());
  app.use(correlationIdMiddleware);

  app.enableCors({
    origin: frontendOrigin,
    credentials: true,
  });

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );

  app.useGlobalFilters(new AllExceptionsFilter());

  if (config.get<string>('SWAGGER_ENABLED') !== 'false') {
    const swaggerConfig = new DocumentBuilder()
      .setTitle('MonkyForce API')
      .setDescription('MonkyForce production management API')
      .setVersion('0.1.0')
      .build();

    const document = SwaggerModule.createDocument(app, swaggerConfig);
    SwaggerModule.setup(`${apiPrefix}/docs`, app, document);
  }

  await app.listen(port);
}

void bootstrap();
