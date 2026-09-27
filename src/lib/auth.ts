import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';

export async function requireAuth(): Promise<string> {
  const cookieStore = await cookies();
  const token = cookieStore.get('admin-token')?.value;

  const adminToken = process.env.ADMIN_TOKEN || 'admin-secret-key-123';

  if (!token || token !== adminToken) {
    redirect('/admin/login');
  }

  return token;
}

export async function isAuthenticated(): Promise<boolean> {
  const cookieStore = await cookies();
  const token = cookieStore.get('admin-token')?.value;
  const adminToken = process.env.ADMIN_TOKEN || 'admin-secret-key-123';
  return Boolean(token && token === adminToken);
}
