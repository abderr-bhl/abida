'use server';

import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';

export async function loginAction(prevState: unknown, formData: FormData) {
  const password = formData.get('password') as string;
  const adminToken = process.env.ADMIN_TOKEN;

  if (!adminToken) {
    return { success: false, error: 'Server configuration error: ADMIN_TOKEN is not configured on the server.' };
  }

  if (password === adminToken) {
    const cookieStore = await cookies();
    cookieStore.set('admin-token', adminToken, {
      maxAge: 86400, // 24 hours
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/'
    });
  } else {
    return { success: false, error: 'Invalid admin credentials.' };
  }

  redirect('/admin/tasks');
}
