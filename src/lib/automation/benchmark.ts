import Parser from 'rss-parser';
import fs from 'fs/promises';
import path from 'path';
import { Task, BenchmarkRecord } from '@/types';
import crypto from 'crypto';

// NOTE: For demonstration. In a Vercel production environment, use a database (e.g., PostgreSQL).
const DATA_DIR = path.join(process.cwd(), 'data');
const TASKS_FILE = path.join(DATA_DIR, 'tasks.json');
const BENCHMARK_FILE = path.join(DATA_DIR, 'benchmark.json');

const parser = new Parser();

const COMPETITORS = [
  {
    name: 'Wirecutter',
    rssUrl: 'https://www.nytimes.com/wirecutter/feed/',
  },
  {
    name: 'RTINGS',
    rssUrl: 'https://www.rtings.com/rss/reviews.xml',
  },
];

async function ensureDataDir() {
  try {
    await fs.mkdir(DATA_DIR, { recursive: true });
  } catch {
    // Ignore if it already exists
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
  } catch (error: unknown) {
    if (error instanceof Error && (error as NodeJS.ErrnoException).code === 'EROFS') {
      console.warn(`Warning: Read-only filesystem at ${filePath}. Data not saved.`);
    } else {
      throw error;
    }
  }
}

export async function runBenchmark() {
  await ensureDataDir();
  const tasks = await loadData<Task>(TASKS_FILE);
  const records = await loadData<BenchmarkRecord>(BENCHMARK_FILE);

  const newTasks: Task[] = [];
  const updatedRecords: BenchmarkRecord[] = [...records];

  for (const competitor of COMPETITORS) {
    try {
      console.log(`Checking ${competitor.name}...`);
      const feed = await parser.parseURL(competitor.rssUrl);

      let record = updatedRecords.find(r => r.competitor === competitor.name);
      if (!record) {
        record = {
          id: crypto.randomUUID(),
          competitor: competitor.name,
          lastChecked: new Date(0).toISOString(),
          lastArticleTitle: '',
          lastArticleUrl: ''
        };
        updatedRecords.push(record);
      }

      const items = feed.items.filter(item => {
        const itemDate = new Date(item.pubDate || 0);
        const lastCheckedDate = new Date(record!.lastChecked);
        return itemDate > lastCheckedDate;
      });

      for (const item of items) {
        const taskId = crypto.randomUUID();
        const newTask: Task = {
          id: taskId,
          title: `Review: ${item.title}`,
          description: `Competitor ${competitor.name} just published: ${item.title}. We should consider creating a similar guide or review.`,
          status: 'pending',
          priority: 'medium',
          sourceUrl: item.link || '',
          competitor: competitor.name,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        };
        newTasks.push(newTask);
      }

      if (items.length > 0) {
        record.lastChecked = new Date().toISOString();
        record.lastArticleTitle = items[0].title || '';
        record.lastArticleUrl = items[0].link || '';
      }

    } catch (error) {
      console.error(`Error benchmarking ${competitor.name}:`, error);
    }
  }

  if (newTasks.length > 0) {
    await saveData(TASKS_FILE, [...newTasks, ...tasks]);
  }
  await saveData(BENCHMARK_FILE, updatedRecords);

  return {
    tasksCreated: newTasks.length,
    competitorsChecked: COMPETITORS.length
  };
}
