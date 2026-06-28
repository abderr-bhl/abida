'use server';

import { login } from '@/lib/auth';
import { redirect } from 'next/navigation';

export async function loginAction(formData: FormData) {
  const token = formData.get('token') as string;
  const success = await login(token);

  if (success) {
    redirect('/admin/tasks');
  } else {
    return { error: 'Invalid token' };
  }
}
