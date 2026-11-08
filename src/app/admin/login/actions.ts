'use server';

import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { ADMIN_COOKIE_NAME } from '@/lib/auth';

export async function loginAction(_prevState: unknown, formData: FormData): Promise<{ error?: string }> {
  const token = formData.get('token')?.toString().trim();
  const configuredToken = process.env.ADMIN_TOKEN;

  if (!configuredToken) {
    return { error: 'Admin access is not configured on this server.' };
  }

  if (token !== configuredToken) {
    return { error: 'Invalid admin credentials or token.' };
  }

  const cookieStore = await cookies();
  cookieStore.set(ADMIN_COOKIE_NAME, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 60 * 60 * 24, // 24 hours
    path: '/',
  });

  redirect('/admin/tasks');
}
