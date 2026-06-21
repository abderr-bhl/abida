import { NextRequest } from 'next/server';

export function checkAuth(request: NextRequest) {
  const authHeader = request.headers.get('authorization');
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return false;
  }
  const token = authHeader.split(' ')[1];
  const adminToken = process.env.ADMIN_TOKEN || 'admin'; // Default 'admin' only in development

  if (process.env.NODE_ENV === 'production' && (!process.env.ADMIN_TOKEN || adminToken === 'admin')) {
    console.error('CRITICAL: ADMIN_TOKEN must be set in production');
    return false;
  }

  return token === adminToken;
}
