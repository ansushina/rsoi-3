import { Logger } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
const path = require('path');

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  require('dotenv').config({
    path: path.resolve(
        process.cwd(),
        '.env',
    ),
});
  Logger.log(process.env.PORT)
  await app.listen(process.env.PORT);
}
bootstrap();
