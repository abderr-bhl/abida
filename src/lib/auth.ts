import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';

export async function requireAuth() {
  const cookieStore = await cookies();
  const token = cookieStore.get('admin-token')?.value;
  const expectedToken = process.env.ADMIN_TOKEN;

  if (!expectedToken || !token || token !== expectedToken) {
    redirect('/admin/login');
  }
}

export async function checkAuth(): Promise<boolean> {
  const cookieStore = await cookies();
  const token = cookieStore.get('admin-token')?.value;
  const expectedToken = process.env.ADMIN_TOKEN;

  if (!expectedToken || !token) {
    return false;
  }
  return token === expectedToken;
}
