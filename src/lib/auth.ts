import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';

const ADMIN_TOKEN = process.env.ADMIN_TOKEN;

export async function checkAuth() {
  if (!ADMIN_TOKEN) {
    console.error('ADMIN_TOKEN environment variable is not set');
    return false;
  }
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

export async function login(password: string) {
  if (ADMIN_TOKEN && password === ADMIN_TOKEN) {
    const cookieStore = await cookies();
    cookieStore.set('admin-token', ADMIN_TOKEN, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      maxAge: 86400 // 1 day
    });
    return true;
  }
  return false;
}

export async function logout() {
  const cookieStore = await cookies();
  cookieStore.delete('admin-token');
}
