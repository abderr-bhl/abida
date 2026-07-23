'use server';

import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';

export interface LoginState {
  error?: string;
  success?: boolean;
}

export async function loginAction(prevState: unknown, formData: FormData): Promise<LoginState> {
  const password = formData.get('password') as string;
  const adminTokenEnv = process.env.ADMIN_TOKEN;

  if (!adminTokenEnv) {
    return { error: 'Server authentication is not configured.' };
  }

  if (password !== adminTokenEnv) {
    return { error: 'Invalid admin credentials.' };
  }

  const cookieStore = await cookies();
  cookieStore.set('admin-token', adminTokenEnv, {
    maxAge: 86400, // 24 hours
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/'
  });

  redirect('/admin/tasks');
}
