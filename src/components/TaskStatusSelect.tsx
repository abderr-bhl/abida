'use client';

import React, { useTransition } from 'react';
import { TaskStatus } from '@/types';
import { updateTaskStatusAction } from '@/app/admin/tasks/actions';

interface TaskStatusSelectProps {
  taskId: string;
  currentStatus: TaskStatus;
}

export function TaskStatusSelect({ taskId, currentStatus }: TaskStatusSelectProps) {
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
        value={currentStatus}
        onChange={handleChange}
        disabled={isPending}
        className="block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary text-xs font-semibold py-1 px-2.5 bg-white dark:bg-gray-800 dark:border-gray-700 dark:text-gray-200 border cursor-pointer disabled:opacity-50"
      >
        <option value="pending">Pending</option>
        <option value="in_progress">In Progress</option>
        <option value="completed">Completed</option>
        <option value="dismissed">Dismissed</option>
      </select>
      {isPending && (
        <span className="absolute right-2 top-1.5 text-[10px] text-gray-400">...</span>
      )}
    </div>
  );
}
