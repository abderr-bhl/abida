'use client';

import React, { useTransition } from 'react';
import { updateTaskStatusAction } from '@/app/admin/tasks/actions';
import { TaskStatus } from '@/types';

interface TaskStatusSelectProps {
  taskId: string;
  initialStatus: TaskStatus;
}

export default function TaskStatusSelect({
  taskId,
  initialStatus,
}: TaskStatusSelectProps) {
  const [isPending, startTransition] = useTransition();

  const handleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const nextStatus = e.target.value as TaskStatus;
    startTransition(async () => {
      await updateTaskStatusAction(taskId, nextStatus);
    });
  };

  const getStatusColor = (status: TaskStatus) => {
    switch (status) {
      case 'completed':
        return 'text-green-700 bg-green-50 border-green-300 dark:bg-green-950/40 dark:text-green-300 dark:border-green-800';
      case 'in_progress':
        return 'text-amber-700 bg-amber-50 border-amber-300 dark:bg-amber-950/40 dark:text-amber-300 dark:border-amber-800';
      case 'pending':
      default:
        return 'text-blue-700 bg-blue-50 border-blue-300 dark:bg-blue-950/40 dark:text-blue-300 dark:border-blue-800';
    }
  };

  return (
    <div className="relative inline-block text-left">
      <select
        value={initialStatus}
        disabled={isPending}
        onChange={handleChange}
        aria-label="Update task status"
        className={`text-xs font-semibold rounded-md px-2.5 py-1.5 border transition-all cursor-pointer focus:outline-none focus:ring-2 focus:ring-primary ${getStatusColor(
          initialStatus
        )} ${isPending ? 'opacity-50 pointer-events-none' : ''}`}
      >
        <option value="pending">Pending</option>
        <option value="in_progress">In Progress</option>
        <option value="completed">Completed</option>
      </select>
    </div>
  );
}
