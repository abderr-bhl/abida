import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';

export function getAdminTokenEnv(): string {
  const token = process.env.ADMIN_TOKEN;
  if (!token) {
    throw new Error('ADMIN_TOKEN environment variable is not configured');
  }
  return token;
}

export async function isAuthenticated(): Promise<boolean> {
  try {
    const adminToken = getAdminTokenEnv();
    const cookieStore = await cookies();
    const tokenCookie = cookieStore.get('admin-token');
    return tokenCookie?.value === adminToken;
  } catch {
    return false;
  }
}

export async function requireAuth(): Promise<void> {
  const authenticated = await isAuthenticated();
  if (!authenticated) {
    redirect('/admin/login');
  }
}
