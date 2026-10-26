'use server';

import { setAdminCookie } from '@/lib/auth';
import { redirect } from 'next/navigation';

export async function loginAdminAction(
  _prevState: unknown,
  formData: FormData
): Promise<{ error?: string }> {
  const token = formData.get('token')?.toString().trim();
  const expectedToken = process.env.ADMIN_TOKEN;

  if (!token) {
    return { error: 'Admin access token is required.' };
  }

  if (expectedToken && token !== expectedToken) {
    return { error: 'Invalid admin token.' };
  }

  await setAdminCookie(token);
  redirect('/admin/tasks');
}
