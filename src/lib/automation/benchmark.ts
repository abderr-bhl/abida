import fs from 'fs';
import path from 'path';
import crypto from 'crypto';
import Parser from 'rss-parser';
import { Task } from '@/types/task';

const parser = new Parser();

const DATA_DIR = path.join(process.cwd(), 'data');
const TASKS_FILE = path.join(DATA_DIR, 'tasks.json');

export function loadTasks(): Task[] {
  try {
    if (!fs.existsSync(TASKS_FILE)) {
      return [];
    }
    const data = fs.readFileSync(TASKS_FILE, 'utf-8');
    return JSON.parse(data) as Task[];
  } catch (error: unknown) {
    if (error instanceof Error) {
      const err = error as NodeJS.ErrnoException;
      if (err.code === 'EROFS') {
        console.warn('Read-only filesystem: unable to read tasks from disk.');
      } else {
        console.error('Error reading tasks file:', err.message);
      }
    }
    return [];
  }
}

export function saveTasks(tasks: unknown): boolean {
  try {
    if (!fs.existsSync(DATA_DIR)) {
      fs.mkdirSync(DATA_DIR, { recursive: true });
    }
    fs.writeFileSync(TASKS_FILE, JSON.stringify(tasks, null, 2), 'utf-8');
    return true;
  } catch (error: unknown) {
    if (error instanceof Error) {
      const err = error as NodeJS.ErrnoException;
      if (err.code === 'EROFS') {
        console.warn('Read-only filesystem: unable to save tasks to disk.');
      } else {
        console.error('Error saving tasks file:', err.message);
      }
    }
    return false;
  }
}

const COMPETITOR_FEEDS = [
  {
    name: 'Wirecutter' as const,
    url: 'https://www.nytimes.com/wirecutter/feed/',
  },
  {
    name: 'RTINGS' as const,
    url: 'https://www.rtings.com/rss/reviews.xml',
  },
];

export async function runCompetitiveBenchmarking(): Promise<{
  newTasksCount: number;
  tasks: Task[];
  errors: string[];
}> {
  const existingTasks = loadTasks();
  const existingUrls = new Set(existingTasks.map((t) => t.sourceUrl));
  const newTasks: Task[] = [];
  const errors: string[] = [];

  for (const feedConfig of COMPETITOR_FEEDS) {
    try {
      const feed = await parser.parseURL(feedConfig.url);
      const items = feed.items || [];

      for (const item of items.slice(0, 10)) {
        if (!item.link || existingUrls.has(item.link)) {
          continue;
        }

        const title = item.title || 'Untitled Competitor Article';
        const pubDate = item.pubDate ? new Date(item.pubDate).toISOString() : new Date().toISOString();

        const task: Task = {
          id: crypto.randomUUID(),
          title: `Review: ${title}`,
          description: `Competitor (${feedConfig.name}) published a new article: "${title}". Benchmark content and create competitive buying guide/review targeting the US market.`,
          source: feedConfig.name,
          sourceUrl: item.link,
          status: 'pending',
          createdAt: pubDate,
          updatedAt: new Date().toISOString(),
          suggestedAction: `Create competitor analysis and US market guide for: ${title}`,
        };

        newTasks.push(task);
        existingUrls.add(item.link);
      }
    } catch (error: unknown) {
      const msg = error instanceof Error ? error.message : String(error);
      console.warn(`Failed to parse feed for ${feedConfig.name}:`, msg);
      errors.push(`[${feedConfig.name}] ${msg}`);
    }
  }

  const allTasks = [...newTasks, ...existingTasks];
  saveTasks(allTasks);

  return {
    newTasksCount: newTasks.length,
    tasks: allTasks,
    errors,
  };
}
