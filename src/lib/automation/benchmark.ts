import Parser from 'rss-parser';
import fs from 'fs/promises';
import path from 'path';
import { Task, BenchmarkRecord } from '../../types';

const parser = new Parser();

const FEEDS = [
  { name: 'Wirecutter', url: 'https://www.nytimes.com/wirecutter/feed/' },
  { name: 'RTINGS', url: 'https://www.rtings.com/rss/news.rss' }
];

const DATA_DIR = path.join(process.cwd(), 'data');
const TASKS_FILE = path.join(DATA_DIR, 'tasks.json');
const BENCHMARKS_FILE = path.join(DATA_DIR, 'benchmarks.json');

async function ensureDataDir() {
  try {
    await fs.mkdir(DATA_DIR, { recursive: true });
  } catch (error) {
    console.error('Failed to create data directory:', error);
  }
}

async function loadData<T>(filePath: string): Promise<T[]> {
  try {
    const data = await fs.readFile(filePath, 'utf-8');
    return JSON.parse(data);
  } catch {
    return [];
  }
}

async function saveData(filePath: string, data: unknown) {
  try {
    await fs.writeFile(filePath, JSON.stringify(data, null, 2));
  } catch (error) {
    if (error instanceof Error && (error as NodeJS.ErrnoException).code === 'EROFS') {
      console.warn(`Warning: Read-only filesystem at ${filePath}. Data not saved.`);
    } else {
      throw error;
    }
  }
}

export async function runBenchmark() {
  await ensureDataDir();

  const existingBenchmarks = await loadData<BenchmarkRecord>(BENCHMARKS_FILE);
  const existingTasks = await loadData<Task>(TASKS_FILE);

  const newBenchmarks: BenchmarkRecord[] = [...existingBenchmarks];
  const newTasks: Task[] = [...existingTasks];

  let tasksCreated = 0;

  for (const feedSource of FEEDS) {
    try {
      const feed = await parser.parseURL(feedSource.url);

      for (const item of feed.items) {
        if (!item.link || !item.title) continue;

        const alreadyProcessed = existingBenchmarks.some(b => b.url === item.link);
        if (alreadyProcessed) continue;

        // New content found
        const benchmarkId = crypto.randomUUID();
        const taskId = crypto.randomUUID();

        newBenchmarks.push({
          id: benchmarkId,
          url: item.link,
          title: item.title,
          competitor: feedSource.name as 'Wirecutter' | 'RTINGS',
          publishedAt: item.pubDate || new Date().toISOString(),
          processedAt: new Date().toISOString()
        });

        newTasks.push({
          id: taskId,
          title: `Analyze: ${item.title}`,
          description: `Competitor ${feedSource.name} published a new article. Evaluate if we need a similar guide or review.`,
          sourceUrl: item.link,
          competitor: feedSource.name as 'Wirecutter' | 'RTINGS',
          status: 'pending',
          priority: 'medium',
          createdAt: new Date().toISOString()
        });

        tasksCreated++;
      }
    } catch (error) {
      console.error(`Error processing feed ${feedSource.name}:`, error);
    }
  }

  if (tasksCreated > 0) {
    await saveData(BENCHMARKS_FILE, newBenchmarks);
    await saveData(TASKS_FILE, newTasks);
  }

  return { tasksCreated };
}
