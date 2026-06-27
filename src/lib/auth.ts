import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';

export async function checkAuth(shouldRedirect = false) {
  const cookieStore = await cookies();
  const token = cookieStore.get('admin-token')?.value;

  const ADMIN_TOKEN = process.env.ADMIN_TOKEN || 'admin';

  // Security: In production, we should NOT allow 'admin' as fallback
  if (process.env.NODE_ENV === 'production' && ADMIN_TOKEN === 'admin') {
    if (shouldRedirect) redirect('/admin/login');
    return false;
  }

  const isAuthenticated = token === ADMIN_TOKEN;

  if (!isAuthenticated && shouldRedirect) {
    redirect('/admin/login');
  }

  return isAuthenticated;
}
