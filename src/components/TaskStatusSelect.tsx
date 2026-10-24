'use client';

import { useState, useTransition } from 'react';
import { updateTaskStatusAction } from '@/app/admin/tasks/actions';
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
      await updateTaskStatusAction(taskId, newStatus);
    });
  };

  const getStatusBadgeClass = (currentStatus: TaskStatus) => {
    switch (currentStatus) {
      case 'pending':
        return 'bg-amber-100 text-amber-800 border-amber-300 dark:bg-amber-950 dark:text-amber-200';
      case 'in_progress':
        return 'bg-blue-100 text-blue-800 border-blue-300 dark:bg-blue-950 dark:text-blue-200';
      case 'completed':
        return 'bg-green-100 text-green-800 border-green-300 dark:bg-green-950 dark:text-green-200';
      case 'cancelled':
        return 'bg-gray-100 text-gray-800 border-gray-300 dark:bg-gray-800 dark:text-gray-300';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-300';
    }
  };

  return (
    <div className="relative inline-block">
      <select
        value={status}
        onChange={handleStatusChange}
        disabled={isPending}
        className={`text-xs font-semibold px-2.5 py-1 rounded-md border focus:outline-none focus:ring-2 focus:ring-primary cursor-pointer disabled:opacity-50 transition-colors ${getStatusBadgeClass(
          status
        )}`}
      >
        <option value="pending">Pending</option>
        <option value="in_progress">In Progress</option>
        <option value="completed">Completed</option>
        <option value="cancelled">Cancelled</option>
      </select>
    </div>
  );
}
