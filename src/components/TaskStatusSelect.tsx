'use client';

import { useTransition } from 'react';
import { TaskStatus } from '@/types';
import { updateTaskStatusAction } from '@/app/admin/tasks/actions';

interface TaskStatusSelectProps {
  taskId: string;
  currentStatus: TaskStatus;
}

export default function TaskStatusSelect({ taskId, currentStatus }: TaskStatusSelectProps) {
  const [isPending, startTransition] = useTransition();

  const handleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newStatus = e.target.value as TaskStatus;
    startTransition(async () => {
      await updateTaskStatusAction(taskId, newStatus);
    });
  };

  return (
    <select
      value={currentStatus}
      onChange={handleChange}
      disabled={isPending}
      className="text-xs rounded-md border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 py-1.5 px-2.5 focus:outline-none focus:ring-1 focus:ring-primary disabled:opacity-50 font-medium"
    >
      <option value="pending">Pending</option>
      <option value="in_progress">In Progress</option>
      <option value="completed">Completed</option>
      <option value="dismissed">Dismissed</option>
    </select>
  );
}
