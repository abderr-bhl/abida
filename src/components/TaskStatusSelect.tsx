'use client';

import { useTransition } from 'react';
import { TaskStatus } from '@/lib/automation/benchmark';

interface TaskStatusSelectProps {
  taskId: string;
  currentStatus: TaskStatus;
  onStatusChange: (taskId: string, status: TaskStatus) => Promise<void>;
}

export default function TaskStatusSelect({
  taskId,
  currentStatus,
  onStatusChange
}: TaskStatusSelectProps) {
  const [isPending, startTransition] = useTransition();

  const handleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newStatus = e.target.value as TaskStatus;
    startTransition(async () => {
      await onStatusChange(taskId, newStatus);
    });
  };

  return (
    <select
      value={currentStatus}
      onChange={handleChange}
      disabled={isPending}
      className="block w-full text-xs font-medium bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-md py-1 px-2 text-gray-700 dark:text-gray-300 shadow-sm focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary disabled:opacity-50"
    >
      <option value="pending">Pending</option>
      <option value="in_progress">In Progress</option>
      <option value="completed">Completed</option>
      <option value="cancelled">Cancelled</option>
    </select>
  );
}
