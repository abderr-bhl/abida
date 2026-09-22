'use server';

import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';

export interface LoginState {
  error?: string;
  success?: boolean;
}

export async function loginAction(
  _prevState: unknown,
  formData: FormData
): Promise<LoginState> {
  const password = formData.get('password') as string;
  const adminToken = process.env.ADMIN_TOKEN;

  if (!adminToken) {
    return { error: 'Server configuration error: ADMIN_TOKEN is missing.' };
  }

  if (!password || password !== adminToken) {
    return { error: 'Invalid admin credentials.' };
  }

  const cookieStore = await cookies();
  cookieStore.set('admin-token', adminToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 86400, // 24 hours
    path: '/',
  });

  redirect('/admin/tasks');
}
