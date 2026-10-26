import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';

const COOKIE_NAME = 'admin-token';
const EXPIRATION_SECONDS = 86400; // 24 hours

export async function getAdminToken(): Promise<string | undefined> {
  const cookieStore = await cookies();
  return cookieStore.get(COOKIE_NAME)?.value;
}

export async function verifyAdminToken(token?: string): Promise<boolean> {
  const expectedToken = process.env.ADMIN_TOKEN;
  if (!expectedToken) {
    // If no ADMIN_TOKEN env var is set, default token check or security requirement
    return false;
  }
  const tokenToVerify = token ?? (await getAdminToken());
  return Boolean(tokenToVerify && tokenToVerify === expectedToken);
}

export async function requireAuth(): Promise<void> {
  const isAuthenticated = await verifyAdminToken();
  if (!isAuthenticated) {
    redirect('/admin/login');
  }
}

export async function setAdminCookie(token: string): Promise<void> {
  const cookieStore = await cookies();
  cookieStore.set(COOKIE_NAME, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: EXPIRATION_SECONDS,
    path: '/',
  });
}

export async function clearAdminCookie(): Promise<void> {
  const cookieStore = await cookies();
  cookieStore.delete(COOKIE_NAME);
}
