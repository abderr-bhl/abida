import { requireAuth } from '@/lib/auth';

interface Props {
  children: React.ReactNode;
}

export default async function AdminTasksLayout({ children }: Props) {
  await requireAuth();
  return <>{children}</>;
}
