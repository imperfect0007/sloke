import { INestApplication, ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { ExpressAdapter } from '@nestjs/platform-express';
import * as express from 'express';
import { AppModule } from './app.module';

function assertVercelRuntimeEnv(): void {
  if (process.env.VERCEL !== '1') {
    return;
  }
  const missing: string[] = [];
  if (!process.env.JWT_SECRET?.trim()) {
    missing.push('JWT_SECRET');
  }
  if (!process.env.DATABASE_URL?.trim()) {
    missing.push('DATABASE_URL');
  }
  if (missing.length === 0) {
    return;
  }
  throw new Error(
    `Vercel is missing required environment variable(s): ${missing.join(', ')}. ` +
      'In the Vercel dashboard: Project → Settings → Environment Variables. ' +
      'Add each key for the environments you use (at least Production; add Preview if you open preview URLs). ' +
      'Save, then redeploy (Deployments → … → Redeploy).',
  );
}

export async function createNestApp(): Promise<INestApplication> {
  assertVercelRuntimeEnv();
  const expressInstance = express();
  const adapter = new ExpressAdapter(expressInstance);
  const app = await NestFactory.create(AppModule, adapter, {
    logger: ['error', 'warn'],
  });
  app.enableCors({ origin: true, credentials: true });
  app.useGlobalPipes(
    new ValidationPipe({ whitelist: true, transform: true }),
  );
  await app.init();
  return app;
}
