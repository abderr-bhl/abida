import crypto from 'crypto';
import fs from 'fs';
import path from 'path';
import Parser from 'rss-parser';
import { Task } from '@/types';

const TASKS_FILE_PATH = path.join(process.cwd(), 'data', 'tasks.json');

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

function loadTasks(): Task[] {
  try {
    if (!fs.existsSync(TASKS_FILE_PATH)) {
      return [];
    }
    const data = fs.readFileSync(TASKS_FILE_PATH, 'utf8');
    return JSON.parse(data) as Task[];
  } catch (error) {
    console.warn('Failed to read tasks file:', error);
    return [];
  }
}

function saveTasks(tasks: unknown): boolean {
  try {
    const dir = path.dirname(TASKS_FILE_PATH);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    fs.writeFileSync(TASKS_FILE_PATH, JSON.stringify(tasks, null, 2), 'utf8');
    return true;
  } catch (error) {
    if (error instanceof Error) {
      const err = error as NodeJS.ErrnoException;
      if (err.code === 'EROFS') {
        console.warn('Warning: Read-only filesystem encountered (EROFS). Cannot save tasks to local JSON persistence.');
        return false;
      }
    }
    console.error('Error saving tasks:', error);
    return false;
  }
}

export async function runBenchmark(): Promise<{
  success: boolean;
  added: number;
  total: number;
  message?: string;
}> {
  const parser = new Parser({
    timeout: 8000,
  });

  const existingTasks = loadTasks();
  const existingUrls = new Set(existingTasks.map((t) => t.sourceUrl));
  const existingTitles = new Set(existingTasks.map((t) => t.title.toLowerCase()));

  const newTasks: Task[] = [];

  for (const feedConfig of RSS_FEEDS) {
    try {
      const feed = await parser.parseURL(feedConfig.url);

      if (feed.items) {
        for (const item of feed.items) {
          const itemUrl = item.link || item.guid || '';
          const itemTitle = item.title ? item.title.trim() : '';

          if (!itemTitle || !itemUrl) {
            continue;
          }

          const formattedTitle = itemTitle.toLowerCase().startsWith('review') || itemTitle.toLowerCase().startsWith('guide')
            ? itemTitle
            : `Review: ${itemTitle}`;

          if (existingUrls.has(itemUrl) || existingTitles.has(formattedTitle.toLowerCase())) {
            continue;
          }

          const description = item.contentSnippet || item.summary || item.content || `Competitor content detected from ${feedConfig.name}. Analyze and evaluate gap.`;

          const task: Task = {
            id: crypto.randomUUID(),
            title: formattedTitle,
            description: description.slice(0, 300),
            sourceUrl: itemUrl,
            source: feedConfig.name,
            status: 'pending',
            priority: 'medium',
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
          };

          newTasks.push(task);
          existingUrls.add(itemUrl);
          existingTitles.add(formattedTitle.toLowerCase());
        }
      }
    } catch (err) {
      // RTINGS or other feeds may return 404 or network timeout, log and gracefully continue
      console.warn(`Failed to parse RSS feed from ${feedConfig.name} (${feedConfig.url}):`, err instanceof Error ? err.message : err);
    }
  }

  if (newTasks.length > 0) {
    const updatedTasks = [...newTasks, ...existingTasks];
    saveTasks(updatedTasks);
    return {
      success: true,
      added: newTasks.length,
      total: updatedTasks.length,
      message: `Successfully processed benchmark. Added ${newTasks.length} new tasks.`,
    };
  }

  return {
    success: true,
    added: 0,
    total: existingTasks.length,
    message: 'Benchmark complete. No new competitor content found.',
  };
}

export function getAllTasks(): Task[] {
  return loadTasks();
}

export function updateTaskStatus(id: string, status: Task['status']): Task | null {
  const tasks = loadTasks();
  const taskIndex = tasks.findIndex((t) => t.id === id);

  if (taskIndex === -1) {
    return null;
  }

  tasks[taskIndex] = {
    ...tasks[taskIndex],
    status,
    updatedAt: new Date().toISOString(),
  };

  saveTasks(tasks);
  return tasks[taskIndex];
}
