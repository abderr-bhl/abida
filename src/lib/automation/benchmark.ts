import fs from 'fs';
import path from 'path';
import crypto from 'crypto';
import Parser from 'rss-parser';

export interface Task {
  id: string;
  title: string;
  description: string;
  status: 'pending' | 'in_progress' | 'completed';
  sourceUrl?: string;
  competitor: string;
  createdAt: string;
  updatedAt: string;
}

const DATA_DIR = path.join(process.cwd(), 'data');
const TASKS_FILE = path.join(DATA_DIR, 'tasks.json');

const COMPETITOR_FEEDS = [
  { name: 'Wirecutter', url: 'https://www.nytimes.com/wirecutter/feed/' },
  { name: 'RTINGS', url: 'https://www.rtings.com/rss/reviews.xml' },
];

export async function getTasks(): Promise<Task[]> {
  try {
    if (!fs.existsSync(TASKS_FILE)) {
      return [];
    }
    const data = await fs.promises.readFile(TASKS_FILE, 'utf-8');
    return JSON.parse(data) as Task[];
  } catch (error: unknown) {
    console.error('Error reading tasks file:', error);
    return [];
  }
}

export async function saveTasks(tasks: Task[]): Promise<boolean> {
  try {
    if (!fs.existsSync(DATA_DIR)) {
      await fs.promises.mkdir(DATA_DIR, { recursive: true });
    }
    await fs.promises.writeFile(TASKS_FILE, JSON.stringify(tasks, null, 2), 'utf-8');
    return true;
  } catch (err: unknown) {
    if (err instanceof Error && (err as NodeJS.ErrnoException).code === 'EROFS') {
      console.warn('Warning: Read-only filesystem detected, unable to write tasks to disk.');
      return false;
    }
    console.error('Error writing tasks file:', err);
    return false;
  }
}

export async function runBenchmark(): Promise<{ added: number; total: number; competitorCount: number }> {
  const existingTasks = await getTasks();
  const existingUrls = new Set(existingTasks.map((t) => t.sourceUrl).filter(Boolean));
  const existingTitles = new Set(existingTasks.map((t) => t.title.toLowerCase()));

  const parser = new Parser({
    headers: {
      'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) ReviewGuid Benchmark Bot',
    },
    timeout: 10000,
  });

  const newTasks: Task[] = [];
  let checkedCompetitors = 0;

  for (const feedConfig of COMPETITOR_FEEDS) {
    try {
      const feed = await parser.parseURL(feedConfig.url);
      checkedCompetitors++;

      if (feed && feed.items) {
        for (const item of feed.items.slice(0, 10)) {
          const itemUrl = item.link || item.guid;
          const rawTitle = item.title ? item.title.trim() : '';

          if (!rawTitle) continue;

          const taskTitle = `Review: ${rawTitle}`;

          if (itemUrl && existingUrls.has(itemUrl)) continue;
          if (existingTitles.has(taskTitle.toLowerCase())) continue;

          const newTask: Task = {
            id: crypto.randomUUID(),
            title: taskTitle,
            description: item.contentSnippet || item.content || `Automated gap analysis from ${feedConfig.name}: ${rawTitle}`,
            status: 'pending',
            sourceUrl: itemUrl,
            competitor: feedConfig.name,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
          };

          newTasks.push(newTask);
          if (itemUrl) existingUrls.add(itemUrl);
          existingTitles.add(taskTitle.toLowerCase());
        }
      }
    } catch (error: unknown) {
      console.warn(`Failed to parse RSS feed for ${feedConfig.name} (${feedConfig.url}):`, error);
    }
  }

  const updatedTasks = [...newTasks, ...existingTasks];
  await saveTasks(updatedTasks);

  return {
    added: newTasks.length,
    total: updatedTasks.length,
    competitorCount: checkedCompetitors,
  };
}

export async function updateTaskStatus(taskId: string, status: 'pending' | 'in_progress' | 'completed'): Promise<boolean> {
  const tasks = await getTasks();
  const taskIndex = tasks.findIndex((t) => t.id === taskId);

  if (taskIndex === -1) {
    return false;
  }

  tasks[taskIndex].status = status;
  tasks[taskIndex].updatedAt = new Date().toISOString();

  return await saveTasks(tasks);
}
