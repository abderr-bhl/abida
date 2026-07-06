import { requireAuth } from '@/lib/auth';

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  await requireAuth();
  return <div className="bg-gray-50 min-h-screen">{children}</div>;
}
