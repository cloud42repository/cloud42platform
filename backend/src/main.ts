import 'reflect-metadata';
import { NestFactory } from '@nestjs/core';
import cookieParser from 'cookie-parser';
import { AppModule } from './app.module';

async function bootstrap(): Promise<void> {
  if (process.env['MOCK_MODE'] === 'true') {
    console.log('');
    console.log('╔══════════════════════════════════════════════╗');
    console.log('║  🧪  MOCK_MODE is ON — no real API calls     ║');
    console.log('╚══════════════════════════════════════════════╝');
    console.log('');
  }

  const app = await NestFactory.create(AppModule);

  // Cookie parser — required for HttpOnly refresh-token cookies
  app.use(cookieParser());

  // CORS_ORIGIN may be a single URL or comma-separated list
  // e.g. "https://black-field-0f1f7e803.azurestaticapps.net,http://localhost:4200"
  const rawOrigins = process.env['CORS_ORIGIN'] || 'http://localhost:4200';
  const allowedOrigins = rawOrigins.split(',').map(o => o.trim()).filter(Boolean);

  app.setGlobalPrefix('api');
  app.enableCors({
    origin: (origin, callback) => {
      // Allow requests with no origin (curl, Postman, server-to-server)
      if (!origin) return callback(null, true);
      if (allowedOrigins.includes(origin)) return callback(null, true);
      console.warn(`CORS blocked origin: ${origin}  (allowed: ${allowedOrigins.join(', ')})`);
      callback(new Error(`CORS: origin ${origin} not allowed`));
    },
    credentials: true,               // allow cookies cross-origin
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
  });

  console.log(`Allowed CORS origins: ${allowedOrigins.join(', ')}`);

  const port = process.env['PORT'] ?? 3000;
  await app.listen(port);
  console.log(`API Connector backend running on http://localhost:${port}/api`);
}

bootstrap();
