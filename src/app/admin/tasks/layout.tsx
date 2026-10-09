import { requireAuth } from "@/lib/auth";

export default async function AdminTasksLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  await requireAuth();

  return <div className="min-h-screen bg-gray-50">{children}</div>;
}
