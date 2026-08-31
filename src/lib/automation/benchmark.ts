import fs from 'fs';
import path from 'path';
import crypto from 'crypto';
import Parser from 'rss-parser';

export interface Task {
  id: string;
  title: string;
  type: 'review' | 'guide' | 'comparison' | 'blog';
  competitor: string;
  sourceUrl: string;
  status: 'pending' | 'in_progress' | 'completed';
  createdAt: string;
  description: string;
}

const DATA_DIR = path.join(process.cwd(), 'data');
const TASKS_FILE = path.join(DATA_DIR, 'tasks.json');

const COMPETITOR_FEEDS = [
  { name: 'Wirecutter', url: 'https://www.nytimes.com/wirecutter/feed/' },
  { name: 'RTINGS', url: 'https://www.rtings.com/rss/reviews.xml' },
];

function ensureDataDirectory(): void {
  try {
    if (!fs.existsSync(DATA_DIR)) {
      fs.mkdirSync(DATA_DIR, { recursive: true });
    }
  } catch (err: unknown) {
    if (err instanceof Error && (err as NodeJS.ErrnoException).code === 'EROFS') {
      console.warn('Read-only filesystem encountered when creating data directory.');
    } else {
      throw err;
    }
  }
}

export function loadTasks(): Task[] {
  try {
    ensureDataDirectory();
    if (!fs.existsSync(TASKS_FILE)) {
      return [];
    }
    const raw = fs.readFileSync(TASKS_FILE, 'utf-8');
    const parsed: unknown = JSON.parse(raw);
    if (Array.isArray(parsed)) {
      return parsed as Task[];
    }
    return [];
  } catch (err: unknown) {
    if (err instanceof Error && (err as NodeJS.ErrnoException).code === 'EROFS') {
      console.warn('Read-only filesystem encountered when reading tasks file.');
    }
    return [];
  }
}

function saveTasks(tasks: Task[]): void {
  try {
    ensureDataDirectory();
    fs.writeFileSync(TASKS_FILE, JSON.stringify(tasks, null, 2), 'utf-8');
  } catch (err: unknown) {
    if (err instanceof Error && (err as NodeJS.ErrnoException).code === 'EROFS') {
      console.warn('Read-only filesystem encountered when saving tasks file.');
    } else {
      throw err;
    }
  }
}

export async function runBenchmark(): Promise<{ addedCount: number; tasks: Task[] }> {
  const parser = new Parser({
    timeout: 10000,
  });

  const existingTasks = loadTasks();
  const existingUrls = new Set(existingTasks.map((t) => t.sourceUrl));
  const newTasks: Task[] = [];

  for (const feedConfig of COMPETITOR_FEEDS) {
    try {
      const feed = await parser.parseURL(feedConfig.url);
      const items = feed.items || [];

      for (const item of items) {
        if (!item.link || existingUrls.has(item.link)) {
          continue;
        }

        const title = item.title?.trim() || 'Untitled Competitor Article';
        let type: Task['type'] = 'review';
        const lowerTitle = title.toLowerCase();

        if (lowerTitle.includes('best') || lowerTitle.includes('guide')) {
          type = 'guide';
        } else if (lowerTitle.includes('vs') || lowerTitle.includes('compared')) {
          type = 'comparison';
        } else if (lowerTitle.includes('news') || lowerTitle.includes('deal')) {
          type = 'blog';
        }

        const newTask: Task = {
          id: crypto.randomUUID(),
          title: `Review: ${title}`,
          type,
          competitor: feedConfig.name,
          sourceUrl: item.link,
          status: 'pending',
          createdAt: new Date().toISOString(),
          description: item.contentSnippet || item.summary || `Automated task identified from competitor feed ${feedConfig.name}.`,
        };

        newTasks.push(newTask);
        existingUrls.add(item.link);
      }
    } catch (err: unknown) {
      console.warn(`Failed to fetch or parse feed from ${feedConfig.name} (${feedConfig.url}):`, err);
    }
  }

  const updatedTasks = [...newTasks, ...existingTasks];
  if (newTasks.length > 0) {
    saveTasks(updatedTasks);
  }

  return {
    addedCount: newTasks.length,
    tasks: updatedTasks,
  };
}

export function updateTaskStatus(taskId: string, status: Task['status']): Task[] {
  const tasks = loadTasks();
  const updatedTasks = tasks.map((t) => (t.id === taskId ? { ...t, status } : t));
  saveTasks(updatedTasks);
  return updatedTasks;
}
