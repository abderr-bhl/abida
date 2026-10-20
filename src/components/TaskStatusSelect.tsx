'use client';

import { useState, useTransition } from 'react';
import { updateStatusAction } from '@/app/admin/tasks/actions';
import { TaskStatus } from '@/types';

interface TaskStatusSelectProps {
  taskId: string;
  initialStatus: TaskStatus;
}

export default function TaskStatusSelect({ taskId, initialStatus }: TaskStatusSelectProps) {
  const [status, setStatus] = useState<TaskStatus>(initialStatus);
  const [isPending, startTransition] = useTransition();

  const handleStatusChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newStatus = e.target.value as TaskStatus;
    setStatus(newStatus);
    startTransition(async () => {
      await updateStatusAction(taskId, newStatus);
    });
  };

  const getBadgeColor = (st: TaskStatus) => {
    switch (st) {
      case 'Completed':
        return 'bg-green-100 text-green-800 border-green-200 dark:bg-green-900/40 dark:text-green-300';
      case 'In Progress':
        return 'bg-blue-100 text-blue-800 border-blue-200 dark:bg-blue-900/40 dark:text-blue-300';
      case 'Pending':
      default:
        return 'bg-amber-100 text-amber-800 border-amber-200 dark:bg-amber-900/40 dark:text-amber-300';
    }
  };

  return (
    <div className="relative inline-block">
      <select
        value={status}
        onChange={handleStatusChange}
        disabled={isPending}
        aria-label="Update Task Status"
        className={`px-3 py-1.5 rounded-md text-xs font-semibold border focus:outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer disabled:opacity-50 transition-colors ${getBadgeColor(
          status
        )}`}
      >
        <option value="Pending">Pending</option>
        <option value="In Progress">In Progress</option>
        <option value="Completed">Completed</option>
      </select>
      {isPending && (
        <span className="ml-2 text-xs text-gray-400 font-normal">Saving...</span>
      )}
    </div>
  );
}
