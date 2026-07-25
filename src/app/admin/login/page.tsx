'use client';

import { useActionState } from 'react';
import { loginAction, LoginState } from './actions';

const initialState: LoginState = {
  success: false,
};

export default function LoginPage() {
  const [state, formAction, isPending] = useActionState(loginAction, initialState);

  return (
    <div className="min-h-[60vh] flex items-center justify-center px-4 sm:px-6 lg:px-8 bg-gray-50 dark:bg-gray-900/50 py-12">
      <div className="max-w-md w-full space-y-8 bg-white dark:bg-gray-800 p-8 rounded-xl shadow-md border border-gray-200 dark:border-gray-700">
        <div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900 dark:text-white">
            Admin Portal Login
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600 dark:text-gray-400">
            Enter your ADMIN_TOKEN to access task management
          </p>
        </div>
        <form className="mt-8 space-y-6" action={formAction}>
          <div className="rounded-md shadow-sm">
            <div>
              <label htmlFor="token" className="sr-only">
                Admin Token
              </label>
              <input
                id="token"
                name="token"
                type="password"
                required
                className="appearance-none rounded-md relative block w-full px-3 py-2 border border-gray-300 dark:border-gray-700 placeholder-gray-500 dark:placeholder-gray-400 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary focus-visible:ring-2 focus-visible:ring-primary focus-visible:outline-none sm:text-sm bg-white dark:bg-gray-900"
                placeholder="Enter ADMIN_TOKEN"
              />
            </div>
          </div>

          {state?.error && (
            <div className="p-3 bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400 rounded-md text-sm text-center">
              {state.error}
            </div>
          )}

          <div>
            <button
              type="submit"
              disabled={isPending}
              className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-primary hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary focus-visible:ring-2 focus-visible:ring-primary disabled:opacity-50 cursor-pointer transition-colors"
            >
              {isPending ? 'Logging in...' : 'Sign in'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
