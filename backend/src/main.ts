import 'reflect-metadata';
import { NestFactory } from '@nestjs/core';
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
  const corsOrigin = process.env.CORS_ORIGIN ?? '*';
  app.setGlobalPrefix('api');
  app.enableCors({ origin: corsOrigin });

  const port = process.env.PORT ?? 3000;
  await app.listen(port);
  console.log(`API Connector backend running on http://localhost:${port}/api`);
}

bootstrap();
