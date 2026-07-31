import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';

export async function checkAuth(): Promise<boolean> {
  const adminToken = process.env.ADMIN_TOKEN;
  if (!adminToken) {
    console.warn('Warning: ADMIN_TOKEN environment variable is not set. All admin requests will fail.');
    return false;
  }

  const cookieStore = await cookies();
  const tokenCookie = cookieStore.get('admin-token');

  if (!tokenCookie || tokenCookie.value !== adminToken) {
    return false;
  }

  return true;
}

export async function requireAuth(): Promise<void> {
  const isAuthenticated = await checkAuth();
  if (!isAuthenticated) {
    redirect('/admin/login');
  }
}
