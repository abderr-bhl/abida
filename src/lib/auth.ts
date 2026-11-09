import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';

export const ADMIN_COOKIE_NAME = 'admin-token';

export async function isAuthenticated(): Promise<boolean> {
  const cookieStore = await cookies();
  const tokenCookie = cookieStore.get(ADMIN_COOKIE_NAME);
  const expectedToken = process.env.ADMIN_TOKEN;

  if (!expectedToken || !tokenCookie) {
    return false;
  }

  return tokenCookie.value === expectedToken;
}

export async function requireAuth(): Promise<void> {
  const authed = await isAuthenticated();
  if (!authed) {
    redirect('/admin/login');
  }
}
