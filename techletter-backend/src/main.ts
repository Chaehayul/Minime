import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { NestExpressApplication } from '@nestjs/platform-express';
import { join } from 'path';

function parseCorsOrigins(value?: string) {
  const configuredOrigins =
    value?.split(',').map((origin) => origin.trim()).filter(Boolean) ?? [];

  return [
    ...new Set([
      'http://localhost:3001',
      'https://minime-eight.vercel.app',
      ...configuredOrigins,
    ]),
  ];
}

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);
  app.enableCors({
    origin: parseCorsOrigins(process.env.CORS_ORIGINS ?? process.env.FRONTEND_URL),
    credentials: true,
  });
  app.useStaticAssets(join(__dirname, '..', 'uploads'), {
    prefix: '/uploads',
  });
  await app.listen(process.env.PORT ?? 3000, '0.0.0.0');
}
bootstrap();
