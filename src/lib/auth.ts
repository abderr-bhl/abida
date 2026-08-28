import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';

export function getAdminToken(): string | undefined {
  return process.env.ADMIN_TOKEN;
}

export function verifyAdminToken(token: string | undefined): boolean {
  const expectedToken = getAdminToken();
  if (!expectedToken || !token) {
    return false;
  }
  return token === expectedToken;
}

export async function requireAuth(): Promise<void> {
  const cookieStore = await cookies();
  const token = cookieStore.get('admin-token')?.value;

  if (!verifyAdminToken(token)) {
    redirect('/admin/login');
  }
}
