import { NextRequest } from 'next/server';

export function isAuthenticated(request: NextRequest): boolean {
  // In production, we must have ADMIN_TOKEN set
  const adminToken = process.env.ADMIN_TOKEN;

  if (process.env.NODE_ENV === 'production') {
    if (!adminToken || adminToken === 'admin') {
      return false;
    }
  }

  const authHeader = request.headers.get('Authorization');
  const token = authHeader?.replace('Bearer ', '');

  // Strict check: if ADMIN_TOKEN is set, use it. Otherwise, fallback to 'admin' ONLY in dev.
  const validToken = adminToken || (process.env.NODE_ENV === 'development' ? 'admin' : null);

  if (!validToken) return false;

  return token === validToken;
}
