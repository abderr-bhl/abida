import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';

export async function requireAuth(): Promise<void> {
  const cookieStore = await cookies();
  const token = cookieStore.get('admin-token')?.value;
  const adminToken = process.env.ADMIN_TOKEN || 'admin-secret-key';

  if (!token || token !== adminToken) {
    redirect('/admin/login');
  }
}

export async function isLoggedIn(): Promise<boolean> {
  const cookieStore = await cookies();
  const token = cookieStore.get('admin-token')?.value;
  const adminToken = process.env.ADMIN_TOKEN || 'admin-secret-key';
  return Boolean(token && token === adminToken);
}
