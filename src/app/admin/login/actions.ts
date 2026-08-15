'use server';

import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';

export async function loginAction(prevState: unknown, formData: FormData) {
  const password = formData.get('password') as string;
  const adminToken = process.env.ADMIN_TOKEN;

  if (!adminToken || password !== adminToken) {
    return { error: 'Invalid admin credentials' };
  }

  const cookieStore = await cookies();
  cookieStore.set('admin-token', adminToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    maxAge: 86400,
    path: '/'
  });

  redirect('/admin/tasks');
}
