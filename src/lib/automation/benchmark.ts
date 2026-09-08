import fs from 'fs';
import path from 'path';
import { randomUUID } from 'crypto';
import Parser from 'rss-parser';
import { Task, TaskStatus } from '@/types';

const DATA_DIR = path.join(process.cwd(), 'data');
const TASKS_FILE = path.join(DATA_DIR, 'tasks.json');

const FEEDS = [
  { name: 'Wirecutter', url: 'https://www.nytimes.com/wirecutter/feed/' },
  { name: 'RTINGS', url: 'https://www.rtings.com/rss/reviews.xml' },
];

function ensureDataDir(): void {
  try {
    if (!fs.existsSync(DATA_DIR)) {
      fs.mkdirSync(DATA_DIR, { recursive: true });
    }
  } catch (err) {
    if (err instanceof Error) {
      const nodeErr = err as NodeJS.ErrnoException;
      if (nodeErr.code === 'EROFS') {
        console.warn('Read-only filesystem, cannot create directory:', DATA_DIR);
      } else {
        console.error('Error creating data directory:', err);
      }
    }
  }
}

export function loadTasks(): Task[] {
  ensureDataDir();
  try {
    if (fs.existsSync(TASKS_FILE)) {
      const data = fs.readFileSync(TASKS_FILE, 'utf-8');
      const parsed: unknown = JSON.parse(data);
      if (Array.isArray(parsed)) {
        return parsed as Task[];
      }
    }
  } catch (err) {
    if (err instanceof Error) {
      const nodeErr = err as NodeJS.ErrnoException;
      if (nodeErr.code === 'EROFS') {
        console.warn('Read-only filesystem, returning empty tasks list');
      } else {
        console.error('Error loading tasks:', err);
      }
    }
  }
  return [];
}

export function saveTasks(data: unknown): boolean {
  ensureDataDir();
  try {
    fs.writeFileSync(TASKS_FILE, JSON.stringify(data, null, 2), 'utf-8');
    return true;
  } catch (err) {
    if (err instanceof Error) {
      const nodeErr = err as NodeJS.ErrnoException;
      if (nodeErr.code === 'EROFS') {
        console.warn('Read-only filesystem, task persistent write bypassed');
        return false;
      }
      console.error('Failed to save tasks:', err);
    }
    return false;
  }
}

export async function runBenchmark(): Promise<{ added: number; total: number; errors: string[] }> {
  const existingTasks = loadTasks();
  const existingUrls = new Set(existingTasks.map(t => t.sourceUrl).filter(Boolean));
  const existingTitles = new Set(existingTasks.map(t => t.title));

  const parser = new Parser({
    headers: {
      'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
    },
    timeout: 10000,
  });

  const errors: string[] = [];
  let addedCount = 0;

  for (const feed of FEEDS) {
    try {
      const feedData = await parser.parseURL(feed.url);
      const items = feedData.items || [];

      for (const item of items) {
        if (!item.title) continue;

        const cleanTitle = item.title.trim();
        const itemUrl = item.link?.trim() || '';

        const taskTitle = `Review: ${cleanTitle}`;

        // Check duplicates
        if (existingTitles.has(taskTitle) || (itemUrl && existingUrls.has(itemUrl))) {
          continue;
        }

        const newTask: Task = {
          id: randomUUID(),
          title: taskTitle,
          description: item.contentSnippet || item.content || `Competitor benchmark task derived from ${feed.name}: ${cleanTitle}`,
          sourceUrl: itemUrl,
          source: feed.name,
          status: 'pending' as TaskStatus,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        };

        existingTasks.unshift(newTask);
        existingTitles.add(newTask.title);
        if (itemUrl) existingUrls.add(itemUrl);
        addedCount++;
      }
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      console.warn(`Failed to fetch or parse RSS feed for ${feed.name} (${feed.url}): ${msg}`);
      errors.push(`${feed.name}: ${msg}`);
    }
  }

  if (addedCount > 0) {
    saveTasks(existingTasks);
  }

  return {
    added: addedCount,
    total: existingTasks.length,
    errors,
  };
}
