export type TaskStatus = 'pending' | 'in_progress' | 'completed';

export interface CompetitorRSSItem {
  title: string;
  link: string;
  pubDate?: string;
  contentSnippet?: string;
  source: 'Wirecutter' | 'RTINGS' | string;
}

export interface BenchmarkTask {
  id: string;
  title: string;
  description: string;
  competitorUrl: string;
  competitorSource: string;
  status: TaskStatus;
  createdAt: string;
  updatedAt: string;
}

export type TaskFilter = 'all' | TaskStatus;
