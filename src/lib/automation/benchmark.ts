import crypto from 'crypto';
import fs from 'fs';
import path from 'path';
import Parser from 'rss-parser';
import { BenchmarkTask, TaskStatus } from '@/types';

const DATA_DIR = path.join(process.cwd(), 'data');
const TASKS_FILE = path.join(DATA_DIR, 'tasks.json');

const COMPETITOR_FEEDS = [
  {
    name: 'Wirecutter',
    url: 'https://www.nytimes.com/wirecutter/feed/',
    category: 'Tech & Home'
  },
  {
    name: 'RTINGS',
    url: 'https://www.rtings.com/rss/reviews.xml',
    category: 'Electronics'
  }
];

const FALLBACK_BENCHMARKS = [
  {
    title: 'Review: The Best Noise-Cancelling Headphones of 2026',
    description: 'Wirecutter recently updated their top recommendations for noise-cancelling headphones. Benchmark features, sound quality tests, and price points.',
    competitor: 'Wirecutter',
    sourceUrl: 'https://www.nytimes.com/wirecutter/reviews/best-wireless-noise-canceling-headphones/',
    category: 'Electronics'
  },
  {
    title: 'Comparison: OLED vs QD-OLED TVs for Gaming',
    description: 'RTINGS published a comprehensive comparison between QD-OLED and standard OLED panels in high-refresh rate gaming conditions.',
    competitor: 'RTINGS',
    sourceUrl: 'https://www.rtings.com/tv/reviews/best/by-type/oled',
    category: 'Electronics'
  },
  {
    title: 'Guide: Best Ergonomic Office Chairs for Remote Work',
    description: 'Wirecutter released a new buyer guide covering long-term ergonomic testing for office chairs.',
    competitor: 'Wirecutter',
    sourceUrl: 'https://www.nytimes.com/wirecutter/reviews/best-office-chair/',
    category: 'Home & Office'
  },
  {
    title: 'Review: Best Robot Vacuums for Pet Hair',
    description: 'Competitors updated their evaluations on obstacle avoidance and suction performance for pet owners.',
    competitor: 'Wirecutter',
    sourceUrl: 'https://www.nytimes.com/wirecutter/reviews/best-robot-vacuum/',
    category: 'Home Appliances'
  }
];

// In-memory fallback cache when file system is read-only or during dynamic execution
let memoryTasksCache: BenchmarkTask[] | null = null;

const initialDefaultTasks: BenchmarkTask[] = [
  {
    id: 'task-1',
    title: 'Review: Best Wireless Earbuds for iPhone',
    description: 'Competitor Wirecutter updated their top pick for Wireless Earbuds. Create a US targeted review comparing sound profiles.',
    competitor: 'Wirecutter',
    sourceUrl: 'https://www.nytimes.com/wirecutter/reviews/best-wireless-earbuds/',
    category: 'Electronics',
    status: 'Pending',
    createdAt: new Date(Date.now() - 86400000 * 2).toISOString(),
    updatedAt: new Date(Date.now() - 86400000 * 2).toISOString()
  },
  {
    id: 'task-2',
    title: 'Guide: Best 4K Gaming Monitors under $500',
    description: 'RTINGS tested 15 new 4K high-refresh rate monitors. Benchmark color accuracy and input latency specifications.',
    competitor: 'RTINGS',
    sourceUrl: 'https://www.rtings.com/monitor/reviews/best/by-usage/gaming',
    category: 'Gaming',
    status: 'In Progress',
    createdAt: new Date(Date.now() - 86400000).toISOString(),
    updatedAt: new Date(Date.now() - 86400000).toISOString()
  }
];

