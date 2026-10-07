'use server';

import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { ADMIN_COOKIE_NAME } from '@/lib/auth';

export async function loginAction(prevState: unknown, formData: FormData) {
  const token = formData.get('token')?.toString().trim();
  const expectedToken = process.env.ADMIN_TOKEN;

  if (!expectedToken) {
    return { error: 'Server configuration error: ADMIN_TOKEN environment variable is missing.' };
  }

  if (token !== expectedToken) {
    return { error: 'Invalid admin secret token. Please check your token and try again.' };
  }

  const cookieStore = await cookies();
  cookieStore.set(ADMIN_COOKIE_NAME, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    maxAge: 86400, // 24 hours
    path: '/',
    sameSite: 'lax',
  });

  redirect('/admin/tasks');
}
