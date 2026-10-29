'use client';

import { useTransition } from 'react';
import { TaskStatus } from '@/types';
import { updateTaskStatus } from '@/app/admin/tasks/actions';

interface TaskStatusSelectProps {
  taskId: string;
  currentStatus: TaskStatus;
}

export function TaskStatusSelect({ taskId, currentStatus }: TaskStatusSelectProps) {
  const [isPending, startTransition] = useTransition();

  const handleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const nextStatus = e.target.value as TaskStatus;
    startTransition(async () => {
      await updateTaskStatus(taskId, nextStatus);
    });
  };

  return (
    <select
      value={currentStatus}
      onChange={handleChange}
      disabled={isPending}
      className="text-xs rounded border-gray-300 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-200 py-1 px-2 focus:ring-primary focus:border-primary disabled:opacity-50"
    >
      <option value="pending">Pending</option>
      <option value="in_progress">In Progress</option>
      <option value="completed">Completed</option>
      <option value="dismissed">Dismissed</option>
    </select>
  );
}
