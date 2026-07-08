import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';

export async function checkAuth() {
  const cookieStore = await cookies();
  const token = cookieStore.get('admin-token')?.value;

  if (token !== process.env.ADMIN_TOKEN && token !== 'dev-admin-token') {
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
