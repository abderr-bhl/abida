import fs from 'fs';
import path from 'path';
import crypto from 'crypto';
import Parser from 'rss-parser';

export interface Task {
  id: string;
  title: string;
  description: string;
  sourceUrl: string;
  competitor: string;
  status: 'pending' | 'in_progress' | 'completed' | 'cancelled';
  createdAt: string;
}

const DATA_DIR = path.join(process.cwd(), 'data');
const TASKS_FILE = path.join(DATA_DIR, 'tasks.json');

const RSS_FEEDS = [
  { competitor: 'Wirecutter', url: 'https://www.nytimes.com/wirecutter/feed/' },
  { competitor: 'RTINGS', url: 'https://www.rtings.com/rss/reviews.xml' },
];

export function loadTasks(): Task[] {
  try {
    if (!fs.existsSync(TASKS_FILE)) {
      return [];
    }
    const data = fs.readFileSync(TASKS_FILE, 'utf-8');
    return JSON.parse(data) as Task[];
  } catch (error) {
    console.error('Failed to load tasks:', error);
    return [];
  }
}

export function saveData(tasks: Task[]): void {
  try {
    if (!fs.existsSync(DATA_DIR)) {
      fs.mkdirSync(DATA_DIR, { recursive: true });
    }
    fs.writeFileSync(TASKS_FILE, JSON.stringify(tasks, null, 2), 'utf-8');
  } catch (err: unknown) {
    if (err instanceof Error && (err as NodeJS.ErrnoException).code === 'EROFS') {
      console.warn('ReadOnlyFileSystem: Unable to save tasks to local filesystem.');
    } else {
      console.error('Error saving data:', err);
    }
  }
}

export async function runBenchmark(): Promise<{ added: number; total: number }> {
  const parser = new Parser();
  const existingTasks = loadTasks();
  let addedCount = 0;

  for (const feedConfig of RSS_FEEDS) {
    try {
      const feed = await parser.parseURL(feedConfig.url);
      const items = feed.items || [];

      for (const item of items.slice(0, 5)) {
        if (!item.link || !item.title) continue;

        const exists = existingTasks.some((t) => t.sourceUrl === item.link);
        if (!exists) {
          const newTask: Task = {
            id: crypto.randomUUID(),
            title: `Review: ${item.title}`,
            description: `Competitor ${feedConfig.competitor} published standard content on: ${item.title}. Analyze and create standard US market guide.`,
            sourceUrl: item.link,
            competitor: feedConfig.competitor,
            status: 'pending',
            createdAt: new Date().toISOString(),
          };
          existingTasks.unshift(newTask);
          addedCount++;
        }
      }
    } catch (feedError) {
      console.warn(`Failed to fetch RSS feed for ${feedConfig.competitor}:`, feedError);
    }
  }

  if (addedCount > 0) {
    saveData(existingTasks);
  }

  return { added: addedCount, total: existingTasks.length };
}
