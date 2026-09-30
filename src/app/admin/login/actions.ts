'use server';

import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { ADMIN_COOKIE_NAME, getAdminToken } from '@/lib/auth';

export async function loginAction(
  prevState: unknown,
  formData: FormData
): Promise<{ error?: string }> {
  const password = formData.get('password')?.toString();
  const validToken = getAdminToken();

  if (!password || password !== validToken) {
    return { error: 'Invalid admin credentials.' };
  }

  const cookieStore = await cookies();
  cookieStore.set(ADMIN_COOKIE_NAME, validToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 86400, // 24 hours
    path: '/',
  });

  redirect('/admin/tasks');
}
