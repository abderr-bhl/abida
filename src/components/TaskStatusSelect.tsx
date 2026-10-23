'use client';

import { useTransition } from 'react';
import { updateTaskStatus } from '@/app/admin/tasks/actions';

interface TaskStatusSelectProps {
  taskId: string;
  currentStatus: 'pending' | 'in_progress' | 'completed';
}

export default function TaskStatusSelect({ taskId, currentStatus }: TaskStatusSelectProps) {
  const [isPending, startTransition] = useTransition();

  const handleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newStatus = e.target.value as 'pending' | 'in_progress' | 'completed';
    startTransition(async () => {
      await updateTaskStatus(taskId, newStatus);
    });
  };

  return (
    <div className="relative inline-block text-left">
      <select
        value={currentStatus}
        onChange={handleChange}
        disabled={isPending}
        className={`text-xs font-semibold rounded-full px-3 py-1 border shadow-sm focus:outline-none focus:ring-2 focus:ring-offset-1 focus:ring-blue-500 cursor-pointer disabled:opacity-50 ${
          currentStatus === 'completed'
            ? 'bg-green-100 text-green-800 border-green-300'
            : currentStatus === 'in_progress'
            ? 'bg-yellow-100 text-yellow-800 border-yellow-300'
            : 'bg-gray-100 text-gray-800 border-gray-300'
        }`}
      >
        <option value="pending">Pending</option>
        <option value="in_progress">In Progress</option>
        <option value="completed">Completed</option>
      </select>
    </div>
  );
}
