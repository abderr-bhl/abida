'use server';

import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';

export async function loginAdminAction(prevState: unknown, formData: FormData) {
  const password = formData.get('password') as string;
  const adminToken = process.env.ADMIN_TOKEN;

  if (!adminToken) {
    return { error: 'Server authentication is not configured.' };
  }

  if (password === adminToken) {
    const cookieStore = await cookies();
    cookieStore.set('admin-token', adminToken, {
      path: '/',
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 86400 // 24 hours
    });
  } else {
    return { error: 'Invalid administrator password.' };
  }

  redirect('/admin/tasks');
}
