import Parser from 'rss-parser';
import fs from 'fs';
import path from 'path';
import { Task, BenchmarkRecord } from '../../types';

const parser = new Parser();
const DATA_DIR = path.join(process.cwd(), 'data');
const TASKS_FILE = path.join(DATA_DIR, 'tasks.json');
const RECORDS_FILE = path.join(DATA_DIR, 'benchmark_records.json');

const FEEDS = [
  { name: 'Wirecutter', url: 'https://www.nytimes.com/wirecutter/feed/' },
  { name: 'RTINGS', url: 'https://www.rtings.com/rss/news.rss' }
];

async function ensureDataDir() {
  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
  }
}

function loadData<T>(filePath: string): T[] {
  if (!fs.existsSync(filePath)) return [];
  try {
    const content = fs.readFileSync(filePath, 'utf-8');
    return JSON.parse(content);
  } catch (error) {
    console.error(`Error loading ${filePath}:`, error);
    return [];
  }
}

function saveData(filePath: string, data: unknown) {
  try {
    fs.writeFileSync(filePath, JSON.stringify(data, null, 2));
  } catch (error: unknown) {
    const err = error as NodeJS.ErrnoException;
    if (err.code === 'EROFS') {
      console.error('Filesystem is read-only. Data not saved.');
    } else {
      console.error(`Error saving ${filePath}:`, error);
    }
  }
}

export async function runBenchmark() {
  await ensureDataDir();
  const tasks = loadData<Task>(TASKS_FILE);
  const records = loadData<BenchmarkRecord>(RECORDS_FILE);
  const newTasks: Task[] = [];
  const newRecords: BenchmarkRecord[] = [];

  for (const feed of FEEDS) {
    try {
      console.log(`Fetching ${feed.name} feed...`);
      const feedData = await parser.parseURL(feed.url);

      for (const item of feedData.items) {
        const url = item.link || '';
        const title = item.title || 'No Title';

        // Check if we've already benchmarked this article
        const alreadyProcessed = records.some(r => r.articleUrl === url);
        if (alreadyProcessed) continue;

        console.log(`New article found: ${title}`);

        // Create a new benchmark record
        const record: BenchmarkRecord = {
          id: crypto.randomUUID(),
          competitor: feed.name as 'Wirecutter' | 'RTINGS',
          articleTitle: title,
          articleUrl: url,
          discoveredAt: new Date().toISOString()
        };
        newRecords.push(record);

        // Logic to determine if this is a "gap" (simplified for demo: all new articles are tasks)
        const task: Task = {
          id: crypto.randomUUID(),
          title: `Analyze and respond to: ${title}`,
          sourceUrl: url,
          competitor: feed.name as 'Wirecutter' | 'RTINGS',
          status: 'pending',
          priority: 'medium',
          createdAt: new Date().toISOString()
        };
        newTasks.push(task);
      }
    } catch (error) {
      console.error(`Error fetching ${feed.name}:`, error);
    }
  }

  if (newTasks.length > 0) {
    saveData(TASKS_FILE, [...tasks, ...newTasks]);
    saveData(RECORDS_FILE, [...records, ...newRecords]);
  }

  return { tasksCreated: newTasks.length };
}
