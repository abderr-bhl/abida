import Parser from 'rss-parser';
import fs from 'fs/promises';
import path from 'path';
import { BenchmarkRecord, Task } from '../../types';

const parser = new Parser();
const DATA_DIR = path.join(process.cwd(), 'data');
const BENCHMARKS_FILE = path.join(DATA_DIR, 'benchmarks.json');
const TASKS_FILE = path.join(DATA_DIR, 'tasks.json');

const COMPETITORS = [
  { name: 'Wirecutter', url: 'https://www.nytimes.com/wirecutter/feed/' },
  { name: 'RTINGS', url: 'https://www.rtings.com/rss/news.rss' }
];

async function ensureDataDir() {
  try {
    await fs.mkdir(DATA_DIR, { recursive: true });
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code !== 'EROFS') {
      console.error('Error creating data directory:', error);
    }
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
    // NOTE: In a serverless production environment (like Vercel),
    // the filesystem is often read-only (EROFS).
    // For a production-ready application, replace this local file
    // storage with a database like PostgreSQL (Vercel Postgres),
    // Redis (Upstash), or MongoDB.
    await fs.writeFile(filePath, JSON.stringify(data, null, 2));
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code === 'EROFS') {
      console.warn(`Read-only filesystem (EROFS): Could not save to ${filePath}. In production, use a database.`);
    } else {
      console.error(`Error saving data to ${filePath}:`, error);
    }
  }
}

export async function runBenchmarking() {
  await ensureDataDir();

  const existingBenchmarks = await loadData<BenchmarkRecord>(BENCHMARKS_FILE);
  const existingTasks = await loadData<Task>(TASKS_FILE);

  const newBenchmarks: BenchmarkRecord[] = [...existingBenchmarks];
  const newTasks: Task[] = [...existingTasks];

  for (const competitor of COMPETITORS) {
    try {
      const feed = await parser.parseURL(competitor.url);

      for (const item of feed.items) {
        if (!item.link) continue;

        const alreadyScanned = existingBenchmarks.some(b => b.url === item.link);

        if (!alreadyScanned) {
          const record: BenchmarkRecord = {
            id: crypto.randomUUID(),
            url: item.link,
            title: item.title || 'Untitled',
            competitor: competitor.name,
            publishedAt: item.pubDate || new Date().toISOString(),
            scannedAt: new Date().toISOString()
          };

          newBenchmarks.push(record);

          const task: Task = {
            id: crypto.randomUUID(),
            title: `Respond to: ${record.title}`,
            description: `New content found on ${competitor.name}: ${record.url}. Evaluate if we need to cover this topic or update our existing guides.`,
            status: 'pending',
            priority: 'medium',
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
            sourceUrl: record.url,
            competitor: competitor.name
          };

          newTasks.push(task);
        }
      }
    } catch (error) {
      console.error(`Failed to fetch feed for ${competitor.name}:`, error);
    }
  }

  await saveData(BENCHMARKS_FILE, newBenchmarks);
  await saveData(TASKS_FILE, newTasks);

  return {
    scanned: COMPETITORS.length,
    newTasks: newTasks.length - existingTasks.length
  };
}
