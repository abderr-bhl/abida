'use server';

import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';

export async function login(prevState: unknown, formData: FormData) {
  const password = formData.get('password');

  if (password === (process.env.ADMIN_PASSWORD || 'admin123')) {
    const cookieStore = await cookies();
    cookieStore.set('admin-token', process.env.ADMIN_TOKEN || 'dev-admin-token', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24, // 24 hours
    });
    redirect('/admin/tasks');
  } else {
    return { error: 'Invalid password' };
  }
}

export async function logout() {
  const cookieStore = await cookies();
  cookieStore.delete('admin-token');
  redirect('/admin/login');
}
