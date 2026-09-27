'use client';

import { useTransition } from 'react';
import { TaskStatus } from '@/types/task';

interface Props {
  taskId: string;
  currentStatus: TaskStatus;
  onStatusChange: (taskId: string, status: TaskStatus) => Promise<void>;
}

export default function TaskStatusSelect({ taskId, currentStatus, onStatusChange }: Props) {
  const [isPending, startTransition] = useTransition();

  const handleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newStatus = e.target.value as TaskStatus;
    startTransition(async () => {
      await onStatusChange(taskId, newStatus);
    });
  };

  return (
    <select
      value={currentStatus}
      onChange={handleChange}
      disabled={isPending}
      className="bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 text-gray-900 dark:text-white text-xs rounded-lg focus:ring-primary focus:border-primary block p-2 disabled:opacity-50"
    >
      <option value="pending">Pending</option>
      <option value="in_progress">In Progress</option>
      <option value="completed">Completed</option>
    </select>
  );
}
