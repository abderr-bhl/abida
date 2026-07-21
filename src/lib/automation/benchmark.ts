import Parser from 'rss-parser';
import crypto from 'crypto';
import fs from 'fs';
import path from 'path';
import { Task, BenchmarkRecord } from '@/types';

const TASKS_FILE = path.join(process.cwd(), 'data', 'tasks.json');
const BENCHMARK_RECORD_FILE = path.join(process.cwd(), 'data', 'benchmark-record.json');

const parser = new Parser();

export function getTasks(): Task[] {
  try {
    if (fs.existsSync(TASKS_FILE)) {
      const data = fs.readFileSync(TASKS_FILE, 'utf-8');
      return JSON.parse(data) as Task[];
    }
  } catch (error) {
    console.error('Error reading tasks file:', error);
  }
  return [];
}

export function saveTasks(tasks: unknown): boolean {
  try {
    const dir = path.dirname(TASKS_FILE);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    fs.writeFileSync(TASKS_FILE, JSON.stringify(tasks, null, 2), 'utf-8');
    return true;
  } catch (error) {
    if (error instanceof Error) {
      const err = error as NodeJS.ErrnoException;
      if (err.code === 'EROFS') {
        console.warn('Read-only filesystem (EROFS), skipping saveTasks write.');
        return false;
      }
      throw err;
    }
    return false;
  }
}

export function getBenchmarkRecord(): BenchmarkRecord | null {
  try {
    if (fs.existsSync(BENCHMARK_RECORD_FILE)) {
      const data = fs.readFileSync(BENCHMARK_RECORD_FILE, 'utf-8');
      return JSON.parse(data) as BenchmarkRecord;
    }
  } catch (error) {
    console.error('Error reading benchmark record:', error);
  }
  return null;
}

export function saveBenchmarkRecord(record: unknown): boolean {
  try {
    const dir = path.dirname(BENCHMARK_RECORD_FILE);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    fs.writeFileSync(BENCHMARK_RECORD_FILE, JSON.stringify(record, null, 2), 'utf-8');
    return true;
  } catch (error) {
    if (error instanceof Error) {
      const err = error as NodeJS.ErrnoException;
      if (err.code === 'EROFS') {
        console.warn('Read-only filesystem (EROFS), skipping saveBenchmarkRecord write.');
        return false;
      }
      throw err;
    }
    return false;
  }
}

export async function runBenchmark(): Promise<BenchmarkRecord> {
  const currentTasks = getTasks();
  let tasksGenerated = 0;
  let hasFailure = false;
  let errorMessage = '';

  // Wirecutter Feed
  try {
    const wirecutterFeed = await parser.parseURL('https://www.nytimes.com/wirecutter/feed/');
    for (const item of wirecutterFeed.items) {
      if (!item.title || !item.link) continue;
      const alreadyExists = currentTasks.some(t => t.url === item.link);
      if (!alreadyExists) {
        const newTask: Task = {
          id: crypto.randomUUID(),
          title: `Review: ${item.title}`,
          description: `Analyze Wirecutter's latest coverage on "${item.title}" to discover potential content gaps, pricing discrepancies, or key feature additions for our US audience.`,
          url: item.link,
          source: 'Wirecutter',
          status: 'pending',
          date: new Date().toISOString().split('T')[0]
        };
        currentTasks.push(newTask);
        tasksGenerated++;
      }
    }
  } catch (error) {
    console.error('Error fetching Wirecutter feed:', error);
    hasFailure = true;
    errorMessage += `Wirecutter: ${(error as Error).message || 'Unknown error'}. `;
  }

  // RTINGS Feed - Frequently returns 404 and requires bypass
  try {
    const rtingsFeed = await parser.parseURL('https://www.rtings.com/rss/reviews.xml');
    for (const item of rtingsFeed.items) {
      if (!item.title || !item.link) continue;
      const alreadyExists = currentTasks.some(t => t.url === item.link);
      if (!alreadyExists) {
        const newTask: Task = {
          id: crypto.randomUUID(),
          title: `Review: ${item.title}`,
          description: `Analyze RTINGS's specialized technical review on "${item.title}" to benchmark our content and plan responsive product evaluations.`,
          url: item.link,
          source: 'RTINGS',
          status: 'pending',
          date: new Date().toISOString().split('T')[0]
        };
        currentTasks.push(newTask);
        tasksGenerated++;
      }
    }
  } catch (error) {
    console.warn('RTINGS feed failed (bypassed):', error);
    errorMessage += `RTINGS bypassed: ${(error as Error).message || '404/Connection Error'}. `;
  }

  // Save updated tasks
  saveTasks(currentTasks);

  const record: BenchmarkRecord = {
    lastRun: new Date().toISOString(),
    status: hasFailure ? 'failure' : 'success',
    tasksGenerated,
    ...(errorMessage ? { errorMessage } : {})
  };

  saveBenchmarkRecord(record);

  return record;
}
