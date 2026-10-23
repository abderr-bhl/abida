'use server';

import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';

export async function loginAction(prevState: unknown, formData: FormData): Promise<{ error?: string }> {
  const password = formData.get('password') as string;
  const adminTokenEnv = process.env.ADMIN_TOKEN || 'admin-secret-token-123';

  if (!password || password !== adminTokenEnv) {
    return { error: 'Invalid admin token credentials.' };
  }

  const cookieStore = await cookies();
  cookieStore.set('admin-token', password, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 86400, // 24 hours
    path: '/'
  });

  redirect('/admin/tasks');
}
