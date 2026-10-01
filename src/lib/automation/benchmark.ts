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
  status: 'PENDING' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED';
  createdAt: string;
  updatedAt: string;
}

const parser = new Parser({
  headers: {
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
  },
  timeout: 5000,
});

const TASKS_FILE_PATH = path.join(process.cwd(), 'data', 'tasks.json');

export function getTasks(): Task[] {
  try {
    if (!fs.existsSync(TASKS_FILE_PATH)) {
      return [];
    }
    const rawData = fs.readFileSync(TASKS_FILE_PATH, 'utf-8');
    const parsed: unknown = JSON.parse(rawData);
    if (Array.isArray(parsed)) {
      return parsed as Task[];
    }
    return [];
  } catch (error) {
    const err = error as NodeJS.ErrnoException;
    if (err.code === 'EROFS') {
      console.warn('FileSystem is read-only. Returning empty task list.');
    } else {
      console.error('Failed to read tasks file:', error);
    }
    return [];
  }
}

export function saveTasks(tasks: Task[]): void {
  try {
    const dir = path.dirname(TASKS_FILE_PATH);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    fs.writeFileSync(TASKS_FILE_PATH, JSON.stringify(tasks, null, 2), 'utf-8');
  } catch (error) {
    const err = error as NodeJS.ErrnoException;
    if (err.code === 'EROFS') {
      console.warn('FileSystem is read-only. Unable to save tasks to disk.');
    } else {
      console.error('Failed to save tasks:', error);
    }
  }
}

const FALLBACK_COMPETITOR_TASKS = [
  {
    title: 'Review: Best Wireless Noise-Canceling Headphones of 2026',
    description: 'Wirecutter published a new round-up on noise-canceling headphones. Create a comprehensive review focusing on Sony WH-1000XM5 vs Bose QuietComfort Ultra.',
    sourceUrl: 'https://www.nytimes.com/wirecutter/reviews/best-wireless-noise-canceling-headphones/',
    competitor: 'Wirecutter',
  },
  {
    title: 'Review: Top Ergonomic Office Chairs for Remote Work',
    description: 'RTINGS published updated testing results for ergonomic chairs. Analyze key ergonomic features and price points for US remote workers.',
    sourceUrl: 'https://www.rtings.com/chair/reviews/best/office-chairs',
    competitor: 'RTINGS',
  },
  {
    title: 'Review: Best Robot Vacuums for Pet Hair and Hardwood',
    description: 'Competitor benchmarking identified a high-traffic review category for smart robot vacuums with auto-empty docks.',
    sourceUrl: 'https://www.nytimes.com/wirecutter/reviews/best-robot-vacuum/',
    competitor: 'Wirecutter',
  },
];

export async function runBenchmark(): Promise<{ addedCount: number; totalTasks: number }> {
  const existingTasks = getTasks();
  const existingSourceUrls = new Set(existingTasks.map(t => t.sourceUrl));
  const newTasks: Task[] = [];

  const feeds = [
    { name: 'Wirecutter', url: 'https://www.nytimes.com/wirecutter/feed/' },
    { name: 'RTINGS', url: 'https://www.rtings.com/rss/reviews.xml' },
  ];

  let fetchedAny = false;

  for (const feedConfig of feeds) {
    try {
      const feed = await parser.parseURL(feedConfig.url);
      if (feed.items && feed.items.length > 0) {
        fetchedAny = true;
        for (const item of feed.items.slice(0, 5)) {
          const itemLink = item.link || item.guid || '';
          if (itemLink && !existingSourceUrls.has(itemLink)) {
            const now = new Date().toISOString();
            const newTask: Task = {
              id: crypto.randomUUID(),
              title: `Review: ${item.title || 'Untitled Competitor Content'}`,
              description: item.contentSnippet || item.summary || item.title || 'New competitor article identified for US market review.',
              sourceUrl: itemLink,
              competitor: feedConfig.name,
              status: 'PENDING',
              createdAt: now,
              updatedAt: now,
            };
            newTasks.push(newTask);
            existingSourceUrls.add(itemLink);
          }
        }
      }
    } catch (err) {
      console.warn(`Failed to fetch RSS feed for ${feedConfig.name}:`, err);
    }
  }

  // If feeds failed (or bot protected/offline), trigger fallback benchmarking tasks if no tasks exist or as fallback
  if (!fetchedAny || newTasks.length === 0) {
    for (const fallback of FALLBACK_COMPETITOR_TASKS) {
      if (!existingSourceUrls.has(fallback.sourceUrl)) {
        const now = new Date().toISOString();
        const newTask: Task = {
          id: crypto.randomUUID(),
          title: fallback.title,
          description: fallback.description,
          sourceUrl: fallback.sourceUrl,
          competitor: fallback.competitor,
          status: 'PENDING',
          createdAt: now,
          updatedAt: now,
        };
        newTasks.push(newTask);
        existingSourceUrls.add(fallback.sourceUrl);
      }
    }
  }

  const updatedTasks = [...newTasks, ...existingTasks];
  saveTasks(updatedTasks);

  return {
    addedCount: newTasks.length,
    totalTasks: updatedTasks.length,
  };
}
