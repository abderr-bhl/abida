import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';

export async function isAuthenticated(): Promise<boolean> {
  const cookieStore = await cookies();
  const token = cookieStore.get('admin-token')?.value;
  const adminToken = process.env.ADMIN_TOKEN || 'admin-secret';
  return token === adminToken;
}

export async function requireAuth() {
  const authed = await isAuthenticated();
  if (!authed) {
    redirect('/admin/login');
  }
}
