import { cookies } from 'next/headers';
import { NextRequest } from 'next/server';

const ADMIN_TOKEN = process.env.ADMIN_TOKEN || 'dev-secret';

export async function checkAuth() {
  const cookieStore = await cookies();
  const token = cookieStore.get('admin-token');
  return token?.value === ADMIN_TOKEN;
}

export async function setAuthCookie() {
  const cookieStore = await cookies();
  cookieStore.set('admin-token', ADMIN_TOKEN, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
    maxAge: 60 * 60 * 24 * 7, // 1 week
    path: '/',
  });
}

export async function clearAuthCookie() {
  const cookieStore = await cookies();
  cookieStore.delete('admin-token');
}

export function validateApiToken(req: NextRequest) {
  const authHeader = req.headers.get('authorization');
  if (authHeader === `Bearer ${process.env.CRON_SECRET || 'dev-secret'}`) {
    return true;
  }

  const token = req.nextUrl.searchParams.get('token');
  return token === (process.env.CRON_SECRET || 'dev-secret');
}
