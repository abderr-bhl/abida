import Parser from 'rss-parser';
import { BenchmarkRecord, Task } from '@/types';
import fs from 'fs';
import path from 'path';

const parser = new Parser();

const COMPETITOR_FEEDS = [
  { name: 'Wirecutter', url: 'https://www.nytimes.com/wirecutter/feed/' },
  { name: 'RTINGS', url: 'https://www.rtings.com/rss/news.rss' }
];

export async function fetchCompetitorFeeds(): Promise<BenchmarkRecord[]> {
  const records: BenchmarkRecord[] = [];

  for (const feed of COMPETITOR_FEEDS) {
    try {
      const feedData = await parser.parseURL(feed.url);

      feedData.items.forEach(item => {
        records.push({
          id: crypto.randomUUID(),
          competitor: feed.name,
          title: item.title || 'No Title',
          url: item.link || '',
          publishedDate: item.pubDate || new Date().toISOString(),
          category: item.categories?.[0] || 'Uncategorized',
          identifiedAt: new Date().toISOString()
        });
      });
    } catch (error) {
      console.error(`Error fetching feed from ${feed.name}:`, error);
    }
  }

  return records;
}

// Utility functions for data persistence
const TASKS_FILE = path.join(process.cwd(), 'src/lib/tasks.json');
const BENCHMARKS_FILE = path.join(process.cwd(), 'src/lib/benchmarks.json');

export function saveData(filepath: string, data: unknown): void {
  try {
    fs.writeFileSync(filepath, JSON.stringify(data, null, 2));
  } catch (error) {
    console.error(`Error saving data to ${filepath}:`, error);
  }
}

export function loadData<T>(filepath: string): T[] {
  try {
    if (fs.existsSync(filepath)) {
      const content = fs.readFileSync(filepath, 'utf-8');
      return JSON.parse(content) as T[];
    }
  } catch (error) {
    console.error(`Error loading data from ${filepath}:`, error);
  }
  return [];
}

export async function runAutomationCycle(): Promise<{ newTasks: number; totalBenchmarks: number }> {
  const newBenchmarks = await fetchCompetitorFeeds();
  const existingBenchmarks = loadData<BenchmarkRecord>(BENCHMARKS_FILE);
  const existingTasks = loadData<Task>(TASKS_FILE);

  const freshBenchmarks = newBenchmarks.filter(
    nb => !existingBenchmarks.some(eb => eb.url === nb.url)
  );

  const newTasks: Task[] = freshBenchmarks.map(benchmark => ({
    id: crypto.randomUUID(),
    title: `Analyze and respond to: ${benchmark.title}`,
    description: `Competitor ${benchmark.competitor} published a new article: "${benchmark.title}". We need to assess if we should update our content or create a new review/guide.`,
    type: 'research',
    status: 'todo',
    priority: benchmark.title.toLowerCase().includes('best') ? 'high' : 'medium',
    competitorUrl: benchmark.url,
    createdAt: new Date().toISOString()
  }));

  const updatedBenchmarks = [...existingBenchmarks, ...freshBenchmarks];
  const updatedTasks = [...existingTasks, ...newTasks];

  saveData(BENCHMARKS_FILE, updatedBenchmarks);
  saveData(TASKS_FILE, updatedTasks);

  return {
    newTasks: newTasks.length,
    totalBenchmarks: updatedBenchmarks.length
  };
}
