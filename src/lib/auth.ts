import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';

export const ADMIN_COOKIE_NAME = 'admin-token';

export async function isAuthenticated(): Promise<boolean> {
  const cookieStore = await cookies();
  const tokenCookie = cookieStore.get(ADMIN_COOKIE_NAME);
  const secret = process.env.ADMIN_TOKEN;

  if (!secret || !tokenCookie?.value) {
    return false;
  }

  return tokenCookie.value === secret;
}

export async function requireAuth(): Promise<void> {
  const authenticated = await isAuthenticated();
  if (!authenticated) {
    redirect('/admin/login');
  }
}
