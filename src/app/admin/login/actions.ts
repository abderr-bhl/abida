'use server';

import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { ADMIN_COOKIE_NAME } from '@/lib/auth';

export async function loginAction(_prevState: unknown, formData: FormData): Promise<{ error?: string }> {
  const token = formData.get('token') as string;
  const adminToken = process.env.ADMIN_TOKEN || 'admin-secret-key';

  if (!token || token !== adminToken) {
    return { error: 'Invalid admin token.' };
  }

  const cookieStore = await cookies();
  cookieStore.set(ADMIN_COOKIE_NAME, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    maxAge: 86400, // 24 hours
    path: '/',
  });

  redirect('/admin/tasks');
}
