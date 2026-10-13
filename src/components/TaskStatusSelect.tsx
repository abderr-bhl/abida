'use client';

import React, { useActionState, useTransition } from 'react';
import { updateTaskStatusAction } from '@/app/admin/tasks/actions';
import { TaskStatus } from '@/types';

interface TaskStatusSelectProps {
  taskId: string;
  currentStatus: TaskStatus;
}

export default function TaskStatusSelect({ taskId, currentStatus }: TaskStatusSelectProps) {
  const [state, formAction, isPending] = useActionState(updateTaskStatusAction, null);
  const [isPendingTransition, startTransition] = useTransition();

  const handleSelectChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newStatus = e.target.value;
    const formData = new FormData();
    formData.append('taskId', taskId);
    formData.append('status', newStatus);

    startTransition(() => {
      formAction(formData);
    });
  };

  const getBadgeColor = (status: TaskStatus) => {
    switch (status) {
      case 'completed':
        return 'bg-green-100 text-green-800 border-green-300 dark:bg-green-900/30 dark:text-green-300';
      case 'in_progress':
        return 'bg-blue-100 text-blue-800 border-blue-300 dark:bg-blue-900/30 dark:text-blue-300';
      case 'dismissed':
        return 'bg-gray-100 text-gray-800 border-gray-300 dark:bg-gray-800 dark:text-gray-400';
      case 'pending':
      default:
        return 'bg-amber-100 text-amber-800 border-amber-300 dark:bg-amber-900/30 dark:text-amber-300';
    }
  };

  const loading = isPending || isPendingTransition;

  return (
    <div className="flex flex-col gap-1">
      <select
        defaultValue={currentStatus}
        onChange={handleSelectChange}
        disabled={loading}
        className={`text-xs font-semibold rounded-lg px-2.5 py-1.5 border focus:outline-none focus:ring-2 focus:ring-primary disabled:opacity-50 transition-colors ${getBadgeColor(currentStatus)}`}
      >
        <option value="pending">Pending</option>
        <option value="in_progress">In Progress</option>
        <option value="completed">Completed</option>
        <option value="dismissed">Dismissed</option>
      </select>
      {state?.error && (
        <span className="text-[10px] text-red-500">{state.error}</span>
      )}
    </div>
  );
}
