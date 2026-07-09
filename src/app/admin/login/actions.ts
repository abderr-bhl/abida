'use server';

import { login } from '@/lib/auth';
import { redirect } from 'next/navigation';

export async function handleLogin(prevState: unknown, formData: FormData) {
  const token = formData.get('token') as string;

  if (!token) {
    return { error: 'Token is required' };
  }

  const success = await login(token);

  if (success) {
    redirect('/admin/tasks');
  } else {
    return { error: 'Invalid admin token' };
  }
}
