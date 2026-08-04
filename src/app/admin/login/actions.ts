'use server';

import { cookies } from 'next/headers';

export async function loginAction(prevState: unknown, formData: FormData): Promise<{ success: boolean; error?: string }> {
  try {
    const password = formData.get('password') as string;
    const adminToken = process.env.ADMIN_TOKEN;

    if (!adminToken) {
      return { success: false, error: 'ADMIN_TOKEN environment variable is not configured' };
    }

    if (password !== adminToken) {
      return { success: false, error: 'Invalid password' };
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
  } catch (err) {
    return { success: false, error: err instanceof Error ? err.message : 'An error occurred during login' };
  }
}

export async function logoutAction(): Promise<void> {
  const cookieStore = await cookies();
  cookieStore.delete('admin-token');
}
