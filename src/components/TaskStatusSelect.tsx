'use client';

import { useTransition } from 'react';
import { updateTaskStatus } from '@/app/admin/tasks/actions';

interface TaskStatusSelectProps {
  taskId: string;
  currentStatus: 'pending' | 'in_progress' | 'completed';
}

export default function TaskStatusSelect({ taskId, currentStatus }: TaskStatusSelectProps) {
  const [isPending, startTransition] = useTransition();

  const handleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newStatus = e.target.value as 'pending' | 'in_progress' | 'completed';
    startTransition(async () => {
      await updateTaskStatus(taskId, newStatus);
    });
  };

  return (
    <select
      value={currentStatus}
      onChange={handleChange}
      disabled={isPending}
      className="text-xs font-semibold rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-800 dark:text-gray-200 py-1.5 px-2.5 focus:outline-none focus:ring-2 focus:ring-primary disabled:opacity-50"
    >
      <option value="pending">Pending</option>
      <option value="in_progress">In Progress</option>
      <option value="completed">Completed</option>
    </select>
  );
}
