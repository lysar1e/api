import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import * as cookieParser from 'cookie-parser';
import {NestExpressApplication} from "@nestjs/platform-express";

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);
  const PORT = process.env.PORT || 8800;
  app.use(cookieParser());
  app.disable('x-powered-by');
  app.enableCors({ origin: process.env.CLIENT_URL, credentials: true });
  await app.listen(PORT);
}
bootstrap();
