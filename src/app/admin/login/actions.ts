'use server';

import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { ADMIN_COOKIE_NAME } from '@/lib/auth';

export async function loginAction(
  _prevState: unknown,
  formData: FormData
): Promise<{ error?: string }> {
  const token = formData.get('token')?.toString().trim();
  const validToken = process.env.ADMIN_TOKEN || 'admin-secret-preview';

  if (!token) {
    return { error: 'Please enter the admin security token.' };
  }

  if (token !== validToken) {
    return { error: 'Invalid admin security token.' };
  }

  const cookieStore = await cookies();
  cookieStore.set(ADMIN_COOKIE_NAME, validToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 60 * 60 * 24, // 24 hours
    path: '/',
  });

  redirect('/admin/tasks');
}

export async function logoutAction(): Promise<void> {
  const cookieStore = await cookies();
  cookieStore.delete(ADMIN_COOKIE_NAME);
  redirect('/admin/login');
}
