import Parser from 'rss-parser';
import crypto from 'crypto';
import fs from 'fs';
import path from 'path';
import { Task } from '@/types';

const parser = new Parser();

const TASKS_FILE_PATH = path.join(process.cwd(), 'data', 'tasks.json');

// Helper to check if file exists, read existing tasks
export function readTasks(): Task[] {
  try {
    if (!fs.existsSync(TASKS_FILE_PATH)) {
      const dir = path.dirname(TASKS_FILE_PATH);
      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
      }
      return [];
    }
    const data = fs.readFileSync(TASKS_FILE_PATH, 'utf8');
    return JSON.parse(data) as Task[];
  } catch (error) {
    console.warn('Could not read tasks file:', error);
    return [];
  }
}

// Helper to save tasks with unknown serialization typing to satisfy strict lint rules
export function saveTasks(tasks: unknown): boolean {
  try {
    const dir = path.dirname(TASKS_FILE_PATH);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    fs.writeFileSync(TASKS_FILE_PATH, JSON.stringify(tasks, null, 2), 'utf8');
    return true;
  } catch (error) {
    // Check for EROFS (Read-only file system)
    if (error instanceof Error) {
      const err = error as NodeJS.ErrnoException;
      if (err.code === 'EROFS') {
        console.warn('Warning: Write failed due to read-only filesystem (EROFS). Local data persistence is bypassed.');
        return false;
      }
    }
    console.error('Error saving tasks:', error);
    return false;
  }
}

export async function runBenchmark(): Promise<{ success: boolean; tasksCreatedCount: number; error?: string }> {
  const existingTasks = readTasks();
  const existingUrls = new Set(existingTasks.map(t => t.sourceUrl));
  const newTasks: Task[] = [];

  // 1. Fetch Wirecutter RSS
  try {
    const feed = await parser.parseURL('https://www.nytimes.com/wirecutter/feed/');
    if (feed && feed.items) {
      for (const item of feed.items) {
        if (!item.link || !item.title) continue;
        if (existingUrls.has(item.link)) continue;

        const task: Task = {
          id: crypto.randomUUID(),
          title: `Review: ${item.title.trim()}`,
          description: `New competitor article found on Wirecutter published on ${item.pubDate || 'unknown date'}. Review details and determine if we should write a corresponding guide or review.`,
          status: 'pending',
          sourceUrl: item.link,
          competitor: 'Wirecutter',
          createdAt: new Date().toISOString()
        };
        newTasks.push(task);
        existingUrls.add(item.link);
      }
    }
  } catch (err) {
    console.error('Failed to parse Wirecutter RSS feed:', err);
  }

  // 2. Fetch RTINGS RSS
  try {
    const feed = await parser.parseURL('https://www.rtings.com/rss/reviews.xml');
    if (feed && feed.items) {
      for (const item of feed.items) {
        if (!item.link || !item.title) continue;
        if (existingUrls.has(item.link)) continue;

        const task: Task = {
          id: crypto.randomUUID(),
          title: `Review: ${item.title.trim()}`,
          description: `New competitor article found on RTINGS published on ${item.pubDate || 'unknown date'}. Review details and determine if we should write a corresponding guide or review.`,
          status: 'pending',
          sourceUrl: item.link,
          competitor: 'RTINGS',
          createdAt: new Date().toISOString()
        };
        newTasks.push(task);
        existingUrls.add(item.link);
      }
    }
  } catch (err) {
    // RTINGS feeds frequently return 404 errors and may require verification or bypass in automation logic.
    console.warn('Bypassing RTINGS RSS feed due to failure or 404 error:', err);
  }

  if (newTasks.length > 0) {
    const updatedTasks = [...newTasks, ...existingTasks];
    const saved = saveTasks(updatedTasks);
    if (!saved) {
      console.warn('Could not persist updated tasks locally.');
    }
  }

  return {
    success: true,
    tasksCreatedCount: newTasks.length
  };
}
