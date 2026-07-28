import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';

/**
 * Validates the 'admin-token' cookie against the ADMIN_TOKEN environment variable.
 * Explicitly awaits the cookies() call as required by Next.js 16.2.6.
 */
export async function checkAuth(): Promise<boolean> {
  const adminToken = process.env.ADMIN_TOKEN;
  if (!adminToken) {
    console.error('ADMIN_TOKEN is not configured in environment variables');
    return false;
  }

  const cookieStore = await cookies();
  const token = cookieStore.get('admin-token')?.value;

  return token === adminToken;
}

/**
 * Helper to enforce authentication in server components.
 * Redirects to /admin/login if unauthorized.
 */
export async function requireAuth(): Promise<void> {
  const isAuthenticated = await checkAuth();
  if (!isAuthenticated) {
    redirect('/admin/login');
  }
}
