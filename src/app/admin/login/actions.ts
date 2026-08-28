'use server';

import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { getAdminToken } from '@/lib/auth';

export interface LoginState {
  error?: string;
}

export async function loginAction(
  _prevState: unknown,
  formData: FormData
): Promise<LoginState> {
  const password = formData.get('password');
  const expectedToken = getAdminToken();

  if (!expectedToken) {
    return { error: 'Server authentication (ADMIN_TOKEN) is not configured.' };
  }

  if (typeof password !== 'string' || password !== expectedToken) {
    return { error: 'Invalid admin credentials.' };
  }

  const cookieStore = await cookies();
  cookieStore.set('admin-token', expectedToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    maxAge: 86400, // 24 hours
    path: '/',
    sameSite: 'lax',
  });

  redirect('/admin/tasks');
}
