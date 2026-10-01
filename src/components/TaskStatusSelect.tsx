'use client';

import { useTransition } from 'react';
import { updateTaskStatus } from '@/app/admin/tasks/actions';
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
      await updateTaskStatus(taskId, newStatus);
    });
  };

  return (
    <select
      value={currentStatus}
      onChange={handleChange}
      disabled={isPending}
      className="text-xs font-semibold rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-200 py-1 px-2 focus:outline-none focus:ring-1 focus:ring-primary disabled:opacity-50"
    >
      <option value="PENDING">PENDING</option>
      <option value="IN_PROGRESS">IN_PROGRESS</option>
      <option value="COMPLETED">COMPLETED</option>
      <option value="CANCELLED">CANCELLED</option>
    </select>
  );
}
