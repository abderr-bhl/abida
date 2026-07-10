'use server';

import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';

const ADMIN_TOKEN = process.env.ADMIN_TOKEN;

export async function login(prevState: unknown, formData: FormData) {
  const password = formData.get('password');

  if (password === ADMIN_TOKEN) {
    const cookieStore = await cookies();
    cookieStore.set('admin-token', ADMIN_TOKEN, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24, // 24 hours
      path: '/',
    });

    redirect('/admin/tasks');
  }

  return { error: 'Invalid credentials' };
}

export async function logout() {
  const cookieStore = await cookies();
  cookieStore.delete('admin-token');
  redirect('/admin/login');
}
