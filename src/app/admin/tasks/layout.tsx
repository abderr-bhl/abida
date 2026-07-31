import { requireAuth } from '@/lib/auth';

interface Props {
  children: React.ReactNode;
}

export default async function AdminLayout({ children }: Props) {
  // Await requireAuth to enforce route authentication in Server Component layout
  await requireAuth();

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950">
      {children}
    </div>
  );
}
