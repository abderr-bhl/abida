import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';

export const ADMIN_COOKIE_NAME = 'admin-token';

export async function isAuthenticated(): Promise<boolean> {
  const cookieStore = await cookies();
  const token = cookieStore.get(ADMIN_COOKIE_NAME)?.value;
  const adminToken = process.env.ADMIN_TOKEN || 'admin-secret-token';
  return Boolean(token && token === adminToken);
}

export async function requireAuth(): Promise<void> {
  const authed = await isAuthenticated();
  if (!authed) {
    redirect('/admin/login');
  }
}

export async function verifyAdminToken(token: string): Promise<boolean> {
  const adminToken = process.env.ADMIN_TOKEN || 'admin-secret-token';
  return token === adminToken;
}
