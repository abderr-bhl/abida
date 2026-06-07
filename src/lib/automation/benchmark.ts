import Parser from 'rss-parser';
import fs from 'fs';
import path from 'path';
import { Task, BenchmarkRecord } from '../../types';

const parser = new Parser();
// NOTE: For this demo, we use local JSON files for persistence.
// In a production environment (like Vercel), you should use a database like Vercel Postgres or Redis.
const TASKS_FILE = path.join(process.cwd(), 'data/tasks.json');
const BENCHMARKS_FILE = path.join(process.cwd(), 'data/benchmarks.json');

const COMPETITORS = [
  { name: 'Wirecutter', url: 'https://www.nytimes.com/wirecutter/feed/' },
  { name: 'RTINGS', url: 'https://www.rtings.com/rss/news.rss' }
];

async function loadData<T>(filePath: string): Promise<T[]> {
  try {
    if (!fs.existsSync(filePath)) return [];
    const content = fs.readFileSync(filePath, 'utf-8');
    return JSON.parse(content);
  } catch (error) {
    console.error(`Error loading ${filePath}:`, error);
    return [];
  }
}

async function saveData(filePath: string, data: unknown): Promise<void> {
  try {
    const dir = path.dirname(filePath);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    fs.writeFileSync(filePath, JSON.stringify(data, null, 2));
  } catch (error: unknown) {
    // Handle read-only filesystem errors in serverless environments
    if (error instanceof Error && (error as NodeJS.ErrnoException).code === 'EROFS') {
      console.warn('Filesystem is read-only. Skipping save.');
    } else {
      throw error;
    }
  }
}

export async function runBenchmarking() {
  const existingTasks = await loadData<Task>(TASKS_FILE);
  const existingBenchmarks = await loadData<BenchmarkRecord>(BENCHMARKS_FILE);
  const newBenchmarks: BenchmarkRecord[] = [...existingBenchmarks];
  const newTasks: Task[] = [...existingTasks];

  for (const competitor of COMPETITORS) {
    try {
      const feed = await parser.parseURL(competitor.url);

      for (const item of feed.items) {
        const alreadyScanned = existingBenchmarks.find(b => b.url === item.link);
        if (alreadyScanned) continue;

        const record: BenchmarkRecord = {
          id: crypto.randomUUID(),
          competitor: competitor.name,
          articleTitle: item.title || 'Untitled',
          url: item.link || '',
          publishedAt: item.pubDate || new Date().toISOString(),
          scannedAt: new Date().toISOString(),
          isCovered: false
        };

        newBenchmarks.push(record);

        // Simple logic: create a task for every new competitor article
        const task: Task = {
          id: crypto.randomUUID(),
          title: `Analyze: ${record.articleTitle}`,
          description: `New article from ${competitor.name}. Evaluate if we need to cover this topic or update existing content.`,
          status: 'pending',
          priority: 'medium',
          sourceUrl: record.url,
          createdAt: new Date().toISOString(),
          category: 'Competitive Analysis'
        };

        newTasks.push(task);
      }
    } catch (error) {
      console.error(`Error fetching feed from ${competitor.name}:`, error);
    }
  }

  await saveData(BENCHMARKS_FILE, newBenchmarks);
  await saveData(TASKS_FILE, newTasks);

  return { tasksCreated: newTasks.length - existingTasks.length };
}
