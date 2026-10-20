import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';

export async function isAuthenticated(): Promise<boolean> {
  const cookieStore = await cookies();
  const tokenCookie = cookieStore.get('admin-token');
  const expectedToken = process.env.ADMIN_TOKEN || 'admin-secret-token-123';

  if (!tokenCookie || tokenCookie.value !== expectedToken) {
    return false;
  }
  return true;
}

export async function requireAuth(): Promise<void> {
  const authenticated = await isAuthenticated();
  if (!authenticated) {
    redirect('/admin/login');
  }
}
