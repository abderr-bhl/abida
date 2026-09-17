'use server';

import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';

export interface LoginState {
  success: boolean;
  error: string | null;
}

export async function loginAction(
  prevState: unknown,
  formData: FormData
): Promise<LoginState> {
  const token = formData.get('token')?.toString().trim();
  const adminToken = process.env.ADMIN_TOKEN;

  if (!adminToken) {
    return {
      success: false,
      error: 'Server error: ADMIN_TOKEN environment variable is not configured',
    };
  }

  if (!token || token !== adminToken) {
    return {
      success: false,
      error: 'Invalid authentication token',
    };
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

export async function logoutAction(): Promise<void> {
  const cookieStore = await cookies();
  cookieStore.delete('admin-token');
  redirect('/admin/login');
}
