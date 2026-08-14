import { requireAuth } from '@/lib/auth';

interface AdminLayoutProps {
  children: React.ReactNode;
}

export default async function AdminLayout({ children }: AdminLayoutProps) {
  // Enforce administrative routes authentication
  await requireAuth();

  return <div className="min-h-screen bg-gray-50 dark:bg-gray-900">{children}</div>;
}
