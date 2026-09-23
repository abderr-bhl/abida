'use client';

interface TaskStatusSelectProps {
  taskId: string;
  currentStatus: 'pending' | 'in_progress' | 'completed';
  action: (formData: FormData) => Promise<void>;
}

export default function TaskStatusSelect({ taskId, currentStatus, action }: TaskStatusSelectProps) {
  return (
    <form action={action} className="flex items-center gap-2">
      <input type="hidden" name="taskId" value={taskId} />
      <select
        name="status"
        defaultValue={currentStatus}
        onChange={(e) => e.target.form?.requestSubmit()}
        className="px-3 py-1.5 text-sm rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-900 text-gray-900 dark:text-white font-medium cursor-pointer"
      >
        <option value="pending">Pending</option>
        <option value="in_progress">In Progress</option>
        <option value="completed">Completed</option>
      </select>
    </form>
  );
}
