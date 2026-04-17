import type { VercelRequest, VercelResponse } from '@vercel/node';
import type { Express } from 'express';

let cachedServer: Express | undefined;

export default async function handler(
  req: VercelRequest,
  res: VercelResponse,
) {
  if (!cachedServer) {
    const { createNestApp } = await import('../dist/src/bootstrap.js');
    const nest = await createNestApp();
    cachedServer = nest.getHttpAdapter().getInstance() as Express;
  }
  return cachedServer(req, res);
}
