import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';

const ADMIN_TOKEN_KEY = 'admin-token';

export async function isAuthenticated(): Promise<boolean> {
  const cookieStore = await cookies();
  const token = cookieStore.get(ADMIN_TOKEN_KEY)?.value;
  const expectedToken = process.env.ADMIN_TOKEN;

  if (!expectedToken) {
    // If no ADMIN_TOKEN is set in environment, allow authenticated access for local dev
    return token === 'authenticated';
  }

  return token === expectedToken;
}

export async function requireAuth(): Promise<void> {
  const authed = await isAuthenticated();
  if (!authed) {
    redirect('/admin/login');
  }
}
