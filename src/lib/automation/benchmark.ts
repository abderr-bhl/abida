import crypto from 'crypto';
import fs from 'fs/promises';
import path from 'path';
import Parser from 'rss-parser';
import { Task, TaskStatus } from '@/types';
import { sanitizeUrl } from '@/lib/sanitize';

const DATA_DIR = path.join(process.cwd(), 'data');
const TASKS_FILE = path.join(DATA_DIR, 'tasks.json');

const RSS_FEEDS = [
  {
    name: 'Wirecutter',
    url: 'https://www.nytimes.com/wirecutter/feed/',
  },
  {
    name: 'RTINGS',
    url: 'https://www.rtings.com/rss/reviews.xml',
  },
];

const INITIAL_DEMO_TASKS: Task[] = [
  {
    id: crypto.randomUUID(),
    title: 'Review: Best Noise-Canceling Headphones 2026',
    description: 'Benchmark recent US competitor updates on wireless noise-canceling headphones and align content features.',
    status: 'pending',
    sourceUrl: 'https://www.nytimes.com/wirecutter/reviews/best-noise-cancelling-headphones/',
    sourceName: 'Wirecutter',
    category: 'Electronics',
    createdAt: new Date().toISOString(),
  },
  {
    id: crypto.randomUUID(),
    title: 'Review: Top OLED TVs for Gaming',
    description: 'Analyze competitive benchmark data from RTINGS for 4K 120Hz OLED gaming TVs.',
    status: 'in-progress',
    sourceUrl: 'https://www.rtings.com/tv/reviews/best/by-usage/hdr-gaming',
    sourceName: 'RTINGS',
    category: 'Home Theater',
    createdAt: new Date().toISOString(),
  },
];

export async function ensureDataDir(): Promise<void> {
  try {
    await fs.mkdir(DATA_DIR, { recursive: true });
  } catch (error) {
    if (error instanceof Error) {
      const err = error as NodeJS.ErrnoException;
      if (err.code === 'EROFS') {
        console.warn('Read-only filesystem detected, unable to create data directory.');
      }
    }
  }
}

export async function getTasks(): Promise<Task[]> {
  try {
    const data = await fs.readFile(TASKS_FILE, 'utf-8');
    const parsed: unknown = JSON.parse(data);
    if (Array.isArray(parsed)) {
      return parsed as Task[];
    }
    return [];
  } catch (error) {
    if (error instanceof Error) {
      const err = error as NodeJS.ErrnoException;
      if (err.code === 'ENOENT') {
        // File doesn't exist yet, return initial demo tasks and try to save them
        await saveTasks(INITIAL_DEMO_TASKS);
        return INITIAL_DEMO_TASKS;
      }
      if (err.code === 'EROFS') {
        console.warn('Read-only filesystem detected when reading tasks.');
        return INITIAL_DEMO_TASKS;
      }
    }
    return [];
  }
}

export async function saveTasks(tasks: Task[]): Promise<boolean> {
  try {
    await ensureDataDir();
    const dataToSave: unknown = tasks;
    await fs.writeFile(TASKS_FILE, JSON.stringify(dataToSave, null, 2), 'utf-8');
    return true;
  } catch (error) {
    if (error instanceof Error) {
      const err = error as NodeJS.ErrnoException;
      if (err.code === 'EROFS') {
        console.warn('Read-only filesystem (EROFS) - unable to persist tasks to disk.');
        return false;
      }
    }
    console.error('Failed to save tasks:', error);
    return false;
  }
}

export async function updateTaskStatus(taskId: string, status: TaskStatus): Promise<Task | null> {
  const tasks = await getTasks();
  const taskIndex = tasks.findIndex((t) => t.id === taskId);
  if (taskIndex === -1) {
    return null;
  }

  tasks[taskIndex] = {
    ...tasks[taskIndex],
    status,
  };

  await saveTasks(tasks);
  return tasks[taskIndex];
}

export async function runBenchmark(): Promise<{ added: number; tasks: Task[]; message?: string }> {
  const existingTasks = await getTasks();
  const existingUrls = new Set(existingTasks.map((t) => t.sourceUrl));
  const newTasks: Task[] = [];

  const parser = new Parser({
    headers: {
      'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) ReviewGuid Benchmark Bot/1.0',
    },
    timeout: 5000,
  });

  for (const feedConfig of RSS_FEEDS) {
    try {
      const feed = await parser.parseURL(feedConfig.url);
      if (feed.items) {
        for (const item of feed.items) {
          const rawUrl = item.link || '';
          const sourceUrl = sanitizeUrl(rawUrl);

          if (!sourceUrl || sourceUrl === '#' || existingUrls.has(sourceUrl)) {
            continue;
          }

          const rawTitle = item.title?.trim() || 'Untitled Competitor Article';
          const taskTitle = rawTitle.startsWith('Review:') || rawTitle.startsWith('Guide:')
            ? rawTitle
            : `Review: ${rawTitle}`;

          const category = (item.categories && item.categories[0])
            ? String(item.categories[0])
            : 'General';

          const newTask: Task = {
            id: crypto.randomUUID(),
            title: taskTitle,
            description: `Analyze US competitor article "${rawTitle}" and benchmark content gaps for reviewguid.com.`,
            status: 'pending',
            sourceUrl,
            sourceName: feedConfig.name,
            category,
            createdAt: new Date().toISOString(),
          };

          newTasks.push(newTask);
          existingUrls.add(sourceUrl);
        }
      }
    } catch (error) {
      console.warn(`Could not fetch RSS feed for ${feedConfig.name} (${feedConfig.url}):`, error);
      // Fallback/continue with next feeds
    }
  }

  const updatedTasks = [...newTasks, ...existingTasks];
  await saveTasks(updatedTasks);

  return {
    added: newTasks.length,
    tasks: updatedTasks,
    message: newTasks.length > 0
      ? `Successfully added ${newTasks.length} new benchmark task(s).`
      : 'Benchmark completed. No new competitor articles found.',
  };
}
