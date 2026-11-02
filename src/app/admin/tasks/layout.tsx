import { ReactNode } from 'react';
import { requireAuth } from '@/lib/auth';

export default async function AdminLayout({ children }: { children: ReactNode }) {
  await requireAuth();
  return <>{children}</>;
}
