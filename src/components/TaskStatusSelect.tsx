'use client';

import { useTransition } from 'react';
import { updateTaskStatusAction } from '@/app/admin/tasks/actions';
import { Task } from '@/lib/automation/benchmark';

interface TaskStatusSelectProps {
  taskId: string;
  currentStatus: Task['status'];
}

export default function TaskStatusSelect({ taskId, currentStatus }: TaskStatusSelectProps) {
  const [isPending, startTransition] = useTransition();

  const handleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newStatus = e.target.value as Task['status'];
    startTransition(async () => {
      await updateTaskStatusAction(taskId, newStatus);
    });
  };

  return (
    <div className="relative">
      <select
        value={currentStatus}
        onChange={handleChange}
        disabled={isPending}
        className="text-xs font-semibold rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-200 py-1 px-2 focus:outline-none focus:ring-2 focus:ring-primary disabled:opacity-50"
      >
        <option value="pending">Pending</option>
        <option value="in_progress">In Progress</option>
        <option value="completed">Completed</option>
        <option value="cancelled">Cancelled</option>
      </select>
    </div>
  );
}
