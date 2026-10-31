'use client';

import { useActionState } from 'react';
import { loginAction } from './actions';

export default function AdminLoginPage() {
  const [state, formAction, isPending] = useActionState(loginAction, null);

  return (
    <div className="min-h-[70vh] flex items-center justify-center px-4 py-12 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8 bg-white dark:bg-gray-800 p-8 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700">
        <div>
          <span className="inline-block px-3 py-1 bg-blue-100 text-primary dark:bg-blue-900/40 text-xs font-semibold rounded-full uppercase tracking-wider mb-2">
            Internal Operations
          </span>
          <h2 className="text-3xl font-extrabold text-gray-900 dark:text-white">
            Admin Dashboard Login
          </h2>
          <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
            Enter your admin security token to access competitor benchmarking and automated task management.
          </p>
        </div>

        {state?.error && (
          <div className="p-3 bg-red-50 border border-red-200 text-red-700 rounded-md text-sm">
            {state.error}
          </div>
        )}

        <form action={formAction} className="mt-8 space-y-6">
          <div>
            <label htmlFor="token" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
              Admin Security Token
            </label>
            <input
              id="token"
              name="token"
              type="password"
              required
              placeholder="••••••••••••••••"
              className="mt-1 block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-primary focus:border-primary sm:text-sm dark:bg-gray-700 dark:text-white"
            />
          </div>

          <div>
            <button
              type="submit"
              disabled={isPending}
              className="w-full flex justify-center py-2.5 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary disabled:opacity-50 transition-colors"
            >
              {isPending ? 'Verifying...' : 'Sign In to Dashboard'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
