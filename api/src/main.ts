import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import * as cookieParser from 'cookie-parser';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const port = process.env.PORT;

  app.enableCors({
    origin: process.env.CORS_ORIGIN,
    credentials: true,
  });

  app.useGlobalPipes(new ValidationPipe({ whitelist: true, transform: true }));

  app.use(cookieParser());

  await app.listen(port ?? 3001, '0.0.0.0');
  console.log(`server on ${port} port`);

  console.log(`server runing in http://localhost:${port}`);
}
bootstrap();
