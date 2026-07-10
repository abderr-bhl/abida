import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { NextRequest } from 'next/server';

const ADMIN_TOKEN = process.env.ADMIN_TOKEN;

export async function checkAuth() {
  const cookieStore = await cookies();
  const token = cookieStore.get('admin-token');

  return token?.value === ADMIN_TOKEN;
}

export async function requireAuth() {
  const isAuthenticated = await checkAuth();

  if (!isAuthenticated) {
    redirect('/admin/login');
  }
}

export async function validateToken(_request: NextRequest) {
  const cookieStore = await cookies();
  const token = cookieStore.get('admin-token');

  return token?.value === ADMIN_TOKEN;
}
