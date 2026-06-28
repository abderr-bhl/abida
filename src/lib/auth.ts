import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';

const ADMIN_TOKEN = process.env.ADMIN_TOKEN;

export async function checkAuth() {
  if (!ADMIN_TOKEN) {
    console.error('ADMIN_TOKEN is not set');
    return false;
  }
  const cookieStore = await cookies();
  const token = cookieStore.get('admin-token');

  if (token?.value !== ADMIN_TOKEN) {
    return false;
  }
  return true;
}

export async function requireAuth() {
  const authenticated = await checkAuth();
  if (!authenticated) {
    redirect('/admin/login');
  }
}

export async function login(token: string) {
  if (ADMIN_TOKEN && token === ADMIN_TOKEN) {
    const cookieStore = await cookies();
    cookieStore.set('admin-token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 60 * 60 * 24 * 7, // 1 week
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
