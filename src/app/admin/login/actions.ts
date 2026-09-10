'use server';

import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { getAdminToken } from '@/lib/auth';

export type LoginState = {
  error?: string;
};

export async function loginAction(
  _prevState: unknown,
  formData: FormData
): Promise<LoginState> {
  const password = formData.get('password') as string;
  const adminToken = getAdminToken();

  if (!adminToken) {
    return { error: 'Server configuration error: ADMIN_TOKEN is missing.' };
  }

  if (!password || password !== adminToken) {
    return { error: 'Invalid admin credentials. Please try again.' };
  }

  const cookieStore = await cookies();
  cookieStore.set('admin-token', adminToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    maxAge: 86400, // 24 hours
    path: '/',
    sameSite: 'lax',
  });

  redirect('/admin/tasks');
}
