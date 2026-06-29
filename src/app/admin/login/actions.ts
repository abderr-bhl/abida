'use server';

import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';

export async function login(formData: FormData) {
  const token = formData.get('token') as string;
  const adminToken = process.env.ADMIN_TOKEN;

  if (!adminToken) {
    return { error: 'Server configuration error: ADMIN_TOKEN not set.' };
  }

  if (token === adminToken) {
    const cookieStore = await cookies();
    cookieStore.set('admin-token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 7, // 1 week
    });
    redirect('/admin/tasks');
  }

  return { error: 'Invalid admin token' };
}
