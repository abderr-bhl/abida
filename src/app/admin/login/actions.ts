'use server';

import { cookies } from 'next/headers';

export async function loginAction(prevState: unknown, formData: FormData): Promise<{ error?: string; success?: boolean }> {
  const tokenInput = formData.get('token')?.toString().trim();
  const adminToken = process.env.ADMIN_TOKEN;

  if (!adminToken) {
    return { error: 'Server authentication configuration error.' };
  }

  if (tokenInput !== adminToken) {
    return { error: 'Invalid admin credentials token.' };
  }

  const cookieStore = await cookies();
  cookieStore.set('admin-token', adminToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 86400, // 24 hours
    path: '/',
  });

  return { success: true };
}
