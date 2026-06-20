import { NextRequest } from 'next/server';

export function checkAuth(req: NextRequest) {
  const authHeader = req.headers.get('Authorization');
  const adminPassword = process.env.ADMIN_PASSWORD || 'admin';

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return false;
  }

  const token = authHeader.split(' ')[1];
  return token === adminPassword;
}

export function checkCronAuth(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const token = searchParams.get('token');
  const cronSecret = process.env.CRON_SECRET || 'dev-secret';

  return token === cronSecret;
}
