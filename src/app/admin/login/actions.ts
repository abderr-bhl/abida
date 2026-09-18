'use server';

import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';

export async function loginAction(prevState: { error?: string } | undefined, formData: FormData) {
  const password = formData.get('password') as string;
  const adminToken = process.env.ADMIN_TOKEN;

  if (!adminToken) {
    return { error: 'Server authentication configuration missing' };
  }

  if (password === adminToken) {
    const cookieStore = await cookies();
    cookieStore.set('admin-token', adminToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: 86400, // 24 hours
    });
    redirect('/admin/tasks');
  }

  return { error: 'Invalid admin credentials' };
}
