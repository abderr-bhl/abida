import Parser from 'rss-parser';
import fs from 'fs';
import path from 'path';
import crypto from 'crypto';

export interface Task {
  id: string;
  title: string;
  description: string;
  source: string;
  targetUrl: string;
  status: 'pending' | 'in_progress' | 'completed';
  createdAt: string;
}

const DATA_DIR = path.join(process.cwd(), 'data');
const TASKS_FILE = path.join(DATA_DIR, 'tasks.json');

const RSS_FEEDS = [
  { name: 'Wirecutter', url: 'https://www.nytimes.com/wirecutter/feed/' },
  { name: 'RTINGS', url: 'https://www.rtings.com/rss/reviews.xml' },
];

export async function loadTasks(): Promise<Task[]> {
  try {
    if (!fs.existsSync(TASKS_FILE)) {
      return [];
    }
    const data = fs.readFileSync(TASKS_FILE, 'utf-8');
    return JSON.parse(data) as Task[];
  } catch (error: unknown) {
    if (error instanceof Error) {
      const err = error as NodeJS.ErrnoException;
      if (err.code === 'ENOENT') {
        return [];
      }
    }
    console.warn('Could not read tasks file:', error);
    return [];
  }
}

export async function saveTasks(tasks: unknown): Promise<boolean> {
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
        console.warn('Read-only filesystem, skipping save');
        return false;
      }
    }
    console.error('Failed to save tasks:', error);
    return false;
  }
}

export async function runBenchmarking(): Promise<{ addedCount: number; tasks: Task[] }> {
  const parser = new Parser({
    headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) ReviewGuid/1.0' },
    timeout: 5000,
  });

  const existingTasks = await loadTasks();
  const existingUrls = new Set(existingTasks.map((t) => t.targetUrl));
  const newTasks: Task[] = [];

  for (const feedConfig of RSS_FEEDS) {
    try {
      const feed = await parser.parseURL(feedConfig.url);
      const items = feed.items || [];

      for (const item of items.slice(0, 10)) {
        if (!item.link || existingUrls.has(item.link)) {
          continue;
        }

        const taskTitle = item.title ? `Review: ${item.title}` : `Review competitor content from ${feedConfig.name}`;
        const taskDescription = item.contentSnippet || item.content || `New competitor post identified on ${feedConfig.name}`;

        const newTask: Task = {
          id: crypto.randomUUID(),
          title: taskTitle,
          description: taskDescription.slice(0, 300),
          source: feedConfig.name,
          targetUrl: item.link,
          status: 'pending',
          createdAt: new Date().toISOString(),
        };

        newTasks.push(newTask);
        existingUrls.add(item.link);
      }
    } catch (err) {
      console.warn(`Failed to parse feed for ${feedConfig.name}:`, err);
    }
  }

  const updatedTasks = [...newTasks, ...existingTasks];
  await saveTasks(updatedTasks);

  return {
    addedCount: newTasks.length,
    tasks: updatedTasks,
  };
}
