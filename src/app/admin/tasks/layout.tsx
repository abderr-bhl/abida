import React from 'react';
import { requireAuth } from '@/lib/auth';

interface LayoutProps {
  children: React.ReactNode;
}

export default async function AdminTasksLayout({ children }: LayoutProps) {
  // Await requireAuth() helper to enforce authentication before rendering children
  await requireAuth();

  return (
    <div className="min-h-screen bg-gray-50/50 dark:bg-gray-900/10">
      {children}
    </div>
  );
}
