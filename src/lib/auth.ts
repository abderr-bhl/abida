import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';

/**
 * Validates the admin cookie against the ADMIN_TOKEN environment variable.
 */
export async function checkAuth(): Promise<boolean> {
  const adminToken = process.env.ADMIN_TOKEN;
  if (!adminToken) {
    // If not configured, deny access
    return false;
  }
  const cookieStore = await cookies();
  const token = cookieStore.get('admin-token')?.value;
  return token === adminToken;
}

/**
 * Helper to require authentication. If unauthorized, redirects to the login page.
 */
export async function requireAuth(): Promise<void> {
  const isAuthenticated = await checkAuth();
  if (!isAuthenticated) {
    redirect('/admin/login');
  }
}
