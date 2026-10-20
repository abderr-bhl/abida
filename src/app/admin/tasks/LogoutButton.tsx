'use client';

import { logoutAction } from '@/app/admin/login/actions';
import { LogOut } from 'lucide-react';

export default function LogoutButton() {
  return (
    <button
      onClick={() => logoutAction()}
      className="inline-flex items-center gap-1.5 px-3 py-1.5 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 text-xs font-medium rounded-md transition-colors"
    >
      <LogOut className="w-3.5 h-3.5" />
      Sign Out
    </button>
  );
}
