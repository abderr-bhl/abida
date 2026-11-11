'use client';

import { useTransition } from 'react';
import { updateTaskStatusAction } from '@/app/admin/tasks/actions';
import { BenchmarkTask } from '@/types';

interface TaskStatusSelectProps {
  taskId: string;
  initialStatus: BenchmarkTask['status'];
}

export default function TaskStatusSelect({ taskId, initialStatus }: TaskStatusSelectProps) {
  const [isPending, startTransition] = useTransition();

  const handleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const nextStatus = e.target.value as BenchmarkTask['status'];
    startTransition(async () => {
      await updateTaskStatusAction(taskId, nextStatus);
    });
  };

  return (
    <select
      defaultValue={initialStatus}
      onChange={handleChange}
      disabled={isPending}
      className={`text-xs font-semibold rounded-md border py-1.5 px-2 focus:outline-none focus:ring-2 focus:ring-primary ${
        isPending ? 'opacity-50' : ''
      } dark:bg-gray-800 dark:border-gray-700 dark:text-gray-200`}
    >
      <option value="pending">Pending</option>
      <option value="in_progress">In Progress</option>
      <option value="completed">Completed</option>
    </select>
  );
}
