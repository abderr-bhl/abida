import Parser from 'rss-parser';
import crypto from 'crypto';
import fs from 'fs';
import path from 'path';
import { Task, BenchmarkRecord } from '@/types';

const TASKS_FILE_PATH = path.join(process.cwd(), 'data', 'tasks.json');

// Ensure the directory exists
function ensureDataDirectory() {
  const dir = path.dirname(TASKS_FILE_PATH);
  if (!fs.existsSync(dir)) {
    try {
      fs.mkdirSync(dir, { recursive: true });
    } catch (err) {
      if (err instanceof Error) {
        const errnoErr = err as NodeJS.ErrnoException;
        if (errnoErr.code === 'EROFS') {
          console.warn('Warning: Read-only filesystem. Unable to create data directory.');
          return;
        }
      }
      throw err;
    }
  }
}

// Helper to save data with unknown type for serialization
export function saveTasksData(tasks: unknown): boolean {
  ensureDataDirectory();
  try {
    fs.writeFileSync(TASKS_FILE_PATH, JSON.stringify(tasks, null, 2), 'utf-8');
    return true;
  } catch (err) {
    if (err instanceof Error) {
      const errnoErr = err as NodeJS.ErrnoException;
      if (errnoErr.code === 'EROFS') {
        console.warn('Warning: Read-only filesystem. Unable to write benchmark tasks to disk.');
        return false;
      }
    }
    throw err;
  }
}

// Get stored tasks
export function getTasks(): Task[] {
  ensureDataDirectory();
  if (!fs.existsSync(TASKS_FILE_PATH)) {
    return [];
  }
  try {
    const data = fs.readFileSync(TASKS_FILE_PATH, 'utf-8');
    return JSON.parse(data) as Task[];
  } catch (err) {
    console.error('Failed to read or parse tasks:', err);
    return [];
  }
}

export async function runBenchmark(): Promise<BenchmarkRecord> {
  const parser = new Parser();
  const existingTasks = getTasks();
  const existingUrls = new Set(existingTasks.map(t => t.url));

  let tasksGeneratedCount = 0;
  const newTasksList: Task[] = [...existingTasks];

  // Wirecutter Feed
  try {
    const wirecutterFeed = await parser.parseURL('https://www.nytimes.com/wirecutter/feed/');
    if (wirecutterFeed && wirecutterFeed.items) {
      for (const item of wirecutterFeed.items) {
        const itemUrl = item.link || '';
        if (itemUrl && !existingUrls.has(itemUrl)) {
          const newTask: Task = {
            id: crypto.randomUUID(),
            title: `Review: ${item.title || 'New Wirecutter Article'}`,
            description: `Analyze Wirecutter's latest coverage on "${item.title || 'Untitled'}" and identify content gaps for the US market.`,
            source: 'Wirecutter',
            url: itemUrl,
            status: 'pending',
            date: new Date().toISOString().split('T')[0]
          };
          newTasksList.push(newTask);
          existingUrls.add(itemUrl);
          tasksGeneratedCount++;
        }
      }
    }
  } catch (e) {
    console.error('Error fetching/parsing Wirecutter feed (gracefully continuing):', e);
  }

  // RTINGS Feed - often returns 404, must handle gracefully
  try {
    const rtingsFeed = await parser.parseURL('https://www.rtings.com/rss/reviews.xml');
    if (rtingsFeed && rtingsFeed.items) {
      for (const item of rtingsFeed.items) {
        const itemUrl = item.link || '';
        if (itemUrl && !existingUrls.has(itemUrl)) {
          const newTask: Task = {
            id: crypto.randomUUID(),
            title: `Review: ${item.title || 'New RTINGS Article'}`,
            description: `Examine RTINGS's review for "${item.title || 'Untitled'}" to extract key buying criteria and product comparisons.`,
            source: 'RTINGS',
            url: itemUrl,
            status: 'pending',
            date: new Date().toISOString().split('T')[0]
          };
          newTasksList.push(newTask);
          existingUrls.add(itemUrl);
          tasksGeneratedCount++;
        }
      }
    }
  } catch (e) {
    console.warn('Error fetching/parsing RTINGS feed (gracefully bypassed):', e);
  }

  if (tasksGeneratedCount > 0) {
    saveTasksData(newTasksList);
  }

  return {
    lastExecution: new Date().toISOString(),
    tasksGenerated: tasksGeneratedCount,
    status: 'success'
  };
}
