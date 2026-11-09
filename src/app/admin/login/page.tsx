'use client';

import React, { useActionState } from 'react';
import { loginAction, LoginState } from './actions';
import { ShieldAlert, KeyRound } from 'lucide-react';

const initialState: LoginState = {};

export default function AdminLoginPage() {
  const [state, formAction, isPending] = useActionState(loginAction, initialState);

  return (
    <div className="min-h-[70vh] flex items-center justify-center px-4 sm:px-6 lg:px-8 py-12">
      <div className="max-w-md w-full space-y-8 bg-white dark:bg-gray-900 p-8 rounded-2xl shadow-lg border border-gray-200 dark:border-gray-800">
        <div className="text-center">
          <div className="mx-auto flex items-center justify-center h-14 w-14 rounded-full bg-blue-100 dark:bg-blue-900/40 text-primary">
            <KeyRound className="h-7 w-7" />
          </div>
          <h2 className="mt-4 text-2xl font-black text-gray-900 dark:text-white">
            Admin Authentication
          </h2>
          <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
            ReviewGuid Automated Benchmarking & Task Management
          </p>
        </div>

        {state?.error && (
          <div className="rounded-md bg-red-50 dark:bg-red-950/40 p-4 border border-red-200 dark:border-red-900/50 flex items-center gap-3">
            <ShieldAlert className="h-5 w-5 text-red-600 dark:text-red-400 flex-shrink-0" />
            <p className="text-sm font-medium text-red-800 dark:text-red-300">
              {state.error}
            </p>
          </div>
        )}

        <form action={formAction} className="mt-8 space-y-6">
          <div>
            <label
              htmlFor="token"
              className="block text-sm font-semibold text-gray-700 dark:text-gray-300"
            >
              Master Admin Token
            </label>
            <div className="mt-2">
              <input
                id="token"
                name="token"
                type="password"
                required
                autoComplete="current-password"
                placeholder="Enter ADMIN_TOKEN"
                className="appearance-none block w-full px-4 py-3 border border-gray-300 dark:border-gray-700 rounded-lg shadow-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary text-gray-900 dark:text-white dark:bg-gray-800 text-sm"
              />
            </div>
          </div>

          <div>
            <button
              type="submit"
              disabled={isPending}
              className="w-full flex justify-center py-3 px-4 border border-transparent rounded-lg shadow-sm text-sm font-bold text-white bg-primary hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary disabled:opacity-50 transition-colors"
            >
              {isPending ? 'Authenticating...' : 'Sign In to Dashboard'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
