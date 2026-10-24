'use server';

import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';

export interface LoginResult {
  error?: string;
  success?: boolean;
}

export async function loginAction(prevState: unknown, formData: FormData): Promise<LoginResult> {
  const token = formData.get('token')?.toString().trim();
  const expectedToken = process.env.ADMIN_TOKEN;

  if (!expectedToken) {
    return { error: 'Server authentication is not configured properly (ADMIN_TOKEN missing).' };
  }

  if (!token || token !== expectedToken) {
    return { error: 'Invalid admin token.' };
  }

  const cookieStore = await cookies();
  cookieStore.set('admin-token', token, {
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
