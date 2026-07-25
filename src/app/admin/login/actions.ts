'use server';

import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';

export interface LoginState {
  success: boolean;
  error?: string;
}

export async function loginAction(prevState: unknown, formData: FormData): Promise<LoginState> {
  const token = formData.get('token') as string;
  const adminToken = process.env.ADMIN_TOKEN;

  if (!adminToken) {
    return { success: false, error: 'Server authentication misconfigured. ADMIN_TOKEN environment variable is not set.' };
  }

  if (token !== adminToken) {
    return { success: false, error: 'Invalid admin token.' };
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
