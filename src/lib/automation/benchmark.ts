import Parser from 'rss-parser';
import fs from 'fs';
import path from 'path';
import crypto from 'crypto';

export interface Task {
  id: string;
  title: string;
  description: string;
  competitor: string;
  sourceUrl: string;
  status: 'pending' | 'in_progress' | 'completed';
  createdAt: string;
}

const DATA_DIR = path.join(process.cwd(), 'data');
const TASKS_FILE = path.join(DATA_DIR, 'tasks.json');

const RSS_FEEDS = [
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
      const errnoErr = err as NodeJS.ErrnoException;
      if (errnoErr.code === 'EROFS') {
        console.warn('Read-only filesystem: unable to create data directory.');
      }
    }
  }
}

export function getTasks(): Task[] {
  try {
    ensureDataDir();
    if (!fs.existsSync(TASKS_FILE)) {
      return [];
    }
    const rawData = fs.readFileSync(TASKS_FILE, 'utf-8');
    const parsedData: unknown = JSON.parse(rawData);
    if (Array.isArray(parsedData)) {
      return parsedData as Task[];
    }
    return [];
  } catch (err) {
    if (err instanceof Error) {
      const errnoErr = err as NodeJS.ErrnoException;
      if (errnoErr.code === 'EROFS') {
        console.warn('Read-only filesystem: unable to read tasks file.');
      }
    }
    return [];
  }
}

export function saveTasks(tasks: Task[]): void {
  try {
    ensureDataDir();
    const dataToSave: unknown = tasks;
    fs.writeFileSync(TASKS_FILE, JSON.stringify(dataToSave, null, 2), 'utf-8');
  } catch (err) {
    if (err instanceof Error) {
      const errnoErr = err as NodeJS.ErrnoException;
      if (errnoErr.code === 'EROFS') {
        console.warn('Read-only filesystem: unable to save tasks.');
      }
    }
  }
}

export async function runBenchmark(): Promise<{ addedTasksCount: number; newTasks: Task[] }> {
  const parser = new Parser({
    headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) ReviewGuid/1.0' },
  });

  const existingTasks = getTasks();
  const existingUrls = new Set(existingTasks.map((t) => t.sourceUrl));
  const newTasks: Task[] = [];

  for (const feedConfig of RSS_FEEDS) {
    try {
      const feed = await parser.parseURL(feedConfig.url);
      const items = feed.items || [];

      for (const item of items.slice(0, 5)) {
        const url = item.link || item.guid || '';
        if (!url || existingUrls.has(url)) {
          continue;
        }

        const rawTitle = item.title?.trim() || 'New Competitor Article';
        const title = rawTitle.toLowerCase().startsWith('review:') || rawTitle.toLowerCase().startsWith('guide:')
          ? rawTitle
          : `Review: ${rawTitle}`;

        const description = item.contentSnippet || item.content || `Competitor content identified from ${feedConfig.name}.`;

        const task: Task = {
          id: crypto.randomUUID(),
          title,
          description,
          competitor: feedConfig.name,
          sourceUrl: url,
          status: 'pending',
          createdAt: new Date().toISOString(),
        };

        newTasks.push(task);
        existingUrls.add(url);
      }
    } catch (error) {
      console.warn(`Failed to fetch or parse RSS feed for ${feedConfig.name}:`, error);
    }
  }

  const updatedTasks = [...newTasks, ...existingTasks];
  saveTasks(updatedTasks);

  return {
    addedTasksCount: newTasks.length,
    newTasks,
  };
}
