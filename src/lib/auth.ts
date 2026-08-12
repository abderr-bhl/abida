import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';

export async function getAdminToken(): Promise<string | undefined> {
  const cookieStore = await cookies();
  return cookieStore.get('admin-token')?.value;
}

export async function checkAuth(): Promise<boolean> {
  const token = await getAdminToken();
  const expectedToken = process.env.ADMIN_TOKEN;

  if (!expectedToken) {
    return false;
  }

  return token === expectedToken;
}

export async function requireAuth(): Promise<void> {
  const isAuthenticated = await checkAuth();
  if (!isAuthenticated) {
    redirect('/admin/login');
  }
}
