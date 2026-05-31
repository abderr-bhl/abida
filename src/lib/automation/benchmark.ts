import Parser from 'rss-parser';
import fs from 'fs';
import path from 'path';
import { Task, BenchmarkRecord } from '../../types';

const parser = new Parser();
const DATA_DIR = path.join(process.cwd(), 'data');
const TASKS_FILE = path.join(DATA_DIR, 'tasks.json');
const BENCHMARK_FILE = path.join(DATA_DIR, 'benchmarks.json');

const FEEDS = [
  { name: 'Wirecutter', url: 'https://www.nytimes.com/wirecutter/feed/' },
  { name: 'RTINGS', url: 'https://www.rtings.com/rss/news.rss' }
];

async function loadData<T>(filePath: string, defaultData: T): Promise<T> {
  try {
    if (fs.existsSync(filePath)) {
      const content = fs.readFileSync(filePath, 'utf-8');
      return JSON.parse(content) as T;
    }
  } catch (error) {
    console.error(`Error loading ${filePath}:`, error);
  }
  return defaultData;
}

async function saveData(filePath: string, data: unknown): Promise<void> {
  try {
    // Note: Local JSON persistence is for demonstration.
    // In production serverless environments like Vercel, the filesystem is read-only.
    // A database (e.g., Postgres, Supabase) should be used for persistent storage.
    fs.writeFileSync(filePath, JSON.stringify(data, null, 2));
  } catch (error) {
    if (error instanceof Error && (error as NodeJS.ErrnoException).code === 'EROFS') {
      console.warn(`Warning: Read-only filesystem detected at ${filePath}. Task data will not persist across restarts.`);
    } else {
      console.error(`Error saving ${filePath}:`, error);
    }
  }
}

export async function runBenchmarking() {
  const benchmark = await loadData<BenchmarkRecord>(BENCHMARK_FILE, {
    id: crypto.randomUUID(),
    lastRun: new Date().toISOString(),
    processedUrls: []
  });

  const existingTasks = await loadData<Task[]>(TASKS_FILE, []);
  const newTasks: Task[] = [];

  for (const feed of FEEDS) {
    try {
      const feedData = await parser.parseURL(feed.url);

      for (const item of feedData.items) {
        if (!item.link || benchmark.processedUrls.includes(item.link)) continue;

        const newTask: Task = {
          id: crypto.randomUUID(),
          title: `Analyze: ${item.title || 'Untitled'}`,
          description: `New content detected from ${feed.name}: ${item.contentSnippet || 'No description available'}`,
          sourceUrl: item.link,
          competitor: feed.name as 'Wirecutter' | 'RTINGS',
          status: 'pending',
          priority: 'medium',
          createdAt: new Date().toISOString()
        };

        newTasks.push(newTask);
        benchmark.processedUrls.push(item.link);
      }
    } catch (error) {
      console.error(`Error processing feed ${feed.name}:`, error);
    }
  }

  if (newTasks.length > 0) {
    await saveData(TASKS_FILE, [...existingTasks, ...newTasks]);
  }

  benchmark.lastRun = new Date().toISOString();
  await saveData(BENCHMARK_FILE, benchmark);

  return {
    tasksCreated: newTasks.length,
    totalTasks: existingTasks.length + newTasks.length
  };
}
