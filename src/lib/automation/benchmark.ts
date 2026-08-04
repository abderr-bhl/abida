import Parser from 'rss-parser';
import fs from 'fs';
import path from 'path';
import crypto from 'crypto';
import { Task, BenchmarkRecord } from '@/types';

const DATA_DIR = path.join(process.cwd(), 'data');
const TASKS_FILE = path.join(DATA_DIR, 'tasks.json');
const BENCHMARKS_FILE = path.join(DATA_DIR, 'benchmarks.json');

// Ensure data directory exists helper
function ensureDataDir() {
  try {
    if (!fs.existsSync(DATA_DIR)) {
      fs.mkdirSync(DATA_DIR, { recursive: true });
    }
  } catch (error) {
    if (error instanceof Error) {
      const nodeErr = error as NodeJS.ErrnoException;
      if (nodeErr.code === 'EROFS') {
        console.warn('Warning: Read-only filesystem. Cannot create data directory.');
        return;
      }
    }
    throw error;
  }
}

// Read data helper
function readJsonFile<T>(filePath: string, defaultValue: T): T {
  try {
    if (fs.existsSync(filePath)) {
      const content = fs.readFileSync(filePath, 'utf-8');
      return JSON.parse(content) as T;
    }
  } catch (error) {
    console.error(`Error reading file ${filePath}:`, error);
  }
  return defaultValue;
}

// Write data helper using unknown parameter
function writeJsonFile(filePath: string, data: unknown): boolean {
  ensureDataDir();
  try {
    fs.writeFileSync(filePath, JSON.stringify(data, null, 2), 'utf-8');
    return true;
  } catch (error) {
    if (error instanceof Error) {
      const nodeErr = error as NodeJS.ErrnoException;
      if (nodeErr.code === 'EROFS') {
        console.warn(`Warning: Read-only filesystem. Cannot write to ${filePath}.`);
        return false;
      }
    }
    console.error(`Error writing file ${filePath}:`, error);
    return false;
  }
}

export function getTasks(): Task[] {
  return readJsonFile<Task[]>(TASKS_FILE, []);
}

export function saveTasks(tasks: Task[]): boolean {
  return writeJsonFile(TASKS_FILE, tasks);
}

export function getBenchmarks(): BenchmarkRecord[] {
  return readJsonFile<BenchmarkRecord[]>(BENCHMARKS_FILE, []);
}

export function saveBenchmarks(benchmarks: BenchmarkRecord[]): boolean {
  return writeJsonFile(BENCHMARKS_FILE, benchmarks);
}

export async function runBenchmark(): Promise<BenchmarkRecord> {
  const parser = new Parser();
  const existingTasks = getTasks();
  const existingUrls = new Set(existingTasks.map(t => t.url));
  const newTasks: Task[] = [];
  let status: 'success' | 'failure' = 'success';
  let errorMessage: string | undefined = undefined;

  // 1. Fetch Wirecutter
  try {
    const feed = await parser.parseURL('https://www.nytimes.com/wirecutter/feed/');
    for (const item of feed.items) {
      if (item.link && !existingUrls.has(item.link)) {
        const title = item.title || 'Untitled Review';
        newTasks.push({
          id: crypto.randomUUID(),
          title: title.startsWith('Review:') ? title : `Review: ${title}`,
          description: item.contentSnippet || item.content || `Competitor analysis task generated from Wirecutter's latest post.`,
          status: 'pending',
          createdAt: new Date().toISOString(),
          url: item.link,
          competitor: 'Wirecutter'
        });
      }
    }
  } catch (err) {
    console.error('Error fetching Wirecutter feed:', err);
    status = 'failure';
    errorMessage = err instanceof Error ? err.message : String(err);
  }

  // 2. Fetch RTINGS (might fail with 404, bypass gracefully)
  try {
    const feed = await parser.parseURL('https://www.rtings.com/rss/reviews.xml');
    for (const item of feed.items) {
      if (item.link && !existingUrls.has(item.link)) {
        const title = item.title || 'Untitled Review';
        newTasks.push({
          id: crypto.randomUUID(),
          title: title.startsWith('Review:') ? title : `Review: ${title}`,
          description: item.contentSnippet || item.content || `Competitor analysis task generated from RTINGS's latest post.`,
          status: 'pending',
          createdAt: new Date().toISOString(),
          url: item.link,
          competitor: 'RTINGS'
        });
      }
    }
  } catch (err) {
    console.warn('Warning: RTINGS feed failed (expected potential 404). Bypassing gracefully:', err);
  }

  // If both failed or Wirecutter failed, but RTINGS failed, and we did not generate any tasks, and we have an error
  if (status === 'failure' && newTasks.length === 0) {
    // Keep failure status
  } else {
    status = 'success';
  }

  // Save new tasks
  if (newTasks.length > 0) {
    const updatedTasks = [...newTasks, ...existingTasks];
    saveTasks(updatedTasks);
  }

  const record: BenchmarkRecord = {
    id: crypto.randomUUID(),
    timestamp: new Date().toISOString(),
    status,
    tasksGeneratedCount: newTasks.length,
    error: errorMessage
  };

  const benchmarks = getBenchmarks();
  saveBenchmarks([record, ...benchmarks]);

  return record;
}
