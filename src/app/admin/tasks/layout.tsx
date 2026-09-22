import { ReactNode } from 'react';
import { requireAuth } from '@/lib/auth';

export default async function AdminTasksLayout({
  children,
}: {
  children: ReactNode;
}) {
  await requireAuth();

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {children}
    </div>
  );
}
