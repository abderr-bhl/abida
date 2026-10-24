import { requireAuth } from '@/lib/auth';
import { ReactNode } from 'react';

interface LayoutProps {
  children: ReactNode;
}

export default async function AdminTasksLayout({ children }: LayoutProps) {
  await requireAuth();
  return <div className="min-h-screen bg-gray-50 dark:bg-gray-900">{children}</div>;
}
