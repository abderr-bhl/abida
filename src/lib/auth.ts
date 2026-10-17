import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';

export async function getAdminToken(): Promise<string | undefined> {
  const cookieStore = await cookies();
  return cookieStore.get('admin-token')?.value;
}

export async function verifyAuth(): Promise<boolean> {
  const token = await getAdminToken();
  const adminToken = process.env.ADMIN_TOKEN;
  if (!adminToken) {
    return false;
  }
  return token === adminToken;
}

export async function requireAuth(): Promise<void> {
  const isAuthenticated = await verifyAuth();
  if (!isAuthenticated) {
    redirect('/admin/login');
  }
}
