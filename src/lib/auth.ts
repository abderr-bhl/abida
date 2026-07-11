import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';

export async function checkAuth() {
  const cookieStore = await cookies();
  const token = cookieStore.get('admin-token');

  if (!token || token.value !== process.env.ADMIN_TOKEN) {
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
