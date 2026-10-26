'use client';

import { useTransition } from 'react';
import { TaskStatus } from '@/types';

interface TaskStatusSelectProps {
  taskId: string;
  currentStatus: TaskStatus;
  onStatusChange: (taskId: string, status: TaskStatus) => Promise<void>;
}

export default function TaskStatusSelect({
  taskId,
  currentStatus,
  onStatusChange,
}: TaskStatusSelectProps) {
  const [isPending, startTransition] = useTransition();

  return (
    <select
      disabled={isPending}
      value={currentStatus}
      onChange={(e) => {
        const newStatus = e.target.value as TaskStatus;
        startTransition(async () => {
          await onStatusChange(taskId, newStatus);
        });
      }}
      className="text-xs font-semibold rounded-md border border-gray-300 bg-white px-2.5 py-1 text-gray-800 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 disabled:opacity-50 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-200"
    >
      <option value="pending">Pending</option>
      <option value="in_progress">In Progress</option>
      <option value="completed">Completed</option>
    </select>
  );
}
