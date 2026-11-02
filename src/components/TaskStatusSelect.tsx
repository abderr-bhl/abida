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

  const getStatusColor = (status: TaskStatus) => {
    switch (status) {
      case 'completed':
        return 'bg-green-100 text-green-800 border-green-300 dark:bg-green-950 dark:text-green-300';
      case 'in_progress':
        return 'bg-blue-100 text-blue-800 border-blue-300 dark:bg-blue-950 dark:text-blue-300';
      case 'dismissed':
        return 'bg-gray-100 text-gray-700 border-gray-300 dark:bg-gray-800 dark:text-gray-400';
      default:
        return 'bg-yellow-100 text-yellow-800 border-yellow-300 dark:bg-yellow-950 dark:text-yellow-300';
    }
  };

  return (
    <div className="relative inline-block">
      <select
        value={currentStatus}
        onChange={handleChange}
        disabled={isPending}
        className={`text-xs font-semibold rounded-full px-3 py-1 border transition-colors cursor-pointer appearance-none pr-7 focus:outline-none focus:ring-2 focus:ring-primary disabled:opacity-50 ${getStatusColor(
          currentStatus
        )}`}
        aria-label="Update task status"
      >
        <option value="pending">Pending</option>
        <option value="in_progress">In Progress</option>
        <option value="completed">Completed</option>
        <option value="dismissed">Dismissed</option>
      </select>
      <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-current opacity-60">
        <svg className="w-3 h-3 fill-current" viewBox="0 0 20 20">
          <path d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" />
        </svg>
      </div>
    </div>
  );
}
