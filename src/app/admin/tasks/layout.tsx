import { requireAuth } from '@/lib/auth';

interface LayoutProps {
  children: React.ReactNode;
}

export default async function AdminTasksLayout({ children }: LayoutProps) {
  await requireAuth();
  return <div className="min-h-screen bg-gray-50 dark:bg-gray-950">{children}</div>;
}
