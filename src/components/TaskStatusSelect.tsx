'use client';

import { useTransition } from 'react';
import { updateTaskStatusAction } from '@/app/admin/tasks/actions';
import { TaskStatus } from '@/types';

interface Props {
  taskId: string;
  initialStatus: TaskStatus;
}

export default function TaskStatusSelect({ taskId, initialStatus }: Props) {
  const [isPending, startTransition] = useTransition();

  const handleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newStatus = e.target.value as TaskStatus;
    startTransition(async () => {
      await updateTaskStatusAction(taskId, newStatus);
    });
  };

  const getStatusColor = (status: TaskStatus) => {
    switch (status) {
      case 'completed':
        return 'text-green-700 bg-green-50 border-green-300';
      case 'in_progress':
        return 'text-blue-700 bg-blue-50 border-blue-300';
      case 'dismissed':
        return 'text-gray-500 bg-gray-50 border-gray-300';
      default:
        return 'text-amber-800 bg-amber-50 border-amber-300';
    }
  };

  return (
    <div className="relative inline-block">
      <select
        defaultValue={initialStatus}
        onChange={handleChange}
        disabled={isPending}
        className={`text-xs font-semibold rounded-lg px-2.5 py-1.5 border transition-all cursor-pointer focus:ring-2 focus:ring-primary focus:outline-hidden ${getStatusColor(
          initialStatus
        )} ${isPending ? 'opacity-50 cursor-wait' : ''}`}
      >
        <option value="pending">Pending</option>
        <option value="in_progress">In Progress</option>
        <option value="completed">Completed</option>
        <option value="dismissed">Dismissed</option>
      </select>
    </div>
  );
}
