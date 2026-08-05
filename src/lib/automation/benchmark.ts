import fs from 'fs';
import path from 'path';
import crypto from 'crypto';
import Parser from 'rss-parser';
import { Task, BenchmarkRecord } from '@/types';

const DATA_DIR = path.join(process.cwd(), 'data');
const TASKS_FILE = path.join(DATA_DIR, 'tasks.json');
const BENCHMARK_FILE = path.join(DATA_DIR, 'benchmark-status.json');

/**
 * Strict TypeScript compliant serialization helper that uses unknown
 */
export function safeSerialize(data: unknown): string {
  return JSON.stringify(data, null, 2);
}

/**
 * Ensures that the data directory exists.
 * Gracefully logs warnings on EROFS (ReadOnly Filesystem).
 */
function ensureDataDir() {
  try {
    if (!fs.existsSync(DATA_DIR)) {
      fs.mkdirSync(DATA_DIR, { recursive: true });
    }
  } catch (error) {
    if (error instanceof Error) {
      const err = error as NodeJS.ErrnoException;
      if (err.code === 'EROFS') {
        console.warn('Warning: Read-only filesystem encountered. Cannot create data directory:', err.message);
        return;
      }
    }
    throw error;
  }
}

export function readTasks(): Task[] {
  ensureDataDir();
  try {
    if (fs.existsSync(TASKS_FILE)) {
      const content = fs.readFileSync(TASKS_FILE, 'utf8');
      return JSON.parse(content) as Task[];
    }
  } catch (error) {
    console.error('Error reading tasks file:', error);
  }
  return [];
}

export function writeTasks(tasks: Task[]): boolean {
  ensureDataDir();
  try {
    const content = safeSerialize(tasks);
    fs.writeFileSync(TASKS_FILE, content, 'utf8');
    return true;
  } catch (error) {
    if (error instanceof Error) {
      const err = error as NodeJS.ErrnoException;
      if (err.code === 'EROFS') {
        console.warn('Warning: Read-only filesystem. Unable to save tasks:', err.message);
        return false;
      }
    }
    throw error;
  }
}

export function readBenchmarkStatus(): BenchmarkRecord | null {
  ensureDataDir();
  try {
    if (fs.existsSync(BENCHMARK_FILE)) {
      const content = fs.readFileSync(BENCHMARK_FILE, 'utf8');
      return JSON.parse(content) as BenchmarkRecord;
    }
  } catch (error) {
    console.error('Error reading benchmark status file:', error);
  }
  return null;
}

export function writeBenchmarkStatus(status: BenchmarkRecord): boolean {
  ensureDataDir();
  try {
    const content = safeSerialize(status);
    fs.writeFileSync(BENCHMARK_FILE, content, 'utf8');
    return true;
  } catch (error) {
    if (error instanceof Error) {
      const err = error as NodeJS.ErrnoException;
      if (err.code === 'EROFS') {
        console.warn('Warning: Read-only filesystem. Unable to save benchmark status:', err.message);
        return false;
      }
    }
    throw error;
  }
}

/**
 * Runs the benchmarking process by parsing Wirecutter and RTINGS RSS feeds,
 * identifying content gaps, creating tasks, and updating the run status.
 */
export async function runBenchmarking(): Promise<BenchmarkRecord> {
  const parser = new Parser();
  const tasks = readTasks();
  let tasksCreatedCount = 0;

  const feeds = [
    { name: 'Wirecutter', url: 'https://www.nytimes.com/wirecutter/feed/' },
    { name: 'RTINGS', url: 'https://www.rtings.com/rss/reviews.xml' }
  ];

  for (const feed of feeds) {
    try {
      const parsedFeed = await parser.parseURL(feed.url);
      if (!parsedFeed || !parsedFeed.items) continue;

      for (const item of parsedFeed.items) {
        const title = item.title?.trim() || '';
        const link = item.link?.trim() || '';
        if (!title || !link) continue;

        // Check if a task with the same source URL already exists
        const exists = tasks.some(t => t.sourceUrl === link);
        if (!exists) {
          const newTask: Task = {
            id: crypto.randomUUID(),
            title: `Review: ${title}`,
            description: `Review gap identified from competitor article: "${title}". Source: ${link}`,
            sourceUrl: link,
            competitor: feed.name,
            status: 'pending',
            createdAt: new Date().toISOString()
          };
          tasks.push(newTask);
          tasksCreatedCount++;
        }
      }
    } catch (error) {
      console.error(`Error parsing feed "${feed.name}" from ${feed.url}:`, error);
      // RTINGS or other feeds might 404 or fail; we bypass them as instructed
    }
  }

  const record: BenchmarkRecord = {
    lastRun: new Date().toISOString(),
    status: 'success',
    tasksCreatedCount
  };

  if (tasksCreatedCount > 0) {
    writeTasks(tasks);
  }
  writeBenchmarkStatus(record);

  return record;
}
