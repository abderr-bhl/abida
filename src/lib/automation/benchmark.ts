import Parser from 'rss-parser';
import fs from 'fs/promises';
import path from 'path';
import { Task, BenchmarkRecord } from '../../types';

const parser = new Parser();
const DATA_DIR = path.join(process.cwd(), 'data');
const TASKS_FILE = path.join(DATA_DIR, 'tasks.json');
const BENCHMARKS_FILE = path.join(DATA_DIR, 'benchmarks.json');

const COMPETITORS = [
  { name: 'Wirecutter', rss: 'https://www.nytimes.com/wirecutter/feed/' },
  { name: 'RTINGS', rss: 'https://www.rtings.com/rss/news.rss' }
];

async function ensureDataDir() {
  try {
    await fs.mkdir(DATA_DIR, { recursive: true });
  } catch (error) {
    const err = error as NodeJS.ErrnoException;
    if (err.code !== 'EEXIST' && err.code !== 'EROFS') {
      throw error;
    }
  }
}

async function loadData<T>(filePath: string): Promise<T[]> {
  try {
    const data = await fs.readFile(filePath, 'utf-8');
    return JSON.parse(data);
  } catch (error) {
    const err = error as NodeJS.ErrnoException;
    if (err.code === 'ENOENT') {
      return [];
    }
    // In some serverless environments, it might be read-only
    console.error(`Error reading ${filePath}:`, error);
    return [];
  }
}

async function saveData(filePath: string, data: unknown): Promise<boolean> {
  try {
    await ensureDataDir();
    await fs.writeFile(filePath, JSON.stringify(data, null, 2));
    return true;
  } catch (error) {
    const err = error as NodeJS.ErrnoException;
    if (err.code === 'EROFS') {
      console.warn(`File system is read-only. Cannot save to ${filePath}`);
      return false;
    }
    console.error(`Error saving to ${filePath}:`, error);
    return false;
  }
}

export async function runBenchmark() {
  console.log('Starting competitive benchmark...');
  const existingBenchmarks = await loadData<BenchmarkRecord>(BENCHMARKS_FILE);
  const existingTasks = await loadData<Task>(TASKS_FILE);

  const newBenchmarks: BenchmarkRecord[] = [];
  const newTasks: Task[] = [];

  for (const competitor of COMPETITORS) {
    try {
      console.log(`Fetching feed for ${competitor.name}...`);
      const feed = await parser.parseURL(competitor.rss);

      for (const item of feed.items) {
        if (!item.link || !item.title) continue;

        const alreadyProcessed = existingBenchmarks.some(b => b.articleUrl === item.link);
        if (!alreadyProcessed) {
          const benchmark: BenchmarkRecord = {
            id: crypto.randomUUID(),
            competitor: competitor.name,
            articleTitle: item.title,
            articleUrl: item.link,
            scrapedAt: new Date().toISOString(),
            processed: true
          };
          newBenchmarks.push(benchmark);

          // Generate a task based on this competitor article
          const task: Task = {
            id: crypto.randomUUID(),
            title: `Analyze and respond to: ${item.title}`,
            description: `Competitor ${competitor.name} published a new article: "${item.title}". Evaluate if we need a similar guide or an update to our existing content.`,
            sourceUrl: item.link,
            status: 'pending',
            createdAt: new Date().toISOString(),
            priority: 'medium'
          };
          newTasks.push(task);
        }
      }
    } catch (error) {
      console.error(`Failed to fetch ${competitor.name} feed:`, error);
    }
  }

  if (newBenchmarks.length > 0) {
    const updatedBenchmarks = [...existingBenchmarks, ...newBenchmarks];
    const updatedTasks = [...existingTasks, ...newTasks];

    await saveData(BENCHMARKS_FILE, updatedBenchmarks);
    await saveData(TASKS_FILE, updatedTasks);

    console.log(`Benchmark complete. Found ${newBenchmarks.length} new items.`);
  } else {
    console.log('No new items found during benchmark.');
  }

  return {
    newItemsCount: newBenchmarks.length,
    tasksCreated: newTasks.length
  };
}
