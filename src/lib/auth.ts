import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';

export async function requireAuth() {
  const cookieStore = await cookies();
  const token = cookieStore.get('admin-token')?.value;

  const validToken = process.env.ADMIN_TOKEN;

  if (!token || !validToken || token !== validToken) {
    redirect('/admin/login');
  }
}

export async function isAuthenticated(): Promise<boolean> {
  const cookieStore = await cookies();
  const token = cookieStore.get('admin-token')?.value;
  const validToken = process.env.ADMIN_TOKEN;

  return Boolean(token && validToken && token === validToken);
}
