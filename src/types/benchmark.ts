export type TaskStatus = 'pending' | 'in_progress' | 'completed' | 'dismissed';
export type TaskPriority = 'low' | 'medium' | 'high';

export interface BenchmarkTask {
  id: string;
  title: string;
  description: string;
  competitor: string;
  sourceUrl: string;
  category: string;
  priority: TaskPriority;
  status: TaskStatus;
  createdAt: string;
  suggestedAngle?: string;
}

export interface CompetitorFeed {
  name: string;
  url: string;
  category: string;
}
