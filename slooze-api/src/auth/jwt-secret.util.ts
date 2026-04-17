/**
 * JWT signing secret must come from the OS environment (Vercel dashboard,
 * `vercel env`, Docker, etc.). We read `process.env` directly so it is not
 * dependent on @nestjs/config load order.
 */
export function resolveJwtSecret(where: string): string {
  const secret = process.env.JWT_SECRET?.trim();
  if (secret) {
    return secret;
  }
  throw new Error(
    `JWT_SECRET is missing (${where}). ` +
      'Add it under Vercel → Project → Settings → Environment Variables. ' +
      'Enable it for each environment you use (Production for slooze-api.vercel.app; Preview for *.vercel.app preview URLs). ' +
      'Then redeploy: Deployments → … on the latest deployment → Redeploy.',
  );
}
