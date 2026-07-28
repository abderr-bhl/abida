import fs from 'fs/promises';
import path from 'path';
import crypto from 'crypto';
import Parser from 'rss-parser';
import { Task, BenchmarkRecord } from '@/types';

const DATA_DIR = path.join(process.cwd(), 'data');
const TASKS_FILE = path.join(DATA_DIR, 'tasks.json');
const RECORDS_FILE = path.join(DATA_DIR, 'records.json');

// Memory fallbacks for EROFS / read-only filesystem
let inMemoryTasks: Task[] = [];
let inMemoryRecords: BenchmarkRecord[] = [];

// Helper to ensure data directory exists
async function ensureDataDir(): Promise<void> {
  try {
    await fs.mkdir(DATA_DIR, { recursive: true });
  } catch (error) {
    if (error instanceof Error) {
      const err = error as NodeJS.ErrnoException;
      if (err.code === 'EROFS') {
        console.warn('Warning: Read-only filesystem. Data persistence fallback to in-memory.');
        return;
      }
    }
    throw error;
  }
}

// Serialization helper using unknown type instead of any for strict TS rules
export async function saveData(filePath: string, data: unknown): Promise<void> {
  await ensureDataDir();
  try {
    const serialized = JSON.stringify(data, null, 2);
    await fs.writeFile(filePath, serialized, 'utf-8');
  } catch (error) {
    if (error instanceof Error) {
      const err = error as NodeJS.ErrnoException;
      if (err.code === 'EROFS') {
        console.warn(`Warning: EROFS error writing to ${filePath}. Keeping in-memory.`);
        return;
      }
    }
    throw error;
  }
}

// Deserialization helper
export async function loadData<T>(filePath: string, fallback: T): Promise<T> {
  try {
    const content = await fs.readFile(filePath, 'utf-8');
    return JSON.parse(content) as T;
  } catch (error) {
    if (error instanceof Error) {
      const err = error as NodeJS.ErrnoException;
      if (err.code === 'ENOENT' || err.code === 'EROFS') {
        return fallback;
      }
    }
    return fallback;
  }
}

export async function getTasks(): Promise<Task[]> {
  const fileTasks = await loadData<Task[]>(TASKS_FILE, []);
  if (fileTasks.length > 0) {
    inMemoryTasks = fileTasks;
  }
  return inMemoryTasks;
}

export async function saveTasks(tasks: Task[]): Promise<void> {
  inMemoryTasks = tasks;
  await saveData(TASKS_FILE, tasks);
}

export async function getRecords(): Promise<BenchmarkRecord[]> {
  const fileRecords = await loadData<BenchmarkRecord[]>(RECORDS_FILE, []);
  if (fileRecords.length > 0) {
    inMemoryRecords = fileRecords;
  }
  return inMemoryRecords;
}

export async function saveRecords(records: BenchmarkRecord[]): Promise<void> {
  inMemoryRecords = records;
  await saveData(RECORDS_FILE, records);
}

export async function runBenchmark(): Promise<{ tasksCreated: number; status: 'success' | 'failure'; message: string }> {
  const parser = new Parser({
    headers: {
      'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
    },
    timeout: 5000,
  });

  const existingTasks = await getTasks();
  const existingRecords = await getRecords();

  let newTasksCount = 0;
  const newTasksAdded: Task[] = [];
  const errors: string[] = [];

  // 1. Process Wirecutter RSS Feed
  try {
    const feed = await parser.parseURL('https://www.nytimes.com/wirecutter/feed/');
    for (const item of feed.items) {
      const link = item.link || '';
      if (!link) continue;

      // Check if task already exists for this URL
      const exists = existingTasks.some(t => t.sourceUrl === link);
      if (!exists) {
        const title = item.title || 'Untitled Article';
        const task: Task = {
          id: crypto.randomUUID(),
          title: title.startsWith('Review') || title.startsWith('Guide') ? title : `Review: ${title}`,
          description: `Analysis of new Wirecutter release: "${title}". Source: ${link}. Check and identify key recommendations to update our buyers guides.`,
          status: 'pending',
          competitor: 'Wirecutter',
          sourceUrl: link,
          publishedDate: item.pubDate || new Date().toISOString(),
          createdAt: new Date().toISOString()
        };
        newTasksAdded.push(task);
        newTasksCount++;
      }
    }
  } catch (error) {
    const msg = error instanceof Error ? error.message : String(error);
    console.error('Error fetching Wirecutter feed:', msg);
    errors.push(`Wirecutter: ${msg}`);
  }

  // 2. Process RTINGS RSS Feed (frequently 404s, so try/catch and log)
  try {
    const feed = await parser.parseURL('https://www.rtings.com/rss/reviews.xml');
    for (const item of feed.items) {
      const link = item.link || '';
      if (!link) continue;

      // Check if task already exists for this URL
      const exists = existingTasks.some(t => t.sourceUrl === link);
      if (!exists) {
        const title = item.title || 'Untitled Review';
        const task: Task = {
          id: crypto.randomUUID(),
          title: title.startsWith('Review') || title.startsWith('Guide') ? title : `Review: ${title}`,
          description: `Analysis of new RTINGS product evaluation: "${title}". Source: ${link}. Compare competitor performance ratings with our current listings.`,
          status: 'pending',
          competitor: 'RTINGS',
          sourceUrl: link,
          publishedDate: item.pubDate || new Date().toISOString(),
          createdAt: new Date().toISOString()
        };
        newTasksAdded.push(task);
        newTasksCount++;
      }
    }
  } catch (error) {
    const msg = error instanceof Error ? error.message : String(error);
    console.warn('Warning: RTINGS RSS feed fetch failed or bypassed:', msg);
    errors.push(`RTINGS: ${msg}`);
  }

  // Update tasks list
  if (newTasksAdded.length > 0) {
    await saveTasks([...newTasksAdded, ...existingTasks]);
  }

  // Compile status and final message
  const allFailed = errors.length === 2;
  const status = allFailed ? 'failure' : 'success';
  const summaryMessage = allFailed
    ? `Benchmark run failed completely. Errors: ${errors.join('; ')}`
    : `Benchmark run completed. Tasks created: ${newTasksCount}. Bypassed errors: ${errors.join(', ') || 'none'}`;

  // Save Benchmark Record
  const newRecord: BenchmarkRecord = {
    id: crypto.randomUUID(),
    timestamp: new Date().toISOString(),
    status,
    tasksCreated: newTasksCount,
    message: summaryMessage
  };

  await saveRecords([newRecord, ...existingRecords]);

  return {
    tasksCreated: newTasksCount,
    status,
    message: summaryMessage
  };
}
