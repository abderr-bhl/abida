import crypto from 'crypto';
import fs from 'fs';
import path from 'path';
import Parser from 'rss-parser';

export interface AutomatedTask {
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

const parser = new Parser();

const COMPETITOR_FEEDS = [
  { name: 'Wirecutter', url: 'https://www.nytimes.com/wirecutter/feed/' },
  { name: 'RTINGS', url: 'https://www.rtings.com/rss/reviews.xml' },
];

export function getTasks(): AutomatedTask[] {
  try {
    if (!fs.existsSync(TASKS_FILE)) {
      return [];
    }
    const data = fs.readFileSync(TASKS_FILE, 'utf-8');
    return JSON.parse(data) as AutomatedTask[];
  } catch {
    return [];
  }
}

function saveData(tasks: unknown): void {
  try {
    if (!fs.existsSync(DATA_DIR)) {
      fs.mkdirSync(DATA_DIR, { recursive: true });
    }
    fs.writeFileSync(TASKS_FILE, JSON.stringify(tasks, null, 2), 'utf-8');
  } catch (err) {
    if (err instanceof Error) {
      const errnoErr = err as NodeJS.ErrnoException;
      if (errnoErr.code === 'EROFS') {
        console.warn('Warning: Read-only filesystem detected. Task data not saved to disk.');
        return;
      }
    }
    console.error('Failed to save task data:', err);
  }
}

export async function runBenchmark(): Promise<{ added: number; total: number }> {
  const existingTasks = getTasks();
  const existingUrls = new Set(existingTasks.map((t) => t.sourceUrl));
  const newTasks: AutomatedTask[] = [];

  for (const feed of COMPETITOR_FEEDS) {
    try {
      const parsedFeed = await parser.parseURL(feed.url);
      for (const item of parsedFeed.items || []) {
        if (item.link && !existingUrls.has(item.link)) {
          const task: AutomatedTask = {
            id: crypto.randomUUID(),
            title: `Review: ${item.title || 'Competitor Article'}`,
            description: `Automated task created from competitor content benchmark (${feed.name}). Title: ${item.title || 'Untitled'}`,
            sourceUrl: item.link,
            competitor: feed.name,
            status: 'pending',
            createdAt: new Date().toISOString(),
          };
          newTasks.push(task);
          existingUrls.add(item.link);
        }
      }
    } catch (err) {
      console.warn(`Failed to fetch or parse feed from ${feed.name}:`, err);
    }
  }

  const updatedTasks = [...newTasks, ...existingTasks];
  saveData(updatedTasks);

  return { added: newTasks.length, total: updatedTasks.length };
}

export function updateTaskStatus(taskId: string, status: AutomatedTask['status']): boolean {
  const tasks = getTasks();
  const index = tasks.findIndex((t) => t.id === taskId);
  if (index === -1) return false;

  tasks[index].status = status;
  saveData(tasks);
  return true;
}
