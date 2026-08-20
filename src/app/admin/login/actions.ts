'use server';

import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';

export async function loginAction(prevState: unknown, formData: FormData): Promise<{ error?: string }> {
  const password = formData.get('password') as string;
  const adminTokenSecret = process.env.ADMIN_TOKEN;

  if (!adminTokenSecret) {
    return { error: 'Server authentication configuration error (ADMIN_TOKEN not set)' };
  }

  if (password !== adminTokenSecret) {
    return { error: 'Invalid admin credentials' };
  }

  const cookieStore = await cookies();
  cookieStore.set('admin-token', adminTokenSecret, {
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
