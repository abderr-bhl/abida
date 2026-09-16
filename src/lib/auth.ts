import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';

export async function checkAuth(): Promise<boolean> {
  const cookieStore = await cookies();
  const token = cookieStore.get('admin-token')?.value;
  const adminToken = process.env.ADMIN_TOKEN;

  if (!adminToken || !token) return false;
  return token === adminToken;
}

export async function requireAuth(): Promise<void> {
  const authenticated = await checkAuth();
  if (!authenticated) {
    redirect('/admin/login');
  }
}

export function verifyToken(token: string): boolean {
  const adminToken = process.env.ADMIN_TOKEN;
  if (!adminToken || !token) return false;
  return token === adminToken;
}
