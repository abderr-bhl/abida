'use server';

import { cookies } from 'next/headers';

export async function loginAction(
  prevState: unknown,
  formData: FormData
): Promise<{ success: boolean; error?: string }> {
  const password = formData.get('password')?.toString();
  const expectedToken = process.env.ADMIN_TOKEN;

  if (!expectedToken) {
    return { success: false, error: 'Server authentication configuration error.' };
  }

  if (!password || password !== expectedToken) {
    return { success: false, error: 'Invalid admin credentials provided.' };
  }

  const cookieStore = await cookies();
  cookieStore.set('admin-token', expectedToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    maxAge: 86400, // 24 hours
    path: '/',
    sameSite: 'lax',
  });

  return { success: true };
}
