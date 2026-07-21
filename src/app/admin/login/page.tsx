'use server';

import React from 'react';
import LoginFormClient from './LoginFormClient';
import { checkAuth } from '@/lib/auth';
import { redirect } from 'next/navigation';

export default async function LoginPage() {
  const isAuth = await checkAuth();
  if (isAuth) {
    redirect('/admin/tasks');
  }

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8 bg-white dark:bg-gray-900 p-8 rounded-xl shadow-lg border border-gray-100 dark:border-gray-800">
        <div className="text-center">
          <h1 className="text-3xl font-extrabold text-gray-900 dark:text-white">Admin Portal</h1>
          <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
            Sign in to access competitor benchmark intelligence
          </p>
        </div>
        <LoginFormClient />
      </div>
    </div>
  );
}
