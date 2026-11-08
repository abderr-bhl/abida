import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { NextRequest } from 'next/server';

export const ADMIN_COOKIE_NAME = 'admin-token';

export async function isAuthenticated(): Promise<boolean> {
  const cookieStore = await cookies();
  const token = cookieStore.get(ADMIN_COOKIE_NAME)?.value;
  const configuredToken = process.env.ADMIN_TOKEN;

  if (!configuredToken) {
    return false;
  }
  return token === configuredToken;
}

export async function requireAuth(): Promise<void> {
  const authenticated = await isAuthenticated();
  if (!authenticated) {
    redirect('/admin/login');
  }
}

export function validateCronRequest(req: NextRequest): boolean {
  const cronSecret = process.env.CRON_SECRET;
  if (!cronSecret) {
    return false;
  }

  // Check Authorization Bearer header
  const authHeader = req.headers.get('authorization');
  if (authHeader && authHeader.startsWith('Bearer ')) {
    const bearerToken = authHeader.substring(7).trim();
    if (bearerToken === cronSecret) return true;
  }

  // Check query param ?token=...
  const { searchParams } = new URL(req.url);
  const queryToken = searchParams.get('token');
  if (queryToken && queryToken === cronSecret) {
    return true;
  }

  return false;
}
