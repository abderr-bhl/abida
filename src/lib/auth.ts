import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { NextRequest } from 'next/server';

const ADMIN_TOKEN = process.env.ADMIN_TOKEN || 'admin-secret-key-123';

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

export async function login(token: string) {
  if (token === ADMIN_TOKEN) {
    const cookieStore = await cookies();
    cookieStore.set('admin-token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24, // 24 hours
      path: '/',
    });
    return true;
  }
  return false;
}

export async function logout() {
  const cookieStore = await cookies();
  cookieStore.delete('admin-token');
}

export async function getAuthToken(request: NextRequest) {
  return request.cookies.get('admin-token')?.value;
}
