import { requireAuth } from '@/lib/auth';
import { ReactNode } from 'react';

export default async function AdminTasksLayout({ children }: { children: ReactNode }) {
  await requireAuth();

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8">
      {children}
    </div>
  );
}
