import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';

export async function verifyAuthToken(token: string | undefined): Promise<boolean> {
  const expectedToken = process.env.ADMIN_TOKEN;
  if (!expectedToken || !token) return false;
  return token === expectedToken;
}

export async function requireAuth(): Promise<void> {
  const cookieStore = await cookies();
  const token = cookieStore.get('admin-token')?.value;

  const isValid = await verifyAuthToken(token);
  if (!isValid) {
    redirect('/admin/login');
  }
}
