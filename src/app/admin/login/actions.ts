'use server';

import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';

export async function loginAction(prevState: unknown, formData: FormData) {
  const tokenInput = formData.get('token') as string;
  const adminTokenEnv = process.env.ADMIN_TOKEN;

  if (!adminTokenEnv) {
    return { error: 'Admin configuration is missing on server.' };
  }

  if (tokenInput !== adminTokenEnv) {
    return { error: 'Invalid admin token.' };
  }

  const cookieStore = await cookies();
  cookieStore.set('admin-token', adminTokenEnv, {
    maxAge: 86400, // 24 hours
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
    path: '/',
  });

  redirect('/admin/tasks');
}
