import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import * as cookieParser from 'cookie-parser';
import {NestExpressApplication} from "@nestjs/platform-express";

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);
  app.use(cookieParser());
  app.disable('x-powered-by');
  app.enableCors({ origin: 'https://fasfafsa.fun', credentials: true });
  await app.listen(8800);
}
bootstrap();
