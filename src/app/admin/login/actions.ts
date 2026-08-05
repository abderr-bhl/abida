'use server';

import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';

export interface LoginState {
  error?: string;
  success?: boolean;
}

/**
 * Handles the administrator login Server Action.
 * Follows strict parameter signature (prevState: unknown, formData: FormData) for Next.js 16.2.6.
 */
export async function loginAction(
  prevState: unknown,
  formData: FormData
): Promise<LoginState> {
  const password = formData.get('password') as string;
  const expectedToken = process.env.ADMIN_TOKEN;

  if (!expectedToken) {
    return { error: 'Server authentication is not configured.' };
  }

  if (password !== expectedToken) {
    return { error: 'Invalid password.' };
  }

  // Set 'admin-token' cookie with 24 hours expiration (86400 seconds)
  const cookieStore = await cookies();
  cookieStore.set('admin-token', expectedToken, {
    maxAge: 86400,
    path: '/',
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
  });

  // Redirect to admin tasks page upon successful login
  redirect('/admin/tasks');
}
