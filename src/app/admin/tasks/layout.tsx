import { requireAuth } from '@/lib/auth';

interface LayoutProps {
  children: React.ReactNode;
}

export default async function AdminTasksLayout({ children }: LayoutProps) {
  await requireAuth();
  return <>{children}</>;
}
