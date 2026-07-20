'use server';

import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';

export async function loginAction(prevState: unknown, formData: FormData): Promise<{ success: boolean; error?: string }> {
  const password = formData.get('password') as string;
  const adminToken = process.env.ADMIN_TOKEN;

  if (!adminToken) {
    return { success: false, error: 'Admin configuration error. ADMIN_TOKEN is not configured.' };
  }

  if (password !== adminToken) {
    return { success: false, error: 'Incorrect password' };
  }

  const cookieStore = await cookies();
  cookieStore.set('admin-token', adminToken, {
    maxAge: 86400, // 24 hours
    path: '/',
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
  });

  redirect('/admin/tasks');
}
