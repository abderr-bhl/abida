'use server';

import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { ADMIN_COOKIE_NAME } from '@/lib/auth';

export interface LoginState {
  error?: string;
  success?: boolean;
}

export async function loginAction(
  prevState: unknown,
  formData: FormData
): Promise<LoginState> {
  const token = formData.get('token') as string;
  const expectedToken = process.env.ADMIN_TOKEN;

  if (!expectedToken) {
    return { error: 'ADMIN_TOKEN is not configured in server environment.' };
  }

  if (!token || token.trim() !== expectedToken) {
    return { error: 'Invalid secret administrative access token.' };
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
