import fs from 'fs';
import path from 'path';
import crypto from 'crypto';
import Parser from 'rss-parser';

export interface ContentTask {
  id: string;
  title: string;
  description: string;
  status: 'Pending' | 'Approved' | 'Completed' | 'Dismissed';
  sourceUrl: string;
  sourceName: string;
  createdAt: string;
}

const DATA_DIR = path.join(process.cwd(), 'data');
const TASKS_FILE = path.join(DATA_DIR, 'tasks.json');

// In-memory fallback if the file system is read-only (EROFS)
let inMemoryTasks: ContentTask[] = [];

export function getTasks(): ContentTask[] {
  try {
    if (fs.existsSync(TASKS_FILE)) {
      const data = fs.readFileSync(TASKS_FILE, 'utf-8');
      return JSON.parse(data) as ContentTask[];
    }
  } catch (error) {
    console.warn('Failed to read tasks file, falling back to memory:', error);
  }
  return inMemoryTasks;
}

export function saveTasks(tasks: ContentTask[]): boolean {
  try {
    if (!fs.existsSync(DATA_DIR)) {
      fs.mkdirSync(DATA_DIR, { recursive: true });
    }
    fs.writeFileSync(TASKS_FILE, JSON.stringify(tasks, null, 2), 'utf-8');
    inMemoryTasks = tasks;
    return true;
  } catch (err) {
    if (err instanceof Error) {
      const errnoErr = err as NodeJS.ErrnoException;
      if (errnoErr.code === 'EROFS') {
        console.warn('Warning: Write-access failed due to read-only filesystem (EROFS). Storing tasks in memory.');
        inMemoryTasks = tasks;
        return true;
      }
    }
    console.error('Failed to save tasks:', err);
    return false;
  }
}

// Strictly typed serialization helper using `unknown` instead of `any`
export function serializeData(data: unknown): string {
  return JSON.stringify(data);
}

export async function runBenchmarking(): Promise<{ count: number; error?: string }> {
  const parser = new Parser();
  const existingTasks = getTasks();
  const newTasks: ContentTask[] = [...existingTasks];
  let addedCount = 0;

  const feeds = [
    { name: 'Wirecutter', url: 'https://www.nytimes.com/wirecutter/feed/' },
    { name: 'RTINGS', url: 'https://www.rtings.com/rss/reviews.xml' }
  ];

  for (const feed of feeds) {
    try {
      const feedData = await parser.parseURL(feed.url);

      for (const item of feedData.items || []) {
        if (!item.link || !item.title) continue;

        // Check if task already exists for this URL
        const exists = newTasks.some(t => t.sourceUrl === item.link);
        if (!exists) {
          const id = crypto.randomUUID();

          // Generate English title and description to align with the US market
          const taskTitle = `Review: ${item.title}`;
          const taskDescription = `Analyze competitor coverage on: ${item.link}. Benchmark key details to identify product gaps and affiliate opportunities in the US market.`;

          newTasks.push({
            id,
            title: taskTitle,
            description: taskDescription,
            status: 'Pending',
            sourceUrl: item.link,
            sourceName: feed.name,
            createdAt: new Date().toISOString()
          });
          addedCount++;
        }
      }
    } catch (err) {
      console.warn(`Failed to fetch/parse feed for ${feed.name}:`, err);
      // Fail gracefully: don't crash the whole run, just bypass and proceed
    }
  }

  if (addedCount > 0) {
    saveTasks(newTasks);
  }

  return { count: addedCount };
}
