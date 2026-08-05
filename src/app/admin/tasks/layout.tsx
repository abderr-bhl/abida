import React from 'react';
import { requireAuth } from '@/lib/auth';

interface Props {
  children: React.ReactNode;
}

export default async function AdminTasksLayout({ children }: Props) {
  // Enforce authentication at layout level
  await requireAuth();

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950">
      {children}
    </div>
  );
}
