'use client';

import { useActionState } from 'react';
import { loginAction } from './actions';

export default function AdminLoginPage() {
  const [state, formAction, isPending] = useActionState(loginAction, {});

  return (
    <div className="min-h-[70vh] flex items-center justify-center px-4 sm:px-6 lg:px-8 py-12">
      <div className="max-w-md w-full space-y-8 bg-white dark:bg-gray-900 p-8 rounded-2xl shadow-lg border border-gray-200 dark:border-gray-800">
        <div>
          <span className="inline-block px-3 py-1 text-xs font-semibold uppercase tracking-wider text-primary bg-blue-50 dark:bg-blue-950/50 rounded-full mb-3">
            ReviewGuid Automation
          </span>
          <h2 className="text-3xl font-extrabold text-gray-900 dark:text-white">
            Admin Portal
          </h2>
          <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
            Sign in to access competitive intelligence tasks and run benchmarking actions.
          </p>
        </div>

        {state?.error && (
          <div className="p-4 rounded-lg bg-red-50 border border-red-200 text-red-700 text-sm dark:bg-red-950/50 dark:border-red-900 dark:text-red-300">
            {state.error}
          </div>
        )}

        <form action={formAction} className="mt-8 space-y-6">
          <div>
            <label
              htmlFor="token"
              className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
            >
              Admin Security Token
            </label>
            <input
              id="token"
              name="token"
              type="password"
              required
              autoComplete="current-password"
              placeholder="Enter your ADMIN_TOKEN"
              className="appearance-none block w-full px-4 py-3 border border-gray-300 rounded-lg placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary text-sm dark:bg-gray-800 dark:border-gray-700 dark:text-white"
            />
          </div>

          <div>
            <button
              type="submit"
              disabled={isPending}
              className="w-full flex justify-center py-3 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-primary hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary disabled:opacity-50 transition-colors"
            >
              {isPending ? 'Authenticating...' : 'Sign In to Dashboard'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
