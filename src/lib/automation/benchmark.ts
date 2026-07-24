import Parser from 'rss-parser';
import crypto from 'crypto';
import fs from 'fs/promises';
import path from 'path';
import { Task, BenchmarkRecord } from '@/types';

const TASKS_FILE_PATH = path.join(process.cwd(), 'data', 'tasks.json');
const BENCHMARK_FILE_PATH = path.join(process.cwd(), 'data', 'benchmarks.json');

async function ensureDataDirectory() {
  const dir = path.join(process.cwd(), 'data');
  try {
    await fs.mkdir(dir, { recursive: true });
  } catch (err) {
    if (err instanceof Error) {
      const sysErr = err as NodeJS.ErrnoException;
      if (sysErr.code === 'EROFS') {
        console.warn('Warning: Read-only filesystem (EROFS). Cannot create data directory.');
        return;
      }
    }
    throw err;
  }
}

export async function readTasksFile(): Promise<Task[]> {
  await ensureDataDirectory();
  try {
    const data = await fs.readFile(TASKS_FILE_PATH, 'utf-8');
    return JSON.parse(data) as Task[];
  } catch (err) {
    if (err instanceof Error) {
      const sysErr = err as NodeJS.ErrnoException;
      if (sysErr.code === 'ENOENT') {
        return [];
      }
    }
    return [];
  }
}

export async function writeTasksFile(tasks: Task[]): Promise<void> {
  await ensureDataDirectory();
  await saveData(tasks, TASKS_FILE_PATH);
}

export async function saveData(data: unknown, filePath: string): Promise<void> {
  try {
    const serialized = JSON.stringify(data, null, 2);
    await fs.writeFile(filePath, serialized, 'utf-8');
  } catch (err) {
    if (err instanceof Error) {
      const sysErr = err as NodeJS.ErrnoException;
      if (sysErr.code === 'EROFS') {
        console.warn(`Warning: Read-only filesystem (EROFS). Skipping write to ${filePath}.`);
        return;
      }
    }
    throw err;
  }
}

export async function runBenchmarkEngine(): Promise<BenchmarkRecord> {
  const parser = new Parser();
  const existingTasks = await readTasksFile();
  const newTasks: Task[] = [];
  let errorMessage: string | undefined = undefined;
  let status: 'success' | 'failed' = 'success';

  try {
    const wirecutterFeed = await parser.parseURL('https://www.nytimes.com/wirecutter/feed/');
    if (wirecutterFeed && wirecutterFeed.items) {
      for (const item of wirecutterFeed.items) {
        if (!item.link) continue;
        const exists = existingTasks.some((t) => t.sourceUrl === item.link);
        if (!exists) {
          const task: Task = {
            id: crypto.randomUUID(),
            title: `Review: ${item.title || 'Untitled competitor post'}`,
            description: item.contentSnippet || item.summary || 'Analyze competitor article to identify gaps.',
            status: 'pending',
            sourceUrl: item.link,
            competitor: 'Wirecutter',
            publishedAt: item.pubDate || new Date().toISOString(),
            createdAt: new Date().toISOString(),
          };
          newTasks.push(task);
        }
      }
    }
  } catch (err) {
    console.error('Failed to fetch/parse Wirecutter feed:', err);
    errorMessage = err instanceof Error ? err.message : String(err);
    status = 'failed';
  }

  try {
    const rtingsFeed = await parser.parseURL('https://www.rtings.com/rss/reviews.xml');
    if (rtingsFeed && rtingsFeed.items) {
      for (const item of rtingsFeed.items) {
        if (!item.link) continue;
        const exists = existingTasks.some((t) => t.sourceUrl === item.link);
        if (!exists) {
          const task: Task = {
            id: crypto.randomUUID(),
            title: `Review: ${item.title || 'Untitled competitor post'}`,
            description: item.contentSnippet || item.summary || 'Analyze competitor article to identify gaps.',
            status: 'pending',
            sourceUrl: item.link,
            competitor: 'RTINGS',
            publishedAt: item.pubDate || new Date().toISOString(),
            createdAt: new Date().toISOString(),
          };
          newTasks.push(task);
        }
      }
    }
  } catch (err) {
    console.warn('Graceful Bypass: Failed to fetch/parse RTINGS feed (often 404s):', err);
  }

  const tasksCreatedCount = newTasks.length;

  if (tasksCreatedCount > 0) {
    const allTasks = [...newTasks, ...existingTasks];
    await writeTasksFile(allTasks);
  }

  const record: BenchmarkRecord = {
    id: crypto.randomUUID(),
    executedAt: new Date().toISOString(),
    status,
    tasksCreatedCount,
    errorMessage,
  };

  try {
    let benchmarks: BenchmarkRecord[] = [];
    try {
      const data = await fs.readFile(BENCHMARK_FILE_PATH, 'utf-8');
      benchmarks = JSON.parse(data) as BenchmarkRecord[];
    } catch (err) {
      if (err instanceof Error) {
        const sysErr = err as NodeJS.ErrnoException;
        if (sysErr.code !== 'ENOENT') {
          throw err;
        }
      }
    }
    benchmarks.unshift(record);
    await saveData(benchmarks, BENCHMARK_FILE_PATH);
  } catch (err) {
    if (err instanceof Error) {
      const sysErr = err as NodeJS.ErrnoException;
      if (sysErr.code === 'EROFS') {
        console.warn('Warning: Read-only filesystem (EROFS). Skipping saving benchmark log.');
      } else {
        console.error('Failed to write benchmark logs:', err);
      }
    }
  }

  return record;
}
