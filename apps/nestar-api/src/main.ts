import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import { LoggingInterceptor } from './libs/interceptor/Logging.interceptor';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.useGlobalPipes(new ValidationPipe()); //pipe buladi kiruvchi data ni validate qilish uchun ishlatiladi //pipe qayer
  app.useGlobalInterceptors(new LoggingInterceptor()); //intercetorlar buladi har bir request va response ni log qilish uchun ishlatiladi
  await app.listen(process.env.PORT_API ?? 3000);
}

bootstrap();