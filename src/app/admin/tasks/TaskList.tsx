'use client';

import { Task } from '@/types';
import { updateTaskStatusAction } from './actions';
import { useState } from 'react';
import { CheckCircle, Clock, XCircle, ExternalLink } from 'lucide-react';
import { cn } from '@/lib/utils';

export function TaskList({ initialTasks }: { initialTasks: Task[] }) {
  const [tasks, setTasks] = useState(initialTasks);

  const handleStatusUpdate = async (id: string, status: Task['status']) => {
    const success = await updateTaskStatusAction(id, status);
    if (success) {
      setTasks(tasks.map(t => t.id === id ? { ...t, status } : t));
    }
  };

  if (tasks.length === 0) {
    return (
      <div className="p-12 text-center text-gray-500 dark:text-gray-400">
        No tasks found. Run a benchmark to generate tasks.
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-800">
        <thead className="bg-gray-50 dark:bg-gray-800/50">
          <tr>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider dark:text-gray-400">Task</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider dark:text-gray-400">Competitor</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider dark:text-gray-400">Status</th>
            <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider dark:text-gray-400">Actions</th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200 dark:bg-gray-900 dark:divide-gray-800">
          {tasks.map((task) => (
            <tr key={task.id} className="hover:bg-gray-50 dark:hover:bg-gray-800/30">
              <td className="px-6 py-4">
                <div className="text-sm font-medium text-gray-900 dark:text-white">{task.title}</div>
                <div className="text-xs text-gray-500 flex items-center mt-1">
                  <a href={task.sourceUrl} target="_blank" rel="noopener noreferrer" className="flex items-center hover:text-primary">
                    View Source <ExternalLink className="ml-1 w-3 h-3" />
                  </a>
                  <span className="mx-2">•</span>
                  {new Date(task.createdAt).toLocaleDateString()}
                </div>
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                {task.competitor}
              </td>
              <td className="px-6 py-4 whitespace-nowrap">
                <span className={cn(
                  "px-2 inline-flex text-xs leading-5 font-semibold rounded-full items-center",
                  task.status === 'pending' && "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400",
                  task.status === 'completed' && "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400",
                  task.status === 'ignored' && "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-400"
                )}>
                  {task.status === 'pending' && <Clock className="w-3 h-3 mr-1" />}
                  {task.status === 'completed' && <CheckCircle className="w-3 h-3 mr-1" />}
                  {task.status === 'ignored' && <XCircle className="w-3 h-3 mr-1" />}
                  {task.status}
                </span>
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                <div className="flex justify-end space-x-2">
                  <button
                    onClick={() => handleStatusUpdate(task.id, 'completed')}
                    className="text-green-600 hover:text-green-900 dark:text-green-400 dark:hover:text-green-300"
                    title="Mark as Completed"
                  >
                    <CheckCircle className="w-5 h-5" />
                  </button>
                  <button
                    onClick={() => handleStatusUpdate(task.id, 'ignored')}
                    className="text-gray-400 hover:text-gray-600 dark:text-gray-500 dark:hover:text-gray-300"
                    title="Ignore Task"
                  >
                    <XCircle className="w-5 h-5" />
                  </button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
