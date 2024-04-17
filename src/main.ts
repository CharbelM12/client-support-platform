import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ConfigService } from '@nestjs/config';
import { ValidationPipe } from '@nestjs/common';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const config = app.get(ConfigService);
  app.useGlobalPipes(
    new ValidationPipe({
      disableErrorMessages: config.get<boolean>('validationPipe.booleanValue'),
      whitelist: config.get<boolean>('validationPipe.booleanValue'),
      forbidNonWhitelisted: config.get<boolean>('validationPipe.booleanValue'),
    }),
  );
  await app.listen(config.get<number>('port'));
}
bootstrap();
