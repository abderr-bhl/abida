'use client';

import { useTransition } from 'react';
import { updateTaskStatusAction } from '@/app/admin/tasks/actions';
import { TaskStatus } from '@/lib/automation/benchmark';

interface TaskStatusSelectProps {
  taskId: string;
  initialStatus: TaskStatus;
}

export default function TaskStatusSelect({ taskId, initialStatus }: TaskStatusSelectProps) {
  const [isPending, startTransition] = useTransition();

  const handleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const nextStatus = e.target.value as TaskStatus;
    startTransition(async () => {
      await updateTaskStatusAction(taskId, nextStatus);
    });
  };

  return (
    <div className="relative inline-block text-left">
      <select
        defaultValue={initialStatus}
        onChange={handleChange}
        disabled={isPending}
        className={`text-xs font-semibold px-2.5 py-1.5 rounded-md border transition-colors cursor-pointer focus:outline-none focus:ring-2 focus:ring-primary ${
          isPending ? 'opacity-50' : ''
        } ${
          initialStatus === 'published'
            ? 'bg-green-100 text-green-800 border-green-300 dark:bg-green-900/40 dark:text-green-300'
            : initialStatus === 'in_progress'
            ? 'bg-blue-100 text-blue-800 border-blue-300 dark:bg-blue-900/40 dark:text-blue-300'
            : initialStatus === 'ignored'
            ? 'bg-gray-100 text-gray-700 border-gray-300 dark:bg-gray-800 dark:text-gray-400'
            : 'bg-amber-100 text-amber-800 border-amber-300 dark:bg-amber-900/40 dark:text-amber-300'
        }`}
      >
        <option value="pending">Pending</option>
        <option value="in_progress">In Progress</option>
        <option value="published">Published</option>
        <option value="ignored">Ignored</option>
      </select>
    </div>
  );
}
