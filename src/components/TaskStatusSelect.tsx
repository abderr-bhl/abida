'use client';

import { useTransition } from 'react';
import { updateTaskStatus } from '@/app/admin/tasks/actions';

interface TaskStatusSelectProps {
  taskId: string;
  currentStatus: 'pending' | 'in_progress' | 'completed' | 'cancelled';
}

export default function TaskStatusSelect({ taskId, currentStatus }: TaskStatusSelectProps) {
  const [isPending, startTransition] = useTransition();

  const handleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newStatus = e.target.value as 'pending' | 'in_progress' | 'completed' | 'cancelled';
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
        className={`text-xs font-semibold rounded-full px-3 py-1 border focus:outline-none focus:ring-2 focus:ring-primary ${
          currentStatus === 'completed'
            ? 'bg-green-100 text-green-800 border-green-300'
            : currentStatus === 'in_progress'
            ? 'bg-blue-100 text-blue-800 border-blue-300'
            : currentStatus === 'cancelled'
            ? 'bg-gray-100 text-gray-800 border-gray-300'
            : 'bg-yellow-100 text-yellow-800 border-yellow-300'
        }`}
      >
        <option value="pending">Pending</option>
        <option value="in_progress">In Progress</option>
        <option value="completed">Completed</option>
        <option value="cancelled">Cancelled</option>
      </select>
    </div>
  );
}
