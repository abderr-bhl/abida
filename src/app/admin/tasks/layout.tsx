import { ReactNode } from 'react';
import { requireAuth } from '@/lib/auth';

interface LayoutProps {
  children: ReactNode;
}

export default async function AdminTasksLayout({ children }: LayoutProps) {
  await requireAuth();
  return <>{children}</>;
}
