'use server';

import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';

export async function login(prevState: unknown, formData: FormData) {
  const password = formData.get('password');
  const ADMIN_TOKEN = process.env.ADMIN_TOKEN || 'dev-secret';

  if (password === ADMIN_TOKEN) {
    const cookieStore = await cookies();
    cookieStore.set('admin-token', ADMIN_TOKEN, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 86400, // 24 hours
    });
    return { success: true };
  }

  return { error: 'Invalid password' };
}

export async function logout() {
  const cookieStore = await cookies();
  cookieStore.delete('admin-token');
  redirect('/admin/login');
}
