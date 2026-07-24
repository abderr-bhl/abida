import { requireAuth } from '@/lib/auth';
import React from 'react';

export default async function AdminTasksLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  await requireAuth();
  return <>{children}</>;
}
