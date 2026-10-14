'use client';

import { useTransition } from 'react';
import { TaskStatus } from '@/types';

interface TaskStatusSelectProps {
  taskId: string;
  currentStatus: TaskStatus;
  onStatusChange: (taskId: string, newStatus: TaskStatus) => Promise<void>;
}

export default function TaskStatusSelect({
  taskId,
  currentStatus,
  onStatusChange,
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
      className="text-xs font-medium px-2.5 py-1.5 rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary disabled:opacity-50"
    >
      <option value="pending">Pending</option>
      <option value="in_progress">In Progress</option>
      <option value="completed">Completed</option>
      <option value="ignored">Ignored</option>
    </select>
  );
}
