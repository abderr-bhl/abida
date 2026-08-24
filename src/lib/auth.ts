import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';

export async function checkAuth(): Promise<boolean> {
  const cookieStore = await cookies();
  const tokenCookie = cookieStore.get('admin-token');
  const expectedToken = process.env.ADMIN_TOKEN || 'admin-secret';

  if (!tokenCookie || !tokenCookie.value) {
    return false;
  }

  return tokenCookie.value === expectedToken;
}

export async function requireAuth(): Promise<void> {
  const isAuthenticated = await checkAuth();
  if (!isAuthenticated) {
    redirect('/admin/login');
  }
}
