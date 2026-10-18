'use client';

import { useTransition } from 'react';
import { TaskStatus } from '@/types';

interface TaskStatusSelectProps {
  taskId: string;
  currentStatus: TaskStatus;
  onStatusChange: (taskId: string, status: TaskStatus) => Promise<void>;
}

export default function TaskStatusSelect({
  taskId,
  currentStatus,
  onStatusChange,
}: TaskStatusSelectProps) {
  const [isPending, startTransition] = useTransition();

  const handleSelectChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newStatus = e.target.value as TaskStatus;
    startTransition(async () => {
      await onStatusChange(taskId, newStatus);
    });
  };

  const getStatusBg = (status: TaskStatus) => {
    switch (status) {
      case 'completed':
        return 'bg-green-100 text-green-800 border-green-300 dark:bg-green-900/40 dark:text-green-300';
      case 'in_progress':
        return 'bg-blue-100 text-blue-800 border-blue-300 dark:bg-blue-900/40 dark:text-blue-300';
      case 'dismissed':
        return 'bg-gray-100 text-gray-800 border-gray-300 dark:bg-gray-800 dark:text-gray-400';
      case 'pending':
      default:
        return 'bg-yellow-100 text-yellow-800 border-yellow-300 dark:bg-yellow-900/40 dark:text-yellow-300';
    }
  };

  return (
    <select
      value={currentStatus}
      disabled={isPending}
      onChange={handleSelectChange}
      className={`text-xs font-semibold px-3 py-1.5 rounded-lg border focus:outline-none focus:ring-2 focus:ring-primary transition-colors cursor-pointer ${getStatusBg(
        currentStatus
      )} ${isPending ? 'opacity-50 cursor-not-allowed' : ''}`}
    >
      <option value="pending">Pending</option>
      <option value="in_progress">In Progress</option>
      <option value="completed">Completed</option>
      <option value="dismissed">Dismissed</option>
    </select>
  );
}
