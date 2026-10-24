import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';

export async function getAdminToken(): Promise<string | undefined> {
  const cookieStore = await cookies();
  return cookieStore.get('admin-token')?.value;
}

export async function isAuthenticated(): Promise<boolean> {
  const token = await getAdminToken();
  const expectedToken = process.env.ADMIN_TOKEN;
  if (!expectedToken || !token) {
    return false;
  }
  return token === expectedToken;
}

export async function requireAuth(): Promise<void> {
  const authenticated = await isAuthenticated();
  if (!authenticated) {
    redirect('/admin/login');
  }
}
