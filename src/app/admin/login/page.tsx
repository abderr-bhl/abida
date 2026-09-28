'use client';

import { useActionState } from 'react';
import { loginAdmin } from './actions';

export default function AdminLoginPage() {
  const [state, formAction, isPending] = useActionState(loginAdmin, null);

  return (
    <div className="min-h-[70vh] flex items-center justify-center px-4 sm:px-6 lg:px-8 py-12">
      <div className="max-w-md w-full space-y-8 bg-white dark:bg-gray-800 p-8 rounded-xl shadow-md border border-gray-200 dark:border-gray-700">
        <div>
          <h2 className="mt-2 text-center text-3xl font-extrabold text-gray-900 dark:text-white">
            Admin Portal
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600 dark:text-gray-400">
            Enter your secret admin token to manage automated tasks.
          </p>
        </div>
        <form className="mt-8 space-y-6" action={formAction}>
          {state?.error && (
            <div className="rounded-md bg-red-50 p-4 border border-red-200 text-sm text-red-700 dark:bg-red-900/30 dark:border-red-800 dark:text-red-300">
              {state.error}
            </div>
          )}
          <div>
            <label htmlFor="token" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
              Admin Secret Token
            </label>
            <input
              id="token"
              name="token"
              type="password"
              required
              placeholder="Enter ADMIN_TOKEN"
              className="mt-1 block w-full px-4 py-3 border border-gray-300 rounded-lg shadow-xs placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary dark:bg-gray-700 dark:border-gray-600 dark:text-white"
            />
          </div>
          <div>
            <button
              type="submit"
              disabled={isPending}
              className="w-full flex justify-center py-3 px-4 border border-transparent rounded-lg shadow-xs text-sm font-medium text-white bg-primary hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary disabled:opacity-50"
            >
              {isPending ? 'Authenticating...' : 'Sign In'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
