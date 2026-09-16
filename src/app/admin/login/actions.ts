'use server';

import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';

export async function loginAction(
  prevState: { error?: string } | undefined,
  formData: FormData
): Promise<{ error?: string }> {
  const tokenInput = formData.get('token')?.toString();
  const adminToken = process.env.ADMIN_TOKEN;

  if (!tokenInput || !adminToken || tokenInput !== adminToken) {
    return { error: 'Invalid admin token' };
  }

  const cookieStore = await cookies();
  cookieStore.set('admin-token', tokenInput, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    maxAge: 86400, // 24 hours
    path: '/',
  });

  redirect('/admin/tasks');
}
