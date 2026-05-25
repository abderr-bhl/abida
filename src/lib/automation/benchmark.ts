import Parser from 'rss-parser';
import fs from 'fs';
import path from 'path';
import crypto from 'crypto';
import { Task, BenchmarkRecord } from '@/types';

const parser = new Parser();
const BENCHMARKS_FILE = path.join(process.cwd(), 'src/lib/benchmarks.json');
const TASKS_FILE = path.join(process.cwd(), 'src/lib/tasks.json');

const COMPETITORS = [
  { name: 'Wirecutter', feed: 'https://www.nytimes.com/wirecutter/feed/' },
  { name: 'RTINGS', feed: 'https://www.rtings.com/rss/reviews.xml' }
];

async function loadData<T>(filePath: string): Promise<T[]> {
  try {
    if (fs.existsSync(filePath)) {
      const data = fs.readFileSync(filePath, 'utf8');
      return JSON.parse(data);
    }
  } catch (error) {
    console.error(`Error loading ${filePath}:`, error);
  }
  return [];
}

async function saveData(filePath: string, data: unknown): Promise<void> {
  try {
    fs.writeFileSync(filePath, JSON.stringify(data, null, 2));
  } catch (error) {
    // In serverless environments, this might fail due to read-only filesystem.
    console.warn(`Could not save to ${filePath} (possibly read-only FS):`, error);
  }
}

export async function runBenchmarking() {
  const existingBenchmarks = await loadData<BenchmarkRecord>(BENCHMARKS_FILE);
  const existingTasks = await loadData<Task>(TASKS_FILE);
  const newBenchmarks: BenchmarkRecord[] = [...existingBenchmarks];
  const newTasks: Task[] = [...existingTasks];

  for (const competitor of COMPETITORS) {
    try {
      const feed = await parser.parseURL(competitor.feed);

      for (const item of feed.items) {
        const alreadyIndexed = existingBenchmarks.find(b => b.url === item.link);

        if (!alreadyIndexed && item.link && item.title) {
          const newRecord: BenchmarkRecord = {
            id: crypto.randomUUID(),
            url: item.link,
            title: item.title,
            competitor: competitor.name,
            lastChecked: new Date().toISOString()
          };
          newBenchmarks.push(newRecord);

          const newTask: Task = {
            id: crypto.randomUUID(),
            title: `Analyze competitor article: ${item.title}`,
            description: `A new article was published by ${competitor.name}. Analyze it for content gaps and potential response.`,
            status: 'pending',
            priority: 'medium',
            createdAt: new Date().toISOString(),
            sourceUrl: item.link,
            competitor: competitor.name
          };
          newTasks.push(newTask);
        }
      }
    } catch (error) {
      console.error(`Error fetching feed for ${competitor.name}:`, error);
    }
  }

  await saveData(BENCHMARKS_FILE, newBenchmarks);
  await saveData(TASKS_FILE, newTasks);

  return {
    tasksCreated: newTasks.length - existingTasks.length,
    totalTasks: newTasks.length
  };
}
