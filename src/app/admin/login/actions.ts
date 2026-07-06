'use server';

import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';

const ADMIN_TOKEN = process.env.ADMIN_TOKEN || 'dev-secret';

export async function login(prevState: any, formData: FormData) {
  const token = formData.get('token') as string;

  if (token === ADMIN_TOKEN) {
    const cookieStore = await cookies();
    cookieStore.set('admin-token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24, // 24 hours
    });
    redirect('/admin/tasks');
  }

  return { error: 'Invalid token' };
}

export async function logout() {
  const cookieStore = await cookies();
  cookieStore.delete('admin-token');
  redirect('/admin/login');
}
