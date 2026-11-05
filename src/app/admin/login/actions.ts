'use server';

import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { ADMIN_COOKIE_NAME } from '@/lib/auth';

export async function loginAction(
  _prevState: unknown,
  formData: FormData
): Promise<{ error?: string }> {
  const token = formData.get('token');
  const secret = process.env.ADMIN_TOKEN;

  if (!secret) {
    return { error: 'Server misconfiguration: ADMIN_TOKEN is not set.' };
  }

  if (typeof token !== 'string' || token.trim() !== secret) {
    return { error: 'Invalid admin authentication token.' };
  }

  const cookieStore = await cookies();
  cookieStore.set(ADMIN_COOKIE_NAME, token.trim(), {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 86400, // 24 hours
    path: '/',
  });

  redirect('/admin/tasks');
}

export async function logoutAction(): Promise<void> {
  const cookieStore = await cookies();
  cookieStore.delete(ADMIN_COOKIE_NAME);
  redirect('/admin/login');
}
