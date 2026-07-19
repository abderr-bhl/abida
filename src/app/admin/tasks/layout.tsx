import { requireAuth } from '@/lib/auth';
import React from 'react';

interface Props {
  children: React.ReactNode;
}

export default async function AdminLayout({ children }: Props) {
  // Enforce administrative routes authentication
  await requireAuth();

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950">
      {children}
    </div>
  );
}
