import { ReactNode } from 'react';
import { requireAuth } from '@/lib/auth';

interface AdminTasksLayoutProps {
  children: ReactNode;
}

export default async function AdminTasksLayout({ children }: AdminTasksLayoutProps) {
  await requireAuth();

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {children}
    </div>
  );
}
