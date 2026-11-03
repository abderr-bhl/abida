'use client';

import { useActionState } from 'react';
import { loginAction } from './actions';
import { Lock } from 'lucide-react';

export default function AdminLoginPage() {
  const [state, formAction, isPending] = useActionState(loginAction, undefined);

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8 bg-white dark:bg-gray-800 p-8 rounded-2xl shadow-xl border border-gray-100 dark:border-gray-700">
        <div className="text-center">
          <div className="mx-auto h-12 w-12 bg-blue-100 dark:bg-blue-900 text-primary dark:text-blue-300 rounded-full flex items-center justify-center mb-4">
            <Lock className="w-6 h-6" />
          </div>
          <h2 className="text-3xl font-extrabold text-gray-900 dark:text-white">
            Admin Access
          </h2>
          <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
            Sign in to manage competitor benchmarking and automated content tasks.
          </p>
        </div>

        <form action={formAction} className="mt-8 space-y-6">
          {state?.error && (
            <div className="rounded-md bg-red-50 p-4 border border-red-200">
              <p className="text-sm font-medium text-red-800">{state.error}</p>
            </div>
          )}

          <div>
            <label
              htmlFor="token"
              className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
            >
              Admin Security Token
            </label>
            <input
              id="token"
              name="token"
              type="password"
              required
              placeholder="Enter your ADMIN_TOKEN"
              className="appearance-none relative block w-full px-3 py-2.5 border border-gray-300 dark:border-gray-600 rounded-md placeholder-gray-400 focus:outline-hidden focus:ring-2 focus:ring-primary focus:border-primary text-sm dark:bg-gray-700 dark:text-white"
            />
          </div>

          <div>
            <button
              type="submit"
              disabled={isPending}
              className="group relative w-full flex justify-center py-2.5 px-4 border border-transparent text-sm font-semibold rounded-md text-white bg-primary hover:bg-blue-700 focus:outline-hidden focus:ring-2 focus:ring-offset-2 focus:ring-primary disabled:opacity-50 cursor-pointer"
            >
              {isPending ? 'Authenticating...' : 'Sign In'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
