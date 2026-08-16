'use server';

import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';

export async function loginAction(prevState: unknown, formData: FormData) {
  const token = formData.get('token')?.toString();
  const adminToken = process.env.ADMIN_TOKEN;

  if (!adminToken) {
    return { error: 'Server configuration error: ADMIN_TOKEN is not defined.' };
  }

  if (token === adminToken) {
    const cookieStore = await cookies();
    cookieStore.set('admin-token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: 86400,
    });
    redirect('/admin/tasks');
  }

  return { error: 'Invalid admin token.' };
}