export async function getTasks(): Promise<BenchmarkTask[]> {
  if (memoryTasksCache !== null) {
    return memoryTasksCache;
  }

  try {
    if (!fs.existsSync(TASKS_FILE)) {
      await saveTasks(initialDefaultTasks);
      return initialDefaultTasks;
    }
    const data = await fs.promises.readFile(TASKS_FILE, 'utf-8');
    const tasks: BenchmarkTask[] = JSON.parse(data);
    memoryTasksCache = tasks;
    return tasks;
  } catch (err: unknown) {
    console.warn('Unable to read tasks file, returning memory cache or defaults:', err);
    memoryTasksCache = initialDefaultTasks;
    return memoryTasksCache;
  }
}

export async function saveTasks(tasks: BenchmarkTask[]): Promise<void> {
  memoryTasksCache = tasks;
  try {
    if (!fs.existsSync(DATA_DIR)) {
      fs.mkdirSync(DATA_DIR, { recursive: true });
    }
    await fs.promises.writeFile(TASKS_FILE, JSON.stringify(tasks, null, 2), 'utf-8');
  } catch (err: unknown) {
    const error = err as NodeJS.ErrnoException;
    if (error && error.code === 'EROFS') {
      console.warn('Read-only file system encountered (EROFS). Stored tasks in memory cache.');
    } else {
      console.error('Failed to save tasks file:', err);
    }
  }
}

export async function updateTaskStatus(id: string, status: TaskStatus): Promise<BenchmarkTask | null> {
  const tasks = await getTasks();
  const taskIndex = tasks.findIndex((t) => t.id === id);
  if (taskIndex === -1) {
    return null;
  }

  const updatedTask: BenchmarkTask = {
    ...tasks[taskIndex],
    status,
    updatedAt: new Date().toISOString()
  };

  tasks[taskIndex] = updatedTask;
  await saveTasks(tasks);
  return updatedTask;
}

export async function runBenchmark(): Promise<{ addedCount: number; totalCount: number; tasks: BenchmarkTask[] }> {
  const existingTasks = await getTasks();
  const existingUrls = new Set(existingTasks.map((t) => t.sourceUrl));
  const parser = new Parser({ timeout: 5000 });
  const newTasks: BenchmarkTask[] = [];

  for (const feedConfig of COMPETITOR_FEEDS) {
    try {
      const feed = await parser.parseURL(feedConfig.url);
      if (feed && feed.items && feed.items.length > 0) {
        for (const item of feed.items.slice(0, 3)) {
          const link = item.link || item.guid || '';
          if (link && !existingUrls.has(link)) {
            existingUrls.add(link);
            const rawTitle = item.title || 'Competitor Article';
            const title = rawTitle.toLowerCase().startsWith('review') || rawTitle.toLowerCase().startsWith('guide')
              ? rawTitle
              : `Review: ${rawTitle}`;

            newTasks.push({
              id: crypto.randomUUID(),
              title,
              description: item.contentSnippet || item.summary || item.content || `New competitor article published on ${feedConfig.name}.`,
              competitor: feedConfig.name,
              sourceUrl: link,
              category: feedConfig.category,
              status: 'Pending',
              createdAt: new Date().toISOString(),
              updatedAt: new Date().toISOString()
            });
          }
        }
      }
    } catch (err: unknown) {
      console.warn(`Failed to fetch live feed from ${feedConfig.name}, utilizing fallbacks if available. Error:`, err);
    }
  }

  // If no new tasks were fetched from live feeds, add an unseen fallback task to demonstrate benchmarking
  if (newTasks.length === 0) {
    const unaddedFallback = FALLBACK_BENCHMARKS.find((fallback) => !existingUrls.has(fallback.sourceUrl));
    if (unaddedFallback) {
      newTasks.push({
        id: crypto.randomUUID(),
        title: unaddedFallback.title,
        description: unaddedFallback.description,
        competitor: unaddedFallback.competitor,
        sourceUrl: unaddedFallback.sourceUrl,
        category: unaddedFallback.category,
        status: 'Pending',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      });
    }
  }

  const updatedTasksList = [...newTasks, ...existingTasks];
  await saveTasks(updatedTasksList);

  return {
    addedCount: newTasks.length,
    totalCount: updatedTasksList.length,
    tasks: updatedTasksList
  };
}
