import Parser from 'rss-parser';
import fs from 'fs/promises';
import path from 'path';
import { Task, BenchmarkRecord } from '@/types';

const parser = new Parser();

const COMPETITORS = [
  { name: 'Wirecutter', url: 'https://www.nytimes.com/wirecutter/feed/' },
  { name: 'RTINGS', url: 'https://www.rtings.com/rss/news.rss' }
] as const;

const DATA_DIR = path.join(process.cwd(), 'data');
const TASKS_FILE = path.join(DATA_DIR, 'tasks.json');
const BENCHMARKS_FILE = path.join(DATA_DIR, 'benchmarks.json');

async function loadData<T>(filePath: string): Promise<T[]> {
  try {
    const data = await fs.readFile(filePath, 'utf-8');
    return JSON.parse(data);
  } catch (_error) {
    return [];
  }
}

async function saveData(filePath: string, data: unknown): Promise<void> {
  try {
    await fs.writeFile(filePath, JSON.stringify(data, null, 2));
  } catch (error) {
    const err = error as NodeJS.ErrnoException;
    if (err.code === 'EROFS') {
      console.warn(`File system is read-only. Cannot save to ${filePath}`);
    } else {
      throw error;
    }
  }
}

export async function runBenchmark() {
  const tasks = await loadData<Task>(TASKS_FILE);
  const benchmarks = await loadData<BenchmarkRecord>(BENCHMARKS_FILE);
  const newTasks: Task[] = [];
  const newBenchmarks: BenchmarkRecord[] = [];

  for (const competitor of COMPETITORS) {
    try {
      const feed = await parser.parseURL(competitor.url);

      for (const item of feed.items) {
        if (!item.link || !item.title) continue;

        // Check if we already processed this article
        const alreadyProcessed = benchmarks.some(b => b.articleUrl === item.link);
        if (alreadyProcessed) continue;

        const benchmark: BenchmarkRecord = {
          id: crypto.randomUUID(),
          timestamp: new Date().toISOString(),
          source: competitor.name,
          articleTitle: item.title,
          articleUrl: item.link
        };
        newBenchmarks.push(benchmark);

        const task: Task = {
          id: crypto.randomUUID(),
          title: `Analyze: ${item.title}`,
          sourceUrl: item.link,
          competitor: competitor.name,
          status: 'pending',
          createdAt: new Date().toISOString(),
          priority: 'medium',
          type: item.link.includes('review') ? 'review' : 'guide'
        };
        newTasks.push(task);
      }
    } catch (error) {
      console.error(`Error fetching feed for ${competitor.name}:`, error);
    }
  }

  if (newTasks.length > 0) {
    await saveData(TASKS_FILE, [...tasks, ...newTasks]);
    await saveData(BENCHMARKS_FILE, [...benchmarks, ...newBenchmarks]);
  }

  return {
    tasksCreated: newTasks.length,
    benchmarksAdded: newBenchmarks.length
  };
}
