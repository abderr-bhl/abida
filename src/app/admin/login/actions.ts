'use server';

import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';

export async function loginAction(formData: FormData) {
  const password = formData.get('password');
  const ADMIN_TOKEN = process.env.ADMIN_TOKEN || 'admin';

  if (password === ADMIN_TOKEN) {
    const cookieStore = await cookies();
    cookieStore.set('admin-token', ADMIN_TOKEN, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 7, // 1 week
    });
    redirect('/admin/tasks');
  } else {
    return { error: 'Invalid password' };
  }
}

export async function logoutAction() {
  const cookieStore = await cookies();
  cookieStore.delete('admin-token');
  redirect('/admin/login');
}
