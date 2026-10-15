'use server';

import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';

export async function loginAction(prevState: unknown, formData: FormData): Promise<{ error?: string }> {
  const tokenInput = formData.get('token')?.toString();
  const adminToken = process.env.ADMIN_TOKEN;

  if (!adminToken || tokenInput !== adminToken) {
    return { error: 'Invalid admin token' };
  }

  const cookieStore = await cookies();
  cookieStore.set('admin-token', tokenInput, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 86400,
    path: '/',
  });

  redirect('/admin/tasks');
}

export async function logoutAction(): Promise<void> {
  const cookieStore = await cookies();
  cookieStore.delete('admin-token');
  redirect('/admin/login');
}
