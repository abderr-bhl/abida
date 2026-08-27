import fs from 'fs';
import path from 'path';
import crypto from 'crypto';
import Parser from 'rss-parser';

export type TaskStatus = 'pending' | 'in_progress' | 'completed' | 'ignored';

export interface BenchmarkTask {
  id: string;
  title: string;
  description: string;
  competitor: string;
  url: string;
  publishedAt: string;
  status: TaskStatus;
  createdAt: string;
  updatedAt: string;
}

const DATA_DIR = path.join(process.cwd(), 'data');
const TASKS_FILE = path.join(DATA_DIR, 'tasks.json');

const parser = new Parser({
  headers: {
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) ReviewGuidBot/1.0',
  },
  timeout: 5000,
});

const COMPETITOR_FEEDS = [
  { name: 'Wirecutter', url: 'https://www.nytimes.com/wirecutter/feed/' },
  { name: 'RTINGS', url: 'https://www.rtings.com/rss/reviews.xml' },
];

export async function loadTasks(): Promise<BenchmarkTask[]> {
  try {
    if (!fs.existsSync(TASKS_FILE)) {
      return getInitialSeedTasks();
    }
    const rawData = fs.readFileSync(TASKS_FILE, 'utf8');
    const parsedData: unknown = JSON.parse(rawData);
    if (Array.isArray(parsedData)) {
      return parsedData as BenchmarkTask[];
    }
    return getInitialSeedTasks();
  } catch (error) {
    console.warn('Could not read tasks file, returning seed tasks:', error);
    return getInitialSeedTasks();
  }
}

export async function saveTasks(tasks: BenchmarkTask[]): Promise<boolean> {
  try {
    if (!fs.existsSync(DATA_DIR)) {
      fs.mkdirSync(DATA_DIR, { recursive: true });
    }
    fs.writeFileSync(TASKS_FILE, JSON.stringify(tasks, null, 2), 'utf8');
    return true;
  } catch (err: unknown) {
    if (err instanceof Error) {
      const errnoErr = err as NodeJS.ErrnoException;
      if (errnoErr.code === 'EROFS') {
        console.warn('Read-only filesystem encountered (EROFS). Skipping file write.');
        return false;
      }
    }
    console.error('Failed to save tasks:', err);
    return false;
  }
}

function getInitialSeedTasks(): BenchmarkTask[] {
  const now = new Date().toISOString();
  return [
    {
      id: 'seed-task-1',
      title: 'Review: Wirecutter Best Noise-Canceling Headphones 2025 Update',
      description: 'Wirecutter updated their guide on top noise-canceling headphones. Analyze recommendations and update our comparison guide.',
      competitor: 'Wirecutter',
      url: 'https://www.nytimes.com/wirecutter/reviews/best-noise-cancelling-headphones/',
      publishedAt: now,
      status: 'pending',
      createdAt: now,
      updatedAt: now,
    },
    {
      id: 'seed-task-2',
      title: 'Review: RTINGS 4K TV Calibration Guidelines & OLED Benchmarks',
      description: 'New test methodologies for 4K OLED gaming monitors released by competitor.',
      competitor: 'RTINGS',
      url: 'https://www.rtings.com/tv/reviews/best/by-resolution/4k-ultra-hd-uhd',
      publishedAt: now,
      status: 'in_progress',
      createdAt: now,
      updatedAt: now,
    },
  ];
}

export async function runBenchmark(): Promise<{ addedCount: number; tasks: BenchmarkTask[] }> {
  const existingTasks = await loadTasks();
  const existingUrls = new Set(existingTasks.map((t) => t.url));

  let addedCount = 0;
  const newTasks: BenchmarkTask[] = [];

  for (const feedConfig of COMPETITOR_FEEDS) {
    try {
      const feed = await parser.parseURL(feedConfig.url);
      if (feed && feed.items) {
        for (const item of feed.items) {
          const itemUrl = item.link || item.guid || '';
          if (itemUrl && !existingUrls.has(itemUrl)) {
            const now = new Date().toISOString();
            const itemTitle = item.title ? item.title.trim() : 'New Competitor Article';
            const formattedTitle = itemTitle.startsWith('Review:') ? itemTitle : `Review: ${itemTitle}`;

            const task: BenchmarkTask = {
              id: crypto.randomUUID(),
              title: formattedTitle,
              description: item.contentSnippet || item.summary || `Automated benchmark task created from ${feedConfig.name} update.`,
              competitor: feedConfig.name,
              url: itemUrl,
              publishedAt: item.isoDate || item.pubDate || now,
              status: 'pending',
              createdAt: now,
              updatedAt: now,
            };

            newTasks.push(task);
            existingUrls.add(itemUrl);
            addedCount++;
          }
        }
      }
    } catch (error) {
      console.warn(`Failed to fetch RSS feed for ${feedConfig.name} (${feedConfig.url}):`, error);
    }
  }

  const updatedTasks = [...newTasks, ...existingTasks];
  await saveTasks(updatedTasks);

  return { addedCount, tasks: updatedTasks };
}

export async function updateTaskStatusInStore(
  taskId: string,
  newStatus: TaskStatus
): Promise<BenchmarkTask[] | null> {
  const tasks = await loadTasks();
  const index = tasks.findIndex((t) => t.id === taskId);
  if (index === -1) {
    return null;
  }

  tasks[index] = {
    ...tasks[index],
    status: newStatus,
    updatedAt: new Date().toISOString(),
  };

  await saveTasks(tasks);
  return tasks;
}
