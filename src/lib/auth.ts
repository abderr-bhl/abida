import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';

export function getAdminToken(): string | undefined {
  return process.env.ADMIN_TOKEN;
}

export async function verifyAuth(): Promise<boolean> {
  const adminToken = getAdminToken();
  if (!adminToken) {
    return false;
  }

  const cookieStore = await cookies();
  const tokenCookie = cookieStore.get('admin-token');

  return Boolean(tokenCookie && tokenCookie.value === adminToken);
}

export async function requireAuth(): Promise<void> {
  const isAuthenticated = await verifyAuth();
  if (!isAuthenticated) {
    redirect('/admin/login');
  }
}
