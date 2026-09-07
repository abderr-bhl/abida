import Parser from 'rss-parser';
import fs from 'fs/promises';
import path from 'path';
import crypto from 'crypto';

export interface BenchmarkTask {
  id: string;
  title: string;
  description: string;
  sourceUrl: string;
  competitor: string;
  status: 'pending' | 'in_progress' | 'completed';
  createdAt: string;
}

const DATA_DIR = path.join(process.cwd(), 'data');
const TASKS_FILE = path.join(DATA_DIR, 'tasks.json');

const parser = new Parser({
  headers: {
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/115.0.0.0 Safari/537.36',
  },
  timeout: 10000,
});

const RSS_FEEDS = [
  { name: 'Wirecutter', url: 'https://www.nytimes.com/wirecutter/feed/' },
  { name: 'RTINGS', url: 'https://www.rtings.com/rss/reviews.xml' },
];

async function loadTasks(): Promise<BenchmarkTask[]> {
  try {
    const data = await fs.readFile(TASKS_FILE, 'utf-8');
    return JSON.parse(data) as BenchmarkTask[];
  } catch {
    return [];
  }
}

async function saveTasks(tasks: BenchmarkTask[]): Promise<void> {
  try {
    await fs.mkdir(DATA_DIR, { recursive: true });
    await fs.writeFile(TASKS_FILE, JSON.stringify(tasks, null, 2), 'utf-8');
  } catch (err: unknown) {
    if (err && typeof err === 'object' && 'code' in err) {
      const nodeErr = err as NodeJS.ErrnoException;
      if (nodeErr.code === 'EROFS') {
        console.warn('ReadOnlyFileSystem: Unable to save tasks to disk in read-only environment.');
        return;
      }
    }
    console.error('Failed to save tasks:', err);
  }
}

export async function runBenchmark(): Promise<{ added: number; tasks: BenchmarkTask[] }> {
  const existingTasks = await loadTasks();
  const existingUrls = new Set(existingTasks.map((t) => t.sourceUrl));
  const newTasks: BenchmarkTask[] = [];

  for (const feed of RSS_FEEDS) {
    try {
      const parsedFeed = await parser.parseURL(feed.url);
      const items = parsedFeed.items || [];

      for (const item of items) {
        if (!item.link) continue;
        if (existingUrls.has(item.link)) continue;

        const rawTitle = item.title?.trim() || 'New Competitor Content';
        const taskTitle = `Review: ${rawTitle}`;
        const taskDescription = `Competitor (${feed.name}) published new content: "${rawTitle}". Review and benchmark for US market gap analysis.`;

        const task: BenchmarkTask = {
          id: crypto.randomUUID(),
          title: taskTitle,
          description: taskDescription,
          sourceUrl: item.link,
          competitor: feed.name,
          status: 'pending',
          createdAt: new Date().toISOString(),
        };

        newTasks.push(task);
        existingUrls.add(item.link);
      }
    } catch (err) {
      console.warn(`Failed to fetch or parse RSS feed for ${feed.name}:`, err);
    }
  }

  const updatedTasks = [...newTasks, ...existingTasks];
  if (newTasks.length > 0) {
    await saveTasks(updatedTasks);
  }

  return { added: newTasks.length, tasks: updatedTasks };
}

export async function getTasks(): Promise<BenchmarkTask[]> {
  return loadTasks();
}

export async function updateTaskStatus(
  taskId: string,
  status: 'pending' | 'in_progress' | 'completed'
): Promise<BenchmarkTask[]> {
  const tasks = await loadTasks();
  const index = tasks.findIndex((t) => t.id === taskId);
  if (index !== -1) {
    tasks[index].status = status;
    await saveTasks(tasks);
  }
  return tasks;
}
