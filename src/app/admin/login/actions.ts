'use server';

import { cookies } from 'next/headers';

export async function loginAction(prevState: unknown, formData: FormData): Promise<{ error?: string; success?: boolean }> {
  const token = formData.get('token') as string;
  const adminToken = process.env.ADMIN_TOKEN;

  if (!adminToken) {
    return { error: 'ADMIN_TOKEN environment variable is not configured' };
  }

  if (token === adminToken) {
    const cookieStore = await cookies();
    cookieStore.set('admin-token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: 86400
    });
    return { success: true };
  }

  return { error: 'Invalid admin token' };
}
