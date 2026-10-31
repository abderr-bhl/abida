'use client';

import { useTransition } from 'react';
import { TaskStatus } from '@/types';
import { updateTaskStatusAction } from '@/app/admin/tasks/actions';

interface TaskStatusSelectProps {
  taskId: string;
  initialStatus: TaskStatus;
}

export default function TaskStatusSelect({ taskId, initialStatus }: TaskStatusSelectProps) {
  const [isPending, startTransition] = useTransition();

  const handleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newStatus = e.target.value as TaskStatus;
    startTransition(async () => {
      await updateTaskStatusAction(taskId, newStatus);
    });
  };

  return (
    <div className="relative inline-block">
      <select
        defaultValue={initialStatus}
        disabled={isPending}
        onChange={handleChange}
        className="text-xs font-semibold rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 py-1.5 px-2.5 text-gray-800 dark:text-gray-200 shadow-sm focus:outline-none focus:ring-1 focus:ring-primary disabled:opacity-50 cursor-pointer"
      >
        <option value="pending">Pending</option>
        <option value="in_progress">In Progress</option>
        <option value="completed">Completed</option>
        <option value="dismissed">Dismissed</option>
      </select>
      {isPending && (
        <span className="ml-2 text-xs text-gray-400 animate-pulse">Saving...</span>
      )}
    </div>
  );
}
