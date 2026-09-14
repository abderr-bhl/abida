import Parser from 'rss-parser';
import { Task } from '@/types';
import fs from 'fs';
import path from 'path';
import crypto from 'crypto';

const DATA_DIR = path.join(process.cwd(), 'data');
const TASKS_FILE = path.join(DATA_DIR, 'tasks.json');

const COMPETITOR_FEEDS = [
  {
    name: 'Wirecutter',
    url: 'https://www.nytimes.com/wirecutter/feed/',
  },
  {
    name: 'RTINGS',
    url: 'https://www.rtings.com/rss/reviews.xml',
  },
];

export async function getTasks(): Promise<Task[]> {
  try {
    if (!fs.existsSync(TASKS_FILE)) {
      return [];
    }
    const content = fs.readFileSync(TASKS_FILE, 'utf-8');
    const tasks = JSON.parse(content) as Task[];
    return tasks;
  } catch (error) {
    console.warn('Unable to read tasks file:', error);
    return [];
  }
}

export async function saveTasks(tasks: unknown[]): Promise<boolean> {
  try {
    if (!fs.existsSync(DATA_DIR)) {
      fs.mkdirSync(DATA_DIR, { recursive: true });
    }
    fs.writeFileSync(TASKS_FILE, JSON.stringify(tasks, null, 2), 'utf-8');
    return true;
  } catch (err) {
    const error = err as NodeJS.ErrnoException;
    if (error.code === 'EROFS') {
      console.warn('Warning: Read-only filesystem. Tasks cannot be saved locally.');
    } else {
      console.error('Error saving tasks:', error);
    }
    return false;
  }
}

export async function runBenchmark(): Promise<{
  added: number;
  existing: number;
  errors: string[];
  tasks: Task[];
}> {
  const parser = new Parser({
    headers: {
      'User-Agent':
        'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
    },
    timeout: 10000,
  });

  const existingTasks = await getTasks();
  const existingUrls = new Set(existingTasks.map((t) => t.sourceUrl));

  let addedCount = 0;
  let existingCount = 0;
  const errors: string[] = [];
  const newTasks: Task[] = [...existingTasks];

  for (const feedConfig of COMPETITOR_FEEDS) {
    try {
      const feed = await parser.parseURL(feedConfig.url);

      if (feed.items && feed.items.length > 0) {
        for (const item of feed.items) {
          const sourceUrl = item.link || item.guid || '';
          if (!sourceUrl) continue;

          if (existingUrls.has(sourceUrl)) {
            existingCount++;
            continue;
          }

          const rawTitle = item.title || 'Untitled Article';
          const title = rawTitle.startsWith('Review:') || rawTitle.startsWith('Guide:')
            ? rawTitle
            : `Review: ${rawTitle}`;

          const newTask: Task = {
            id: crypto.randomUUID(),
            title,
            description:
              item.contentSnippet ||
              item.content ||
              `Competitor article published by ${feedConfig.name}. Evaluate and create equivalent US market benchmark content.`,
            sourceUrl,
            competitor: feedConfig.name,
            status: 'pending',
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
          };

          newTasks.unshift(newTask);
          existingUrls.add(sourceUrl);
          addedCount++;
        }
      }
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : String(err);
      console.warn(
        `Failed to parse feed for competitor ${feedConfig.name} (${feedConfig.url}):`,
        errorMessage
      );
      errors.push(`${feedConfig.name}: ${errorMessage}`);
    }
  }

  await saveTasks(newTasks);

  return {
    added: addedCount,
    existing: existingCount,
    errors,
    tasks: newTasks,
  };
}

export async function updateTaskStatus(
  taskId: string,
  status: Task['status']
): Promise<boolean> {
  const tasks = await getTasks();
  const index = tasks.findIndex((t) => t.id === taskId);

  if (index === -1) {
    return false;
  }

  tasks[index] = {
    ...tasks[index],
    status,
    updatedAt: new Date().toISOString(),
  };

  return await saveTasks(tasks);
}
