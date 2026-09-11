export type TaskStatus = 'pending' | 'in_progress' | 'completed' | 'dismissed';

export type CompetitorSource = 'Wirecutter' | 'RTINGS' | 'Other';

export interface Task {
  id: string;
  title: string;
  description: string;
  source: CompetitorSource;
  sourceUrl: string;
  status: TaskStatus;
  createdAt: string;
  updatedAt: string;
  suggestedAction?: string;
}
