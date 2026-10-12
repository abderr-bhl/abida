import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';

export async function requireAuth(): Promise<string> {
  const cookieStore = await cookies();
  const token = cookieStore.get('admin-token')?.value;

  const validToken = process.env.ADMIN_TOKEN;

  if (!validToken || token !== validToken) {
    redirect('/admin/login');
  }

  return token;
}

export async function isAuthenticated(): Promise<boolean> {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get('admin-token')?.value;
    const validToken = process.env.ADMIN_TOKEN;
    return Boolean(validToken && token === validToken);
  } catch {
    return false;
  }
}
