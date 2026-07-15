import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { NextRequest } from 'next/server';

const ADMIN_TOKEN = process.env.ADMIN_TOKEN || 'dev-token';

export async function checkAuth() {
  const cookieStore = await cookies();
  const token = cookieStore.get('admin-token')?.value;
  return token === ADMIN_TOKEN;
}

export async function requireAuth() {
  const isAuthenticated = await checkAuth();
  if (!isAuthenticated) {
    redirect('/admin/login');
  }
}

export async function validateToken(request: NextRequest) {
  const token = request.headers.get('Authorization')?.split(' ')[1] ||
                request.nextUrl.searchParams.get('token');

  const CRON_SECRET = process.env.CRON_SECRET || 'cron-secret';
  return token === CRON_SECRET;
}
