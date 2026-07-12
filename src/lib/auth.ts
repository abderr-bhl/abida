import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';

const ADMIN_TOKEN = process.env.ADMIN_TOKEN;

export async function checkAuth() {
  if (!ADMIN_TOKEN) {
    console.error('ADMIN_TOKEN environment variable is not set');
    return false;
  }
  const cookieStore = await cookies();
  const token = cookieStore.get('admin-token');
  return token?.value === ADMIN_TOKEN;
}

export async function requireAuth() {
  const isAuthenticated = await checkAuth();
  if (!isAuthenticated) {
    redirect('/admin/login');
  }
}
