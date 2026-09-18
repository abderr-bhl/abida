import Parser from 'rss-parser';
import fs from 'fs';
import path from 'path';
import { randomUUID } from 'crypto';
import { BenchmarkTask, TaskStatus } from './types';

const DATA_DIR = path.join(process.cwd(), 'data');
const TASKS_FILE = path.join(DATA_DIR, 'tasks.json');

const COMPETITOR_FEEDS = [
  { name: 'Wirecutter', url: 'https://www.nytimes.com/wirecutter/feed/' },
  { name: 'RTINGS', url: 'https://www.rtings.com/rss/reviews.xml' },
];

export async function loadTasks(): Promise<BenchmarkTask[]> {
  try {
    if (!fs.existsSync(TASKS_FILE)) {
      return [];
    }
    const content = fs.readFileSync(TASKS_FILE, 'utf-8');
    const parsed: unknown = JSON.parse(content);
    if (Array.isArray(parsed)) {
      return parsed as BenchmarkTask[];
    }
    return [];
  } catch (error) {
    const err = error as NodeJS.ErrnoException;
    if (err.code === 'ENOENT') {
      return [];
    }
    console.warn('Failed to load tasks from filesystem:', err.message);
    return [];
  }
}

export async function saveTasks(tasks: BenchmarkTask[]): Promise<boolean> {
  try {
    if (!fs.existsSync(DATA_DIR)) {
      fs.mkdirSync(DATA_DIR, { recursive: true });
    }
    fs.writeFileSync(TASKS_FILE, JSON.stringify(tasks, null, 2), 'utf-8');
    return true;
  } catch (error) {
    const err = error as NodeJS.ErrnoException;
    if (err.code === 'EROFS') {
      console.warn('Read-only filesystem detected (EROFS). Task state not persisted to disk.');
      return false;
    }
    console.error('Error saving tasks:', err);
    return false;
  }
}

export async function runBenchmarking(): Promise<{ addedCount: number; totalTasks: number; tasks: BenchmarkTask[] }> {
  const existingTasks = await loadTasks();
  const existingUrls = new Set(existingTasks.map((t) => t.competitorUrl));
  const parser = new Parser({ timeout: 10000 });
  const newTasks: BenchmarkTask[] = [];

  for (const feed of COMPETITOR_FEEDS) {
    try {
      const feedData = await parser.parseURL(feed.url);
      const items = feedData.items || [];

      for (const item of items) {
        if (!item.link || !item.title) continue;

        if (!existingUrls.has(item.link)) {
          const now = new Date().toISOString();
          const taskTitle = `Review: ${item.title.trim()}`;
          const taskDescription = `Analyze competitor article "${item.title.trim()}" from ${feed.name} (${item.link}) to identify content gap, update buying guides, and formulate US market strategy.`;

          const newTask: BenchmarkTask = {
            id: randomUUID(),
            title: taskTitle,
            description: taskDescription,
            competitorUrl: item.link,
            competitorSource: feed.name,
            status: 'pending',
            createdAt: now,
            updatedAt: now,
          };

          newTasks.push(newTask);
          existingUrls.add(item.link);
        }
      }
    } catch (feedError) {
      console.warn(`Failed to fetch RSS feed for ${feed.name} (${feed.url}):`, (feedError as Error).message);
    }
  }

  const updatedTasks = [...newTasks, ...existingTasks];
  if (newTasks.length > 0) {
    await saveTasks(updatedTasks);
  }

  return {
    addedCount: newTasks.length,
    totalTasks: updatedTasks.length,
    tasks: updatedTasks,
  };
}

export async function updateTaskStatus(taskId: string, status: TaskStatus): Promise<BenchmarkTask | null> {
  const tasks = await loadTasks();
  const taskIndex = tasks.findIndex((t) => t.id === taskId);

  if (taskIndex === -1) {
    return null;
  }

  const updatedTask: BenchmarkTask = {
    ...tasks[taskIndex],
    status,
    updatedAt: new Date().toISOString(),
  };

  tasks[taskIndex] = updatedTask;
  await saveTasks(tasks);

  return updatedTask;
}
