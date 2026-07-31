'use server';

import { cookies } from 'next/headers';

export async function loginAction(prevState: unknown, formData: FormData): Promise<{ error?: string; success?: boolean }> {
  const password = formData.get('password') as string;
  const adminToken = process.env.ADMIN_TOKEN;

  if (!adminToken) {
    return { error: 'Server authentication is not configured.' };
  }

  if (password !== adminToken) {
    return { error: 'Invalid password.' };
  }

  const cookieStore = await cookies();
  cookieStore.set('admin-token', adminToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
    maxAge: 86400, // 24 hours
    path: '/'
  });

  return { success: true };
}
