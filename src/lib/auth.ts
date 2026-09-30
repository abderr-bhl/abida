import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';

export const ADMIN_COOKIE_NAME = 'admin-token';

export function getAdminToken(): string {
  return process.env.ADMIN_TOKEN || 'admin123';
}

export async function isAuthenticated(): Promise<boolean> {
  const cookieStore = await cookies();
  const token = cookieStore.get(ADMIN_COOKIE_NAME)?.value;
  const validToken = getAdminToken();
  return token === validToken;
}

export async function requireAuth(): Promise<void> {
  const authed = await isAuthenticated();
  if (!authed) {
    redirect('/admin/login');
  }
}
