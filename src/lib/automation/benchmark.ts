import Parser from 'rss-parser';
import fs from 'fs';
import path from 'path';
import { randomUUID } from 'crypto';
import { BenchmarkTask } from '@/types';

const DATA_DIR = path.join(process.cwd(), 'data');
const TASKS_FILE = path.join(DATA_DIR, 'tasks.json');

const parser = new Parser({
  headers: {
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
  },
  timeout: 10000,
});

const COMPETITOR_FEEDS = [
  { name: 'Wirecutter', url: 'https://www.nytimes.com/wirecutter/feed/' },
  { name: 'RTINGS', url: 'https://www.rtings.com/rss/reviews.xml' },
];

export async function getTasks(): Promise<BenchmarkTask[]> {
  try {
    if (!fs.existsSync(TASKS_FILE)) {
      return [];
    }
    const data = fs.readFileSync(TASKS_FILE, 'utf-8');
    return JSON.parse(data) as BenchmarkTask[];
  } catch (error: unknown) {
    if (error instanceof Error) {
      const err = error as NodeJS.ErrnoException;
      if (err.code === 'ENOENT' || err.code === 'EROFS') {
        return [];
      }
    }
    console.error('Failed to read tasks file:', error);
    return [];
  }
}

export async function saveData(tasks: BenchmarkTask[]): Promise<void> {
  try {
    if (!fs.existsSync(DATA_DIR)) {
      fs.mkdirSync(DATA_DIR, { recursive: true });
    }
    fs.writeFileSync(TASKS_FILE, JSON.stringify(tasks, null, 2), 'utf-8');
  } catch (error: unknown) {
    if (error instanceof Error) {
      const err = error as NodeJS.ErrnoException;
      if (err.code === 'EROFS') {
        console.warn('ReadOnlyFileSystem: cannot persist tasks locally.');
        return;
      }
    }
    console.error('Failed to save tasks:', error);
  }
}

export async function runBenchmark(): Promise<{ added: number; total: number }> {
  const existingTasks = await getTasks();
  const existingUrls = new Set(existingTasks.map(t => t.sourceUrl));
  const newTasks: BenchmarkTask[] = [];

  for (const feedConfig of COMPETITOR_FEEDS) {
    try {
      const feed = await parser.parseURL(feedConfig.url);
      const items = feed.items || [];

      for (const item of items.slice(0, 10)) {
        const itemUrl = item.link || item.guid || '';
        if (!itemUrl || existingUrls.has(itemUrl)) {
          continue;
        }

        const rawTitle = item.title || 'Untitled Article';
        const taskTitle = rawTitle.startsWith('Review:') ? rawTitle : `Review: ${rawTitle}`;
        const description = item.contentSnippet || item.content || `New article from ${feedConfig.name}`;

        const task: BenchmarkTask = {
          id: randomUUID(),
          title: taskTitle,
          description: description.slice(0, 300),
          sourceUrl: itemUrl,
          competitor: feedConfig.name,
          createdAt: new Date().toISOString(),
          status: 'pending',
        };

        newTasks.push(task);
        existingUrls.add(itemUrl);
      }
    } catch (error) {
      console.warn(`Failed to parse feed for ${feedConfig.name}:`, error);
      // Continue processing other feeds
    }
  }

  if (newTasks.length > 0) {
    const updatedTasks = [...newTasks, ...existingTasks];
    await saveData(updatedTasks);
    return { added: newTasks.length, total: updatedTasks.length };
  }

  return { added: 0, total: existingTasks.length };
}

export async function updateTaskStatus(taskId: string, status: 'pending' | 'in_progress' | 'completed'): Promise<boolean> {
  const tasks = await getTasks();
  const index = tasks.findIndex(t => t.id === taskId);
  if (index === -1) return false;

  tasks[index].status = status;
  await saveData(tasks);
  return true;
}
