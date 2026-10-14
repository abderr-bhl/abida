'use server';

import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';

export interface LoginState {
  error?: string;
  success?: boolean;
}

export async function loginAction(prevState: unknown, formData: FormData): Promise<LoginState> {
  const password = formData.get('password') as string;
  const adminToken = process.env.ADMIN_TOKEN;

  if (!adminToken) {
    return { error: 'ADMIN_TOKEN environment variable is not configured on server.' };
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

export async function logoutAction(): Promise<void> {
  const cookieStore = await cookies();
  cookieStore.delete('admin-token');
  redirect('/admin/login');
}
