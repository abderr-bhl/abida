'use client';

import { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { triggerBenchmarkAction, updateTaskStatusAction } from './actions';
import { logoutAction } from '../login/actions';
import { Task, BenchmarkRecord } from '@/types';
import { sanitizeUrl } from '@/lib/sanitize';

interface Props {
  initialTasks: Task[];
  initialBenchmarks: BenchmarkRecord[];
}

export default function TasksDashboardClient({ initialTasks, initialBenchmarks }: Props) {
  const router = useRouter();
  const [tasks, setTasks] = useState<Task[]>(initialTasks);
  const [benchmarks, setBenchmarks] = useState<BenchmarkRecord[]>(initialBenchmarks);
  const [isPending, startTransition] = useTransition();

  const [competitorFilter, setCompetitorFilter] = useState<'All' | 'Wirecutter' | 'RTINGS'>('All');
  const [statusFilter, setStatusFilter] = useState<'All' | 'pending' | 'completed' | 'ignored'>('All');

  const handleRunBenchmark = () => {
    startTransition(async () => {
      const res = await triggerBenchmarkAction();
      if (res.success && res.record) {
        const record = res.record;
        setBenchmarks(prev => [record, ...prev]);
        router.refresh();
        alert(`Benchmark run successfully! Generated ${record.tasksGeneratedCount} new tasks.`);
        window.location.reload();
      } else {
        alert(`Failed to run benchmark: ${res.error || 'Unknown error'}`);
      }
    });
  };

  const handleStatusChange = async (taskId: string, newStatus: 'pending' | 'completed' | 'ignored') => {
    const res = await updateTaskStatusAction(taskId, newStatus);
    if (res.success) {
      setTasks(prev => prev.map(t => t.id === taskId ? { ...t, status: newStatus } : t));
      router.refresh();
    } else {
      alert(`Failed to update status: ${res.error || 'Unknown error'}`);
    }
  };

  const handleLogout = async () => {
    await logoutAction();
    router.push('/admin/login');
  };

  const filteredTasks = tasks.filter(task => {
    const matchComp = competitorFilter === 'All' || task.competitor === competitorFilter;
    const matchStatus = statusFilter === 'All' || task.status === statusFilter;
    return matchComp && matchStatus;
  });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center pb-6 border-b border-gray-200 dark:border-gray-800 gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-extrabold text-gray-900 dark:text-white">Admin Task Dashboard</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
            Manage tasks generated from competitor content benchmarking.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={handleLogout}
            className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary dark:bg-gray-800 dark:text-gray-300 dark:border-gray-700 dark:hover:bg-gray-700"
          >
            Logout
          </button>
        </div>
      </div>

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        {/* Left Column: Benchmarking Controls & History */}
        <div className="lg:col-span-1 space-y-6">
          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200 dark:bg-gray-900 dark:border-gray-800">
            <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-4">Benchmark Automation</h2>
            <p className="text-xs text-gray-500 dark:text-gray-400 mb-4">
              Daily benchmarking runs automatically at 05:00 UTC. Use the button below to trigger it manually.
            </p>
            <button
              onClick={handleRunBenchmark}
              disabled={isPending}
              className="w-full flex items-center justify-center px-4 py-2.5 border border-transparent text-sm font-medium rounded-md text-white bg-primary hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary disabled:opacity-50"
            >
              {isPending ? 'Running...' : 'Run Benchmark Now'}
            </button>
          </div>

          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200 dark:bg-gray-900 dark:border-gray-800">
            <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-3">Run History</h2>
            {benchmarks.length === 0 ? (
              <p className="text-xs text-gray-400">No benchmarks run yet.</p>
            ) : (
              <div className="space-y-3 max-h-60 overflow-y-auto pr-1">
                {benchmarks.slice(0, 10).map((record) => (
                  <div key={record.id} className="p-3 bg-gray-50 rounded dark:bg-gray-800/50 border border-gray-100 dark:border-gray-800">
                    <div className="flex justify-between items-center">
                      <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded uppercase ${
                        record.status === 'success' ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400' : 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400'
                      }`}>
                        {record.status}
                      </span>
                      <span className="text-[10px] text-gray-400">
                        {new Date(record.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>
                    <p className="text-xs font-semibold text-gray-700 dark:text-gray-300 mt-1">
                      +{record.tasksGeneratedCount} tasks
                    </p>
                    <p className="text-[10px] text-gray-400">
                      {new Date(record.timestamp).toLocaleDateString()}
                    </p>
                    {record.error && (
                      <p className="text-[10px] text-red-500 mt-1 truncate" title={record.error}>
                        Err: {record.error}
                      </p>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Right Column: Tasks List & Filters */}
        <div className="lg:col-span-3 space-y-6">
          {/* Filters Bar */}
          <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-200 flex flex-wrap gap-4 items-center justify-between dark:bg-gray-900 dark:border-gray-800">
            <div className="flex flex-wrap gap-3 items-center">
              <div>
                <span className="text-xs font-semibold text-gray-500 mr-2 uppercase">Competitor:</span>
                <select
                  value={competitorFilter}
                  onChange={(e) => setCompetitorFilter(e.target.value as 'All' | 'Wirecutter' | 'RTINGS')}
                  className="text-xs bg-gray-50 border border-gray-300 text-gray-900 rounded-lg focus:ring-primary focus:border-primary p-2 dark:bg-gray-800 dark:border-gray-700 dark:text-white"
                >
                  <option value="All">All Competitors</option>
                  <option value="Wirecutter">Wirecutter</option>
                  <option value="RTINGS">RTINGS</option>
                </select>
              </div>

              <div>
                <span className="text-xs font-semibold text-gray-500 mr-2 uppercase">Status:</span>
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value as 'All' | 'pending' | 'completed' | 'ignored')}
                  className="text-xs bg-gray-50 border border-gray-300 text-gray-900 rounded-lg focus:ring-primary focus:border-primary p-2 dark:bg-gray-800 dark:border-gray-700 dark:text-white"
                >
                  <option value="All">All Statuses</option>
                  <option value="pending">Pending</option>
                  <option value="completed">Completed</option>
                  <option value="ignored">Ignored</option>
                </select>
              </div>
            </div>

            <div className="text-xs text-gray-500 font-medium">
              Showing {filteredTasks.length} tasks
            </div>
          </div>

          {/* Tasks Container */}
          {filteredTasks.length === 0 ? (
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-12 text-center dark:bg-gray-900 dark:border-gray-800">
              <p className="text-gray-500 dark:text-gray-400">No tasks match your filter criteria.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {filteredTasks.map((task) => {
                const sanitizedUrl = sanitizeUrl(task.url);
                return (
                  <div
                    key={task.id}
                    className="bg-white p-6 rounded-xl shadow-sm border border-gray-200 dark:bg-gray-900 dark:border-gray-800 hover:shadow-md transition-shadow relative"
                  >
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                      <div className="space-y-1 flex-grow">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className={`text-[10px] font-extrabold px-2 py-0.5 rounded-full ${
                            task.competitor === 'Wirecutter' ? 'bg-blue-100 text-blue-900 dark:bg-blue-900/30 dark:text-blue-400' : 'bg-purple-100 text-purple-900 dark:bg-purple-900/30 dark:text-purple-400'
                          }`}>
                            {task.competitor}
                          </span>
                          <span className={`text-[10px] font-extrabold px-2 py-0.5 rounded-full uppercase ${
                            task.status === 'pending'
                              ? 'bg-yellow-100 text-yellow-900 dark:bg-yellow-900/30 dark:text-yellow-400'
                              : task.status === 'completed'
                              ? 'bg-green-100 text-green-900 dark:bg-green-900/30 dark:text-green-400'
                              : 'bg-gray-100 text-gray-900 dark:bg-gray-800 dark:text-gray-400'
                          }`}>
                            {task.status}
                          </span>
                        </div>
                        <h3 className="text-lg font-bold text-gray-900 dark:text-white leading-snug">
                          {task.title}
                        </h3>
                        <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-2">
                          {task.description}
                        </p>
                        <div className="pt-2 flex items-center gap-4 text-xs font-medium">
                          <a
                            href={sanitizedUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-primary hover:underline inline-flex items-center gap-1"
                          >
                            <span>View Competitor Article</span>
                            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                              <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 6H5.25A2.25 2.25 0 0 0 3 8.25v10.5A2.25 2.25 0 0 0 5.25 21h10.5A2.25 2.25 0 0 0 18 18.75V10.5m-10.5 6L21 3m0 0h-5.25M21 3v5.25" />
                            </svg>
                          </a>
                          <span className="text-gray-300 dark:text-gray-700">|</span>
                          <span className="text-gray-400">
                            Created {new Date(task.createdAt).toLocaleString()}
                          </span>
                        </div>
                      </div>

                      {/* Action Controls */}
                      <div className="flex flex-row sm:flex-col items-center sm:items-end justify-between sm:justify-center gap-2 border-t sm:border-t-0 pt-4 sm:pt-0 border-gray-100 dark:border-gray-800">
                        <span className="text-xs text-gray-500 font-semibold uppercase sm:hidden">Update Status:</span>
                        <div className="flex gap-1">
                          <button
                            onClick={() => handleStatusChange(task.id, 'pending')}
                            disabled={task.status === 'pending'}
                            className={`px-2.5 py-1.5 text-xs font-semibold rounded-md transition-colors ${
                              task.status === 'pending'
                                ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400 cursor-default'
                                : 'bg-gray-50 text-gray-600 hover:bg-gray-100 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700'
                            }`}
                          >
                            Pending
                          </button>
                          <button
                            onClick={() => handleStatusChange(task.id, 'completed')}
                            disabled={task.status === 'completed'}
                            className={`px-2.5 py-1.5 text-xs font-semibold rounded-md transition-colors ${
                              task.status === 'completed'
                                ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400 cursor-default'
                                : 'bg-gray-50 text-gray-600 hover:bg-gray-100 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700'
                            }`}
                          >
                            Completed
                          </button>
                          <button
                            onClick={() => handleStatusChange(task.id, 'ignored')}
                            disabled={task.status === 'ignored'}
                            className={`px-2.5 py-1.5 text-xs font-semibold rounded-md transition-colors ${
                              task.status === 'ignored'
                                ? 'bg-gray-200 text-gray-800 dark:bg-gray-700 dark:text-gray-300 cursor-default'
                                : 'bg-gray-50 text-gray-600 hover:bg-gray-100 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700'
                            }`}
                          >
                            Ignore
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
