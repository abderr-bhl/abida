import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';

const ADMIN_TOKEN_KEY = 'admin-token';

export async function checkAuth() {
  const cookieStore = await cookies();
  const token = cookieStore.get(ADMIN_TOKEN_KEY)?.value;

  if (!token || token !== process.env.ADMIN_TOKEN) {
    return false;
  }

  return true;
}

export async function requireAuth() {
  const isAuthenticated = await checkAuth();
  if (!isAuthenticated) {
    redirect('/admin/login');
  }
}

export async function login(password: string) {
  if (password === process.env.ADMIN_TOKEN) {
    const cookieStore = await cookies();
    cookieStore.set(ADMIN_TOKEN_KEY, password, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
    });
    return true;
  }
  return false;
}

export async function logout() {
  const cookieStore = await cookies();
  cookieStore.delete(ADMIN_TOKEN_KEY);
}
