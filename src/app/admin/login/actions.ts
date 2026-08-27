'use server';

import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';

export async function loginAdmin(prevState: unknown, formData: FormData): Promise<{ error?: string }> {
  const token = formData.get('token')?.toString().trim();
  const adminTokenEnv = process.env.ADMIN_TOKEN;

  if (!adminTokenEnv) {
    return { error: 'ADMIN_TOKEN is not configured on the server.' };
  }

  if (token !== adminTokenEnv) {
    return { error: 'Invalid secret token.' };
  }

  const cookieStore = await cookies();
  cookieStore.set('admin-token', token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 86400,
    path: '/',
  });

  redirect('/admin/tasks');
}
