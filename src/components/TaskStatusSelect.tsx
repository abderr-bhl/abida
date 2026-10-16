'use client';

import { useState, useTransition } from 'react';
import { updateTaskStatus } from '@/app/admin/tasks/actions';
import { Task } from '@/lib/automation/benchmark';

interface TaskStatusSelectProps {
  taskId: string;
  initialStatus: Task['status'];
}

export default function TaskStatusSelect({ taskId, initialStatus }: TaskStatusSelectProps) {
  const [status, setStatus] = useState<Task['status']>(initialStatus);
  const [isPending, startTransition] = useTransition();

  const handleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newStatus = e.target.value as Task['status'];
    setStatus(newStatus);
    startTransition(async () => {
      await updateTaskStatus(taskId, newStatus);
    });
  };

  return (
    <div className="relative inline-block">
      <select
        value={status}
        onChange={handleChange}
        disabled={isPending}
        className={`px-3 py-1.5 rounded-lg text-xs font-semibold border transition-colors cursor-pointer focus:outline-none focus:ring-2 focus:ring-primary ${
          status === 'completed'
            ? 'bg-green-50 text-green-700 border-green-200 dark:bg-green-900/30 dark:text-green-400 dark:border-green-800'
            : status === 'in_progress'
            ? 'bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-900/30 dark:text-blue-400 dark:border-blue-800'
            : status === 'cancelled'
            ? 'bg-gray-100 text-gray-600 border-gray-200 dark:bg-gray-800 dark:text-gray-400 dark:border-gray-700'
            : 'bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-900/30 dark:text-amber-400 dark:border-amber-800'
        } ${isPending ? 'opacity-50' : ''}`}
      >
        <option value="pending">Pending</option>
        <option value="in_progress">In Progress</option>
        <option value="completed">Completed</option>
        <option value="cancelled">Cancelled</option>
      </select>
    </div>
  );
}
