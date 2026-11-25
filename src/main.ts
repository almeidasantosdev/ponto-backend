import 'reflect-metadata';
import { config as loadEnv } from 'dotenv';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { resolvePort } from './config';
import { configureApp } from './configure-app';

async function bootstrap(): Promise<void> {
  loadEnv();
  const app = await NestFactory.create(AppModule);
  const allowedOrigin = configureApp(app);
  const port = resolvePort();
  await app.listen(port, '0.0.0.0');
  console.log(`Server ON na porta ${port}`);
  console.log(`CORS configurado para: ${allowedOrigin}`);
}

bootstrap().catch((error: unknown) => {
  console.error(error);
  process.exit(1);
});
