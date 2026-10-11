'use server';

import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { ADMIN_COOKIE_NAME } from '@/lib/auth';

export async function loginAdminAction(prevState: unknown, formData: FormData): Promise<{ error?: string }> {
  const password = formData.get('password') as string;
  const adminToken = process.env.ADMIN_TOKEN || 'admin-secret-token';

  if (!password || password !== adminToken) {
    return { error: 'Invalid password. Access denied.' };
  }

  const cookieStore = await cookies();
  cookieStore.set(ADMIN_COOKIE_NAME, adminToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 86400, // 24 hours
    path: '/',
  });

  redirect('/admin/tasks');
}
