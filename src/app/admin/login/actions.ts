'use server';

import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';

export interface LoginState {
  error?: string;
  success?: boolean;
}

export async function loginAction(prevState: unknown, formData: FormData): Promise<LoginState> {
  const password = formData.get('password') as string;
  const adminToken = process.env.ADMIN_TOKEN;

  if (!adminToken) {
    return { error: 'Admin access is not configured on the server.' };
  }

  if (password === adminToken) {
    const cookieStore = await cookies();
    cookieStore.set('admin-token', adminToken, {
      path: '/',
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 86400, // 24 hours in seconds
    });

    redirect('/admin/tasks');
  } else {
    return { error: 'Invalid admin credentials.' };
  }
}
