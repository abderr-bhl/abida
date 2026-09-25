'use client';

import { useTransition } from 'react';
import { updateTaskStatus } from '@/app/admin/tasks/actions';
import { TaskStatus } from '@/types';

interface TaskStatusSelectProps {
  taskId: string;
  currentStatus: TaskStatus;
}

export default function TaskStatusSelect({ taskId, currentStatus }: TaskStatusSelectProps) {
  const [isPending, startTransition] = useTransition();

  const handleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newStatus = e.target.value as TaskStatus;
    startTransition(async () => {
      await updateTaskStatus(taskId, newStatus);
    });
  };

  const getBadgeStyle = (status: TaskStatus) => {
    switch (status) {
      case 'pending':
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400';
      case 'in_progress':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400';
      case 'completed':
        return 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400';
      case 'cancelled':
        return 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-400';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <select
      value={currentStatus}
      onChange={handleChange}
      disabled={isPending}
      className={`text-xs font-semibold rounded-full px-3 py-1 border border-transparent focus:outline-none focus:ring-2 focus:ring-primary cursor-pointer disabled:opacity-50 ${getBadgeStyle(
        currentStatus
      )}`}
    >
      <option value="pending">Pending</option>
      <option value="in_progress">In Progress</option>
      <option value="completed">Completed</option>
      <option value="cancelled">Cancelled</option>
    </select>
  );
}
