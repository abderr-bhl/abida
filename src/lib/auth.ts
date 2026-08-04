import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';

export async function checkAuth(): Promise<boolean> {
  const adminToken = process.env.ADMIN_TOKEN;
  if (!adminToken) {
    return false;
  }
  const cookieStore = await cookies();
  const token = cookieStore.get('admin-token')?.value;
  return token === adminToken;
}

export async function requireAuth(): Promise<void> {
  const isAuthenticated = await checkAuth();
  if (!isAuthenticated) {
    redirect('/admin/login');
  }
}
