import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';

const AUTH_COOKIE_NAME = 'admin-token';

export async function checkAuth(): Promise<boolean> {
  const cookieStore = await cookies();
  const token = cookieStore.get(AUTH_COOKIE_NAME)?.value;
  const adminToken = process.env.ADMIN_TOKEN;

  if (!adminToken) {
    // If ADMIN_TOKEN is not configured in the environment, deny access
    return false;
  }

  return token === adminToken;
}

export async function requireAuth(): Promise<void> {
  const authenticated = await checkAuth();
  if (!authenticated) {
    redirect('/admin/login');
  }
}
