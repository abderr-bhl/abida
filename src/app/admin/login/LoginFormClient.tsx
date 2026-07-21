'use client';

import React, { useActionState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { loginAction } from './actions';

const initialState = {
  success: false,
  error: null as string | null,
};

export default function LoginFormClient() {
  const router = useRouter();
  const [state, formAction, isPending] = useActionState(loginAction, initialState);

  useEffect(() => {
    if (state.success) {
      router.push('/admin/tasks');
      router.refresh();
    }
  }, [state.success, router]);

  return (
    <form action={formAction} className="mt-8 space-y-6">
      <div className="rounded-md shadow-sm -space-y-px">
        <div>
          <label htmlFor="password" className="sr-only">
            Administrator Password
          </label>
          <input
            id="password"
            name="password"
            type="password"
            required
            className="appearance-none rounded-md relative block w-full px-3 py-3 border border-gray-300 dark:border-gray-700 placeholder-gray-500 dark:placeholder-gray-400 text-gray-900 dark:text-white bg-white dark:bg-gray-800 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:border-transparent text-sm sm:text-base"
            placeholder="Enter Administrator Password"
          />
        </div>
      </div>

      {state.error && (
        <div className="bg-red-50 dark:bg-red-950/50 text-red-700 dark:text-red-400 p-3 rounded-lg text-sm font-medium border border-red-100 dark:border-red-900/50">
          {state.error}
        </div>
      )}

      <div>
        <button
          type="submit"
          disabled={isPending}
          className="group relative w-full flex justify-center py-3 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-primary hover:bg-blue-700 focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-primary disabled:opacity-50 transition-colors cursor-pointer"
        >
          {isPending ? 'Authenticating...' : 'Sign In'}
        </button>
      </div>
    </form>
  );
}
