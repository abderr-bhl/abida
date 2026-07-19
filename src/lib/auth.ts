import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';

export async function checkAuth(): Promise<boolean> {
  const cookieStore = await cookies();
  const token = cookieStore.get('admin-token')?.value;
  const adminToken = process.env.ADMIN_TOKEN;

  // If ADMIN_TOKEN env is not set on the server, we require authentication to fail for security
  if (!adminToken) {
    return false;
  }

  return token === adminToken;
}

export async function requireAuth() {
  const isAuthenticated = await checkAuth();
  if (!isAuthenticated) {
    redirect('/admin/login');
  }
}
