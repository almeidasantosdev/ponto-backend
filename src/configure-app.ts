import { INestApplication } from '@nestjs/common';
import { getAllowedOrigin } from './config';

export function configureApp(app: INestApplication): string {
  const allowedOrigin = getAllowedOrigin();
  app.enableCors({
    origin: allowedOrigin,
    methods: ['GET', 'POST'],
    credentials: true,
  });
  return allowedOrigin;
}
