export type TaskStatus = 'pending' | 'in_progress' | 'completed' | 'cancelled';
export type TaskType = 'review' | 'guide' | 'comparison' | 'blog';

export interface Task {
  id: string;
  title: string;
  description: string;
  competitor: string;
  url: string;
  createdAt: string;
  status: TaskStatus;
  type: TaskType;
}
