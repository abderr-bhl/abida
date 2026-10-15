'use client';

import { useTransition } from 'react';

interface TaskStatusSelectProps {
  taskId: string;
  currentStatus: string;
  onStatusChange: (taskId: string, status: string) => Promise<void>;
}

export default function TaskStatusSelect({
  taskId,
  currentStatus,
  onStatusChange,
}: TaskStatusSelectProps) {
  const [isPending, startTransition] = useTransition();

  const handleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newStatus = e.target.value;
    startTransition(async () => {
      await onStatusChange(taskId, newStatus);
    });
  };

  return (
    <select
      value={currentStatus}
      onChange={handleChange}
      disabled={isPending}
      className="block w-full text-xs sm:text-sm font-medium border border-gray-300 dark:border-gray-600 rounded-md shadow-sm py-1.5 px-3 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-primary focus:border-primary disabled:opacity-50"
    >
      <option value="pending">Pending</option>
      <option value="in_progress">In Progress</option>
      <option value="completed">Completed</option>
      <option value="cancelled">Cancelled</option>
    </select>
  );
}
