import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';

const ADMIN_TOKEN = process.env.ADMIN_TOKEN || 'dev-secret';

export async function checkAuth() {
  const cookieStore = await cookies();
  const token = (await cookieStore).get('admin-token')?.value;

  if (token !== ADMIN_TOKEN) {
    return false;
  }
  return true;
}

export async function requireAuth() {
  const isAuthenticated = await checkAuth();
  if (!isAuthenticated) {
    redirect('/admin/login');
  }
}
