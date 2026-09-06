import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';

export async function getAdminTokenFromCookie(): Promise<string | undefined> {
  const cookieStore = await cookies();
  return cookieStore.get('admin-token')?.value;
}

export async function isAuthenticated(): Promise<boolean> {
  const token = await getAdminTokenFromCookie();
  const expectedToken = process.env.ADMIN_TOKEN;
  if (!expectedToken || !token) {
    return false;
  }
  return token === expectedToken;
}

export async function requireAuth(): Promise<void> {
  const authed = await isAuthenticated();
  if (!authed) {
    redirect('/admin/login');
  }
}
