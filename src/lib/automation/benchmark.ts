import Parser from 'rss-parser';
import fs from 'fs';
import path from 'path';
import crypto from 'crypto';
import { Task, BenchmarkRecord } from '@/types';

const TASKS_FILE = path.join(process.cwd(), 'data', 'tasks.json');
const BENCHMARK_FILE = path.join(process.cwd(), 'data', 'benchmark.json');

const parser = new Parser();

// Ensure the directory exists
function ensureDirectory() {
  const dir = path.dirname(TASKS_FILE);
  if (!fs.existsSync(dir)) {
    try {
      fs.mkdirSync(dir, { recursive: true });
    } catch (err) {
      const error = err as NodeJS.ErrnoException;
      console.warn(`Warning: Could not create directory ${dir} (EROFS?): ${error.message}`);
    }
  }
}

// Read tasks from local storage
export function readTasks(): Task[] {
  ensureDirectory();
  if (!fs.existsSync(TASKS_FILE)) {
    return [];
  }
  try {
    const data = fs.readFileSync(TASKS_FILE, 'utf-8');
    return JSON.parse(data) as Task[];
  } catch (err) {
    const error = err as NodeJS.ErrnoException;
    console.warn(`Warning: Error reading tasks file: ${error.message}`);
    return [];
  }
}

// Write tasks to local storage
export function writeTasks(tasks: Task[]): boolean {
  ensureDirectory();
  try {
    fs.writeFileSync(TASKS_FILE, JSON.stringify(tasks, null, 2), 'utf-8');
    return true;
  } catch (err) {
    const error = err as NodeJS.ErrnoException;
    console.warn(`Warning: Error writing tasks file: ${error.message}`);
    return false;
  }
}

// Read last benchmark record
export function readBenchmarkRecord(): BenchmarkRecord | null {
  ensureDirectory();
  if (!fs.existsSync(BENCHMARK_FILE)) {
    return null;
  }
  try {
    const data = fs.readFileSync(BENCHMARK_FILE, 'utf-8');
    return JSON.parse(data) as BenchmarkRecord;
  } catch (err) {
    const error = err as NodeJS.ErrnoException;
    console.warn(`Warning: Error reading benchmark record file: ${error.message}`);
    return null;
  }
}

// Write benchmark record
export function writeBenchmarkRecord(record: BenchmarkRecord): boolean {
  ensureDirectory();
  try {
    fs.writeFileSync(BENCHMARK_FILE, JSON.stringify(record, null, 2), 'utf-8');
    return true;
  } catch (err) {
    const error = err as NodeJS.ErrnoException;
    console.warn(`Warning: Error writing benchmark record file: ${error.message}`);
    return false;
  }
}

// Main logic to fetch RSS and identify/create content tasks
export async function runCompetitiveBenchmark(): Promise<BenchmarkRecord> {
  const existingTasks = readTasks();
  let tasksCreated = 0;
  let hasFailed = false;
  let lastErrorMessage = '';

  // 1. Wirecutter Feed
  try {
    const feed = await parser.parseURL('https://www.nytimes.com/wirecutter/feed/');
    for (const item of feed.items) {
      const title = item.title || '';
      const link = item.link || '';
      const description = item.contentSnippet || item.content || '';

      // Check if we already have a task for this URL
      const exists = existingTasks.some(t => t.competitorUrl === link);
      if (!exists && title) {
        const newTask: Task = {
          id: crypto.randomUUID(),
          title: `Review: [Wirecutter] ${title}`,
          description: `Identify and cover content gaps based on the competitor article: "${title}". Description: ${description}`,
          competitor: 'Wirecutter',
          competitorUrl: link,
          status: 'Pending',
          createdAt: new Date().toISOString()
        };
        existingTasks.push(newTask);
        tasksCreated++;
      }
    }
  } catch (err) {
    const error = err as Error;
    console.warn(`Wirecutter RSS Feed parsing failed or offline: ${error.message}`);
    // Do not mark the whole benchmark as failed just because one feed is down, but record it
  }

  // 2. RTINGS Feed
  try {
    const feed = await parser.parseURL('https://www.rtings.com/rss/reviews.xml');
    for (const item of feed.items) {
      const title = item.title || '';
      const link = item.link || '';
      const description = item.contentSnippet || item.content || '';

      const exists = existingTasks.some(t => t.competitorUrl === link);
      if (!exists && title) {
        const newTask: Task = {
          id: crypto.randomUUID(),
          title: `Review: [RTINGS] ${title}`,
          description: `Identify and cover content gaps based on the competitor article: "${title}". Description: ${description}`,
          competitor: 'RTINGS',
          competitorUrl: link,
          status: 'Pending',
          createdAt: new Date().toISOString()
        };
        existingTasks.push(newTask);
        tasksCreated++;
      }
    }
  } catch (err) {
    const error = err as Error;
    console.warn(`RTINGS RSS Feed parsing failed or offline (often 404s): ${error.message}`);
    // Bypass error or note it since RTINGS feed is notoriously unreliable / 404s
  }

  // Attempt to write the tasks back
  const writeSuccess = writeTasks(existingTasks);
  if (!writeSuccess) {
    hasFailed = true;
    lastErrorMessage = 'Could not write tasks to persistent file system.';
  }

  const record: BenchmarkRecord = {
    lastRun: new Date().toISOString(),
    status: hasFailed ? 'failed' : 'success',
    error: lastErrorMessage || undefined,
    tasksCreated
  };

  writeBenchmarkRecord(record);
  return record;
}
