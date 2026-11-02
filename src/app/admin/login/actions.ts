'use server';

import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { ADMIN_COOKIE_NAME } from '@/lib/auth';

export interface LoginState {
  error?: string;
  success?: boolean;
}

export async function loginAction(_prevState: unknown, formData: FormData): Promise<LoginState> {
  const token = formData.get('token');
  const adminSecret = process.env.ADMIN_TOKEN;

  if (typeof token !== 'string' || !token) {
    return { error: 'Please enter your Admin Token.' };
  }

  if (!adminSecret) {
    return { error: 'ADMIN_TOKEN is not configured on the server.' };
  }

  if (token !== adminSecret) {
    return { error: 'Invalid admin credentials. Please try again.' };
  }

  const cookieStore = await cookies();
  cookieStore.set(ADMIN_COOKIE_NAME, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 86400, // 24 hours
    path: '/'
  });

  redirect('/admin/tasks');
}
