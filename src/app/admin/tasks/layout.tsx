import React from 'react';
import { requireAuth } from '@/lib/auth';

interface Props {
  children: React.ReactNode;
}

export default async function AdminTasksLayout({ children }: Props) {
  // Standard layout auth enforcement pattern
  await requireAuth();

  return <>{children}</>;
}
