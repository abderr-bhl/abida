import { requireAuth } from '@/lib/auth';
import React from 'react';

interface Props {
  children: React.ReactNode;
}

export default async function AdminTasksLayout({ children }: Props) {
  // Await the requireAuth helper to enforce authentication before rendering children
  await requireAuth();

  return <>{children}</>;
}
