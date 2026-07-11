'use server';

import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';

export async function login(prevState: unknown, formData: FormData) {
  const token = formData.get('token');

  if (token === process.env.ADMIN_TOKEN) {
    const cookieStore = await cookies();
    cookieStore.set('admin-token', token as string, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24, // 24 hours
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
