'use server';

import { login } from '@/lib/auth';
import { redirect } from 'next/navigation';

export async function loginAction(_prevState: unknown, formData: FormData): Promise<{ error?: string }> {
  const token = formData.get('token') as string;
  if (!token) {
    return { error: 'Admin token is required.' };
  }

  const success = await login(token);
  if (!success) {
    return { error: 'Invalid admin token.' };
  }

  redirect('/admin/tasks');
}
