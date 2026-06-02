import Parser from 'rss-parser';
import fs from 'fs';
import path from 'path';
import { Task, BenchmarkRecord } from '@/types';

const parser = new Parser();

const FEEDS = [
  { name: 'Wirecutter', url: 'https://www.nytimes.com/wirecutter/feed/' },
  { name: 'RTINGS', url: 'https://www.rtings.com/rss/news.rss' }
];

const DATA_DIR = path.join(process.cwd(), 'data');
const TASKS_FILE = path.join(DATA_DIR, 'tasks.json');
const BENCHMARKS_FILE = path.join(DATA_DIR, 'benchmarks.json');

function ensureDataDir() {
  if (!fs.existsSync(DATA_DIR)) {
    try {
      fs.mkdirSync(DATA_DIR, { recursive: true });
    } catch (error) {
      console.error('Failed to create data directory:', error);
    }
  }
}

function loadData<T>(filePath: string): T[] {
  if (!fs.existsSync(filePath)) return [];
  try {
    const content = fs.readFileSync(filePath, 'utf-8');
    return JSON.parse(content);
  } catch (error) {
    console.error(`Failed to load data from ${filePath}:`, error);
    return [];
  }
}

function saveData(filePath: string, data: unknown) {
  try {
    fs.writeFileSync(filePath, JSON.stringify(data, null, 2));
  } catch (error) {
    // To satisfy TypeScript linting rules, cast caught errors to NodeJS.ErrnoException after verifying it's an Error
    if (error instanceof Error) {
      const err = error as NodeJS.ErrnoException;
      if (err.code === 'EROFS') {
        console.warn('Filesystem is read-only. Data not persisted.');
      } else {
        console.error(`Failed to save data to ${filePath}:`, error);
      }
    } else {
      console.error(`Failed to save data to ${filePath}:`, error);
    }
  }
}

export async function runBenchmark() {
  ensureDataDir();

  const tasks = loadData<Task>(TASKS_FILE);
  const benchmarks = loadData<BenchmarkRecord>(BENCHMARKS_FILE);
  const newTasks: Task[] = [];
  const newBenchmarks: BenchmarkRecord[] = [];

  for (const feed of FEEDS) {
    try {
      console.log(`Fetching feed: ${feed.name}`);
      const feedData = await parser.parseURL(feed.url);

      for (const item of feedData.items) {
        const alreadyExists = benchmarks.some(b => b.articleUrl === item.link);
        if (!alreadyExists) {
          const id = crypto.randomUUID();

          const record: BenchmarkRecord = {
            id,
            competitor: feed.name,
            articleTitle: item.title || 'No Title',
            articleUrl: item.link || '',
            discoveredAt: new Date().toISOString()
          };

          newBenchmarks.push(record);

          const task: Task = {
            id: crypto.randomUUID(),
            title: `Analyze: ${record.articleTitle}`,
            description: `Review competitor content from ${feed.name} and identify opportunities for ReviewGuid.`,
            status: 'pending',
            sourceUrl: record.articleUrl,
            competitor: feed.name,
            type: inferType(record.articleTitle),
            createdAt: record.discoveredAt
          };

          newTasks.push(task);
        }
      }
    } catch (error) {
      console.error(`Failed to fetch feed ${feed.name}:`, error);
    }
  }

  if (newTasks.length > 0) {
    saveData(TASKS_FILE, [...tasks, ...newTasks]);
    saveData(BENCHMARKS_FILE, [...benchmarks, ...newBenchmarks]);
    console.log(`Generated ${newTasks.length} new tasks.`);
  } else {
    console.log('No new content found.');
  }

  return { newTasksCount: newTasks.length };
}

function inferType(title: string): Task['type'] {
  const lower = title.toLowerCase();
  if (lower.includes('vs') || lower.includes('compared')) return 'comparison';
  if (lower.includes('review')) return 'review';
  if (lower.includes('best') || lower.includes('guide')) return 'guide';
  return 'news';
}
