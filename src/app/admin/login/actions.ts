'use server';

import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';

export async function login(prevState: unknown, formData: FormData) {
  const token = formData.get('token') as string;
  const ADMIN_TOKEN = process.env.ADMIN_TOKEN || 'dev-token';

  if (token === ADMIN_TOKEN) {
    const cookieStore = await cookies();
    cookieStore.set('admin-token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      maxAge: 86400, // 24 hours
      path: '/',
    });
    redirect('/admin/tasks');
  } else {
    return { error: 'Invalid token' };
  }
}

export async function logout() {
  const cookieStore = await cookies();
  cookieStore.delete('admin-token');
  redirect('/admin/login');
}
