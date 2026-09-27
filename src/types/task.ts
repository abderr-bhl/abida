export type TaskStatus = 'pending' | 'in_progress' | 'completed';

export interface BenchmarkTask {
  id: string;
  title: string;
  description: string;
  competitor: string;
  category: string;
  status: TaskStatus;
  createdAt: string;
  url?: string;
}
