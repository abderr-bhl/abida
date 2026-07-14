import Parser from 'rss-parser';
import { Task, BenchmarkRecord } from '@/types';
import fs from 'fs/promises';
import path from 'path';
import crypto from 'crypto';

const DATA_DIR = path.join(process.cwd(), 'data');
const TASKS_FILE = path.join(DATA_DIR, 'tasks.json');

const parser = new Parser();

const COMPETITORS = [
  {
    name: 'Wirecutter' as const,
    rssUrl: 'https://www.nytimes.com/wirecutter/feed/',
  },
  {
    name: 'RTINGS' as const,
    rssUrl: 'https://www.rtings.com/rss/reviews.xml',
  },
];

async function ensureDataDir() {
  try {
    await fs.access(DATA_DIR);
  } catch {
    await fs.mkdir(DATA_DIR, { recursive: true });
  }
}

async function getExistingTasks(): Promise<Task[]> {
  try {
    const data = await fs.readFile(TASKS_FILE, 'utf-8');
    return JSON.parse(data);
  } catch {
    return [];
  }
}

async function saveTasks(tasks: Task[]) {
  try {
    await ensureDataDir();
    await fs.writeFile(TASKS_FILE, JSON.stringify(tasks, null, 2));
  } catch (error) {
    if ((error as any).code === 'EROFS') {
      console.warn('Warning: Read-only filesystem detected. Tasks not saved to disk.');
    } else {
      throw error;
    }
  }
}

export async function runBenchmark(): Promise<BenchmarkRecord> {
  const existingTasks = await getExistingTasks();
  const existingUrls = new Set(existingTasks.map(t => t.sourceUrl));
  let newTasksCount = 0;

  for (const competitor of COMPETITORS) {
    try {
      const feed = await parser.parseURL(competitor.rssUrl);

      for (const item of feed.items) {
        if (item.link && !existingUrls.has(item.link)) {
          const newTask: Task = {
            id: crypto.randomUUID(),
            title: `Review: ${item.title || 'New Content'}`,
            description: `Automated task based on ${competitor.name}'s latest update.`,
            sourceUrl: item.link,
            competitor: competitor.name,
            status: 'pending',
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
          };
          existingTasks.push(newTask);
          newTasksCount++;
        }
      }
    } catch (error) {
      console.error(`Error fetching feed for ${competitor.name}:`, error);
    }
  }

  if (newTasksCount > 0) {
    await saveTasks(existingTasks);
  }

  return {
    lastRun: new Date().toISOString(),
    newTasksFound: newTasksCount,
  };
}

export async function getTasks(): Promise<Task[]> {
  return await getExistingTasks();
}

export async function updateTaskStatus(taskId: string, status: Task['status']): Promise<void> {
  const tasks = await getExistingTasks();
  const taskIndex = tasks.findIndex(t => t.id === taskId);
  if (taskIndex > -1) {
    tasks[taskIndex].status = status;
    tasks[taskIndex].updatedAt = new Date().toISOString();
    await saveTasks(tasks);
  }
}
