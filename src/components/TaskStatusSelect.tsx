'use client';

import React, { useTransition } from 'react';

interface TaskStatusSelectProps {
  taskId: string;
  currentStatus: string;
  onStatusChange: (taskId: string, newStatus: string) => Promise<void>;
}

export default function TaskStatusSelect({
  taskId,
  currentStatus,
  onStatusChange,
}: TaskStatusSelectProps) {
  const [isPending, startTransition] = useTransition();

  const handleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newStatus = e.target.value;
    startTransition(async () => {
      await onStatusChange(taskId, newStatus);
    });
  };

  return (
    <select
      value={currentStatus}
      disabled={isPending}
      onChange={handleChange}
      className="text-xs font-semibold rounded-md border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-200 py-1 px-2 focus:outline-none focus:ring-2 focus:ring-primary"
    >
      <option value="pending">Pending</option>
      <option value="in-progress">In Progress</option>
      <option value="completed">Completed</option>
      <option value="dismissed">Dismissed</option>
    </select>
  );
}
