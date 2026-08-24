import Parser from 'rss-parser';
import crypto from 'crypto';
import fs from 'fs/promises';
import path from 'path';
import { Task } from '@/types';

const TASKS_FILE_PATH = path.join(process.cwd(), 'data', 'tasks.json');

const RSS_FEEDS = [
  { name: 'Wirecutter', url: 'https://www.nytimes.com/wirecutter/feed/' },
  { name: 'RTINGS', url: 'https://www.rtings.com/rss/reviews.xml' },
];

function serializeData(data: unknown): string {
  return JSON.stringify(data, null, 2);
}

export async function getTasks(): Promise<Task[]> {
  try {
    const fileContent = await fs.readFile(TASKS_FILE_PATH, 'utf-8');
    const parsed = JSON.parse(fileContent) as unknown;
    if (Array.isArray(parsed)) {
      return parsed as Task[];
    }
    return [];
  } catch (error) {
    if (error instanceof Error) {
      const err = error as NodeJS.ErrnoException;
      if (err.code === 'ENOENT') {
        return [];
      }
    }
    console.warn('Error reading tasks file:', error);
    return [];
  }
}

export async function saveTasks(tasks: Task[]): Promise<boolean> {
  try {
    const dir = path.dirname(TASKS_FILE_PATH);
    await fs.mkdir(dir, { recursive: true });
    await fs.writeFile(TASKS_FILE_PATH, serializeData(tasks), 'utf-8');
    return true;
  } catch (error) {
    if (error instanceof Error) {
      const err = error as NodeJS.ErrnoException;
      if (err.code === 'EROFS') {
        console.warn('ReadOnlyFileSystem (EROFS): Unable to write tasks.json to local filesystem.');
        return false;
      }
    }
    console.error('Failed to save tasks:', error);
    return false;
  }
}

export async function updateTaskStatus(taskId: string, status: Task['status']): Promise<Task | null> {
  const tasks = await getTasks();
  const taskIndex = tasks.findIndex(t => t.id === taskId);
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

export async function runBenchmark(): Promise<{ added: number; total: number; errors: string[] }> {
  const parser = new Parser({
    timeout: 10000,
  });

  const existingTasks = await getTasks();
  const existingUrls = new Set(existingTasks.map(t => t.sourceUrl));
  const newTasks: Task[] = [];
  const errors: string[] = [];

  for (const feed of RSS_FEEDS) {
    try {
      const feedResult = await parser.parseURL(feed.url);
      if (feedResult && feedResult.items) {
        for (const item of feedResult.items) {
          const link = item.link || item.guid;
          if (!link || existingUrls.has(link)) {
            continue;
          }

          const rawTitle = item.title || 'Untitled Article';
          const taskTitle = `Review: ${rawTitle}`;
          const taskDescription = `New competitor article published on ${feed.name}: "${rawTitle}". Evaluate content gap and create a corresponding guide/review.`;

          const newTask: Task = {
            id: crypto.randomUUID(),
            title: taskTitle,
            description: taskDescription,
            source: feed.name,
            sourceUrl: link,
            status: 'pending',
            createdAt: new Date().toISOString(),
          };

          newTasks.push(newTask);
          existingUrls.add(link);
        }
      }
    } catch (error) {
      const errorMsg = `Failed to fetch/parse RSS feed for ${feed.name} (${feed.url}): ${
        error instanceof Error ? error.message : String(error)
      }`;
      console.warn(errorMsg);
      errors.push(errorMsg);
    }
  }

  const updatedTasks = [...newTasks, ...existingTasks];
  if (newTasks.length > 0) {
    await saveTasks(updatedTasks);
  }

  return {
    added: newTasks.length,
    total: updatedTasks.length,
    errors,
  };
}
