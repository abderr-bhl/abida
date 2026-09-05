import React from 'react';
import { requireAuth } from '@/lib/auth';

export default async function AdminTasksLayout({
  children
}: {
  children: React.ReactNode;
}) {
  await requireAuth();
  return <>{children}</>;
}
