import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { NextRequest } from 'next/server';

export async function requireAuth(): Promise<string> {
  const cookieStore = await cookies();
  const token = cookieStore.get('admin-token')?.value;

  const expectedToken = process.env.ADMIN_TOKEN;

  if (!token || !expectedToken || token !== expectedToken) {
    redirect('/admin/login');
  }

  return token;
}

export async function verifyAuthCookie(): Promise<boolean> {
  const cookieStore = await cookies();
  const token = cookieStore.get('admin-token')?.value;
  const expectedToken = process.env.ADMIN_TOKEN;

  return Boolean(token && expectedToken && token === expectedToken);
}

export function validateCronAuth(req: NextRequest): boolean {
  const expectedSecret = process.env.CRON_SECRET;
  if (!expectedSecret) {
    return false;
  }

  const authHeader = req.headers.get('authorization');
  if (authHeader && authHeader.startsWith('Bearer ')) {
    const bearerToken = authHeader.substring(7).trim();
    if (bearerToken === expectedSecret) {
      return true;
    }
  }

  const { searchParams } = new URL(req.url);
  const urlToken = searchParams.get('token');
  if (urlToken && urlToken === expectedSecret) {
    return true;
  }

  return false;
}
