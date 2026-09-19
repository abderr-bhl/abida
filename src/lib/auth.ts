import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';

export async function requireAuth(): Promise<string> {
  const adminToken = process.env.ADMIN_TOKEN;
  if (!adminToken) {
    redirect('/admin/login');
  }

  const cookieStore = await cookies();
  const token = cookieStore.get('admin-token')?.value;

  if (!token || token !== adminToken) {
    redirect('/admin/login');
  }

  return token;
}

export async function isAuthenticated(): Promise<boolean> {
  const adminToken = process.env.ADMIN_TOKEN;
  if (!adminToken) return false;

  const cookieStore = await cookies();
  const token = cookieStore.get('admin-token')?.value;

  return Boolean(token && token === adminToken);
}
