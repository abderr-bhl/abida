import { ReactNode } from 'react';
import { requireAuth } from '@/lib/auth';

interface AdminLayoutProps {
  children: ReactNode;
}

export default async function AdminTasksLayout({ children }: AdminLayoutProps) {
  await requireAuth();
  return <>{children}</>;
}
