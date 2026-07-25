import { requireAuth } from '@/lib/auth';

export default async function AdminTasksLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  await requireAuth();
  return (
    <div className="bg-gray-50 dark:bg-gray-900/40 min-h-[80vh] py-8">
      {children}
    </div>
  );
}
