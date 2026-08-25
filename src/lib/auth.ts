import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';

export async function checkAuth(): Promise<boolean> {
  const cookieStore = await cookies();
  const token = cookieStore.get('admin-token')?.value;
  const expectedToken = process.env.ADMIN_TOKEN;

  if (!token || !expectedToken) {
    return false;
  }

  return token === expectedToken;
}

export async function requireAuth(): Promise<void> {
  const authenticated = await checkAuth();
  if (!authenticated) {
    redirect('/admin/login');
  }
}
