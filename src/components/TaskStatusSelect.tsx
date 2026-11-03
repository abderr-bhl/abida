'use client';

import { useTransition } from 'react';
import { BenchmarkTaskStatus } from '@/types';
import { updateTaskStatusAction } from '@/app/admin/tasks/actions';

interface TaskStatusSelectProps {
  taskId: string;
  initialStatus: BenchmarkTaskStatus;
}

export default function TaskStatusSelect({
  taskId,
  initialStatus
}: TaskStatusSelectProps) {
  const [isPending, startTransition] = useTransition();

  const handleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newStatus = e.target.value as BenchmarkTaskStatus;
    startTransition(async () => {
      await updateTaskStatusAction(taskId, newStatus);
    });
  };

  const getStatusColor = (status: BenchmarkTaskStatus) => {
    switch (status) {
      case 'completed':
        return 'bg-emerald-50 text-emerald-700 border-emerald-300';
      case 'in_progress':
        return 'bg-blue-50 text-blue-700 border-blue-300';
      default:
        return 'bg-amber-50 text-amber-700 border-amber-300';
    }
  };

  return (
    <div className="relative inline-block">
      <select
        defaultValue={initialStatus}
        onChange={handleChange}
        disabled={isPending}
        className={`text-xs font-semibold rounded-md px-2.5 py-1 border shadow-xs transition-opacity cursor-pointer focus:outline-hidden focus:ring-2 focus:ring-blue-500 ${getStatusColor(
          initialStatus
        )} ${isPending ? 'opacity-50 pointer-events-none' : ''}`}
      >
        <option value="pending">Pending</option>
        <option value="in_progress">In Progress</option>
        <option value="completed">Completed</option>
      </select>
    </div>
  );
}
