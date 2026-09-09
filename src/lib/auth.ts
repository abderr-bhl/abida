import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';

export async function requireAuth() {
  const cookieStore = await cookies();
  const token = cookieStore.get('admin-token')?.value;
  const adminToken = process.env.ADMIN_TOKEN || 'default-admin-token';

  if (!token || token !== adminToken) {
    redirect('/admin/login');
  }
}

export async function isAuthenticated(): Promise<boolean> {
  const cookieStore = await cookies();
  const token = cookieStore.get('admin-token')?.value;
  const adminToken = process.env.ADMIN_TOKEN || 'default-admin-token';
  return token === adminToken;
}
