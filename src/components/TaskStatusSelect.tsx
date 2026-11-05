'use client';

import { useTransition } from 'react';
import { TaskStatus } from '@/types/benchmark';
import { updateTaskStatusAction } from '@/app/admin/tasks/actions';

interface TaskStatusSelectProps {
  taskId: string;
  currentStatus: TaskStatus;
}

export default function TaskStatusSelect({
  taskId,
  currentStatus,
}: TaskStatusSelectProps) {
  const [isPending, startTransition] = useTransition();

  const handleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const nextStatus = e.target.value as TaskStatus;
    startTransition(async () => {
      await updateTaskStatusAction(taskId, nextStatus);
    });
  };

  const getStatusColor = (status: TaskStatus) => {
    switch (status) {
      case 'completed':
        return 'text-green-700 bg-green-50 border-green-200';
      case 'in_progress':
        return 'text-blue-700 bg-blue-50 border-blue-200';
      case 'dismissed':
        return 'text-gray-500 bg-gray-50 border-gray-200';
      default:
        return 'text-yellow-700 bg-yellow-50 border-yellow-200';
    }
  };

  return (
    <div className="relative inline-block">
      <select
        value={currentStatus}
        onChange={handleChange}
        disabled={isPending}
        className={`text-xs font-semibold rounded-md border px-2.5 py-1.5 cursor-pointer disabled:opacity-50 transition-colors ${getStatusColor(
          currentStatus
        )}`}
        aria-label="Update task status"
      >
        <option value="pending">Pending</option>
        <option value="in_progress">In Progress</option>
        <option value="completed">Completed</option>
        <option value="dismissed">Dismissed</option>
      </select>
      {isPending && (
        <span className="absolute -top-1 -right-1 flex h-2 w-2">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
          <span className="relative inline-flex rounded-full h-2 w-2 bg-blue-500"></span>
        </span>
      )}
    </div>
  );
}
