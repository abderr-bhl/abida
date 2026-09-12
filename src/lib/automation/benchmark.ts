import Parser from 'rss-parser';
import fs from 'fs';
import path from 'path';
import crypto from 'crypto';

export interface TaskItem {
  id: string;
  title: string;
  description: string;
  competitor: string;
  sourceUrl: string;
  status: 'pending' | 'in_progress' | 'completed' | 'dismissed';
  createdAt: string;
}

const DATA_DIR = path.join(process.cwd(), 'data');
const TASKS_FILE = path.join(DATA_DIR, 'tasks.json');

const parser = new Parser({
  headers: {
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
  },
  timeout: 10000,
});

export function getStoredTasks(): TaskItem[] {
  try {
    if (!fs.existsSync(TASKS_FILE)) {
      return [];
    }
    const data = fs.readFileSync(TASKS_FILE, 'utf-8');
    return JSON.parse(data) as TaskItem[];
  } catch (err: unknown) {
    if (err instanceof Error && 'code' in err) {
      const errnoErr = err as NodeJS.ErrnoException;
      if (errnoErr.code === 'EROFS') {
        console.warn('Read-only filesystem detected when reading tasks:', errnoErr.message);
      }
    }
    return [];
  }
}

export function saveTasks(tasks: TaskItem[]): boolean {
  try {
    if (!fs.existsSync(DATA_DIR)) {
      fs.mkdirSync(DATA_DIR, { recursive: true });
    }
    fs.writeFileSync(TASKS_FILE, JSON.stringify(tasks, null, 2), 'utf-8');
    return true;
  } catch (err: unknown) {
    if (err instanceof Error && 'code' in err) {
      const errnoErr = err as NodeJS.ErrnoException;
      if (errnoErr.code === 'EROFS') {
        console.warn('Read-only filesystem detected when saving tasks:', errnoErr.message);
        return false;
      }
    }
    console.error('Failed to save tasks:', err);
    return false;
  }
}

export async function runBenchmark(): Promise<{ added: number; total: number; errors: string[] }> {
  const existingTasks = getStoredTasks();
  const existingUrls = new Set(existingTasks.map((t) => t.sourceUrl));
  const newTasks: TaskItem[] = [];
  const errors: string[] = [];

  const feeds = [
    { name: 'Wirecutter', url: 'https://www.nytimes.com/wirecutter/feed/' },
    { name: 'RTINGS', url: 'https://www.rtings.com/rss/reviews.xml' },
  ];

  for (const feedConfig of feeds) {
    try {
      const feed = await parser.parseURL(feedConfig.url);
      if (feed.items) {
        for (const item of feed.items) {
          if (!item.link || existingUrls.has(item.link)) continue;

          const itemTitle = item.title ? item.title.trim() : 'Competitor Update';
          const taskTitle = `Review: ${itemTitle}`;
          const taskDescription = `Competitor ${feedConfig.name} published: "${itemTitle}". Analyze content and update ReviewGuid guides/reviews to capture market share.`;

          newTasks.push({
            id: crypto.randomUUID(),
            title: taskTitle,
            description: taskDescription,
            competitor: feedConfig.name,
            sourceUrl: item.link,
            status: 'pending',
            createdAt: new Date().toISOString(),
          });

          existingUrls.add(item.link);
        }
      }
    } catch (err: unknown) {
      const errMsg = err instanceof Error ? err.message : String(err);
      console.warn(`Error fetching RSS feed for ${feedConfig.name}:`, errMsg);
      errors.push(`${feedConfig.name}: ${errMsg}`);
    }
  }

  const updatedTasks = [...newTasks, ...existingTasks];
  saveTasks(updatedTasks);

  return {
    added: newTasks.length,
    total: updatedTasks.length,
    errors,
  };
}
