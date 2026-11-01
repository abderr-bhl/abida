'use server';

import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';

export async function loginAdmin(prevState: unknown, formData: FormData): Promise<{ error?: string }> {
  const token = formData.get('token') as string;
  const expectedToken = process.env.ADMIN_TOKEN;

  if (!expectedToken) {
    return { error: 'Server misconfiguration: ADMIN_TOKEN is not set.' };
  }

  if (!token || token.trim() !== expectedToken) {
    return { error: 'Invalid admin security token.' };
  }

  const cookieStore = await cookies();
  cookieStore.set('admin-token', token.trim(), {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 60 * 60 * 24, // 24 hours
    path: '/',
  });

  redirect('/admin/tasks');
}

export async function logoutAdmin(): Promise<void> {
  const cookieStore = await cookies();
  cookieStore.delete('admin-token');
  redirect('/admin/login');
}
