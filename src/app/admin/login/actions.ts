'use server';

import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';

export interface LoginActionState {
  error?: string;
  success?: boolean;
}

/**
 * Handles administrative authentication.
 * Follows the (prevState: unknown, formData: FormData) signature for useActionState in React 19/Next.js 16.2.6.
 */
export async function loginAction(
  _prevState: unknown,
  formData: FormData
): Promise<LoginActionState> {
  const tokenInput = formData.get('token') as string | null;
  const adminToken = process.env.ADMIN_TOKEN;

  if (!adminToken) {
    return { error: 'Server authentication is not configured.' };
  }

  if (!tokenInput) {
    return { error: 'Please enter the access token.' };
  }

  if (tokenInput !== adminToken) {
    return { error: 'Invalid access token.' };
  }

  // Set the admin-token cookie for 24 hours (86400 seconds)
  const cookieStore = await cookies();
  cookieStore.set('admin-token', tokenInput, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
    maxAge: 86400,
    path: '/',
  });

  // Redirect to admin dashboard
  redirect('/admin/tasks');
}
