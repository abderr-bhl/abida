import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';

const ADMIN_TOKEN_KEY = 'admin-token';
const ADMIN_TOKEN = process.env.ADMIN_TOKEN || 'admin-secret-token';

export async function setAuthCookie() {
  const cookieStore = await cookies();
  cookieStore.set(ADMIN_TOKEN_KEY, ADMIN_TOKEN, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 60 * 60 * 24, // 24 hours
    path: '/',
  });
}

export async function removeAuthCookie() {
  const cookieStore = await cookies();
  cookieStore.delete(ADMIN_TOKEN_KEY);
}

export async function isAuthenticated(): Promise<boolean> {
  const cookieStore = await cookies();
  const token = cookieStore.get(ADMIN_TOKEN_KEY)?.value;
  return token === ADMIN_TOKEN;
}

export async function requireAuth() {
  if (!(await isAuthenticated())) {
    redirect('/admin/login');
  }
}
