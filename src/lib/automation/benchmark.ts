import Parser from 'rss-parser';
import crypto from 'crypto';
import fs from 'fs';
import path from 'path';
import { Task } from '@/types';

const TASKS_FILE = path.join(process.cwd(), 'data', 'tasks.json');

// Helper to save data with 'unknown' type serialization to satisfy strict rules
export function saveData(data: unknown): boolean {
  try {
    const dir = path.dirname(TASKS_FILE);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    fs.writeFileSync(TASKS_FILE, JSON.stringify(data, null, 2), 'utf8');
    return true;
  } catch (error) {
    if (error instanceof Error) {
      const nodeErr = error as NodeJS.ErrnoException;
      if (nodeErr.code === 'EROFS') {
        console.warn('Warning: Read-only filesystem encountered while saving tasks.');
        return false;
      }
    }
    console.error('Failed to save data:', error);
    return false;
  }
}

export function getTasks(): Task[] {
  try {
    if (!fs.existsSync(TASKS_FILE)) {
      return [];
    }
    const data = fs.readFileSync(TASKS_FILE, 'utf8');
    return JSON.parse(data) as Task[];
  } catch (error) {
    if (error instanceof Error) {
      const nodeErr = error as NodeJS.ErrnoException;
      if (nodeErr.code === 'EROFS') {
        console.warn('Warning: Read-only filesystem encountered while reading tasks.');
      }
    }
    return [];
  }
}

export async function runBenchmark(): Promise<{ tasksGenerated: number }> {
  const parser = new Parser();
  const existingTasks = getTasks();
  let tasksGenerated = 0;

  // Process Wirecutter
  try {
    const feed = await parser.parseURL('https://www.nytimes.com/wirecutter/feed/');
    for (const item of feed.items) {
      if (!item.link) continue;
      const alreadyExists = existingTasks.some(t => t.sourceUrl === item.link);
      if (!alreadyExists) {
        const title = `Review: ${item.title || 'Untitled Wirecutter Article'}`;
        const description = `Competitor Wirecutter published a new article: "${item.title}". Analyze and consider creating a detailed buyer's guide or comparison.`;
        const newTask: Task = {
          id: crypto.randomUUID(),
          title,
          description,
          status: 'pending',
          sourceUrl: item.link,
          competitor: 'Wirecutter',
          createdAt: new Date().toISOString()
        };
        existingTasks.push(newTask);
        tasksGenerated++;
      }
    }
  } catch (error) {
    console.error('Failed to fetch Wirecutter RSS feed:', error);
  }

  // Process RTINGS (handles 404 or other errors)
  try {
    const feed = await parser.parseURL('https://www.rtings.com/rss/reviews.xml');
    for (const item of feed.items) {
      if (!item.link) continue;
      const alreadyExists = existingTasks.some(t => t.sourceUrl === item.link);
      if (!alreadyExists) {
        const title = `Review: ${item.title || 'Untitled RTINGS Article'}`;
        const description = `Competitor RTINGS published a new article: "${item.title}". Analyze and consider creating a detailed review or comparison.`;
        const newTask: Task = {
          id: crypto.randomUUID(),
          title,
          description,
          status: 'pending',
          sourceUrl: item.link,
          competitor: 'RTINGS',
          createdAt: new Date().toISOString()
        };
        existingTasks.push(newTask);
        tasksGenerated++;
      }
    }
  } catch (error) {
    console.warn('Failed to fetch RTINGS RSS feed (expected/handled):', error);
  }

  if (tasksGenerated > 0) {
    saveData(existingTasks);
  }

  return { tasksGenerated };
}
