'use server';

import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';

export async function login(_prevState: unknown, formData: FormData) {
  const password = formData.get('password') as string;
  const adminToken = process.env.ADMIN_TOKEN;

  if (password === adminToken) {
    const cookieStore = await cookies();
    cookieStore.set('admin-token', password, {
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
