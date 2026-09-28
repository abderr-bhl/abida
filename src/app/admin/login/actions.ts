'use server';

import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';

export async function loginAdmin(
  prevState: unknown,
  formData: FormData
): Promise<{ error?: string }> {
  const tokenInput = formData.get('token')?.toString().trim();
  const expectedToken = process.env.ADMIN_TOKEN;

  if (!expectedToken) {
    return { error: 'Server configuration error: ADMIN_TOKEN is not set.' };
  }

  if (!tokenInput || tokenInput !== expectedToken) {
    return { error: 'Invalid admin token.' };
  }

  const cookieStore = await cookies();
  cookieStore.set('admin-token', expectedToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
    maxAge: 86400, // 24 hours
  });

  redirect('/admin/tasks');
}
