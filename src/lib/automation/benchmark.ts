import fs from 'fs';
import path from 'path';
import crypto from 'crypto';
import Parser from 'rss-parser';
import { BenchmarkTask } from '@/types';

const DATA_DIR = path.join(process.cwd(), 'data');
const TASKS_FILE = path.join(DATA_DIR, 'tasks.json');

const parser = new Parser({
  timeout: 5000,
  headers: {
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
  }
});

const INITIAL_TASKS: BenchmarkTask[] = [
  {
    id: crypto.randomUUID(),
    title: 'Review: Wirecutter Best Robot Vacuums of 2024 Update',
    description: 'Wirecutter updated their top robot vacuum selections. Conduct a content gap analysis and evaluate new budget models.',
    competitor: 'Wirecutter',
    sourceUrl: 'https://www.nytimes.com/wirecutter/reviews/best-robot-vacuum/',
    status: 'pending',
    createdAt: new Date().toISOString()
  },
  {
    id: crypto.randomUUID(),
    title: "Buyer's Guide: RTINGS Wireless Noise Cancelling Headphones Comparison",
    description: 'RTINGS published new lab measurements for noise isolation. Benchmark our headphone rankings against their recommendations.',
    competitor: 'RTINGS',
    sourceUrl: 'https://www.rtings.com/headphones/reviews/best/by-feature/active-noise-cancelling-anc',
    status: 'in_progress',
    createdAt: new Date().toISOString()
  }
];

async function saveData(data: unknown): Promise<void> {
  try {
    if (!fs.existsSync(DATA_DIR)) {
      fs.mkdirSync(DATA_DIR, { recursive: true });
    }
    fs.writeFileSync(TASKS_FILE, JSON.stringify(data, null, 2), 'utf-8');
  } catch (error) {
    if (error instanceof Error) {
      const err = error as NodeJS.ErrnoException;
      if (err.code === 'EROFS') {
        console.warn('Read-only filesystem encountered when saving benchmark tasks.');
      } else {
        console.error('Error saving benchmark tasks:', error);
      }
    }
  }
}

export async function getTasks(): Promise<BenchmarkTask[]> {
  try {
    if (!fs.existsSync(TASKS_FILE)) {
      await saveData(INITIAL_TASKS);
      return INITIAL_TASKS;
    }
    const raw = fs.readFileSync(TASKS_FILE, 'utf-8');
    const parsed: unknown = JSON.parse(raw);
    if (Array.isArray(parsed)) {
      return parsed as BenchmarkTask[];
    }
    return INITIAL_TASKS;
  } catch (error) {
    if (error instanceof Error) {
      const err = error as NodeJS.ErrnoException;
      if (err.code === 'EROFS') {
        console.warn('Read-only filesystem encountered when loading benchmark tasks.');
      } else {
        console.error('Error loading benchmark tasks:', error);
      }
    }
    return INITIAL_TASKS;
  }
}

export async function updateTaskStatus(
  taskId: string,
  status: 'pending' | 'in_progress' | 'completed'
): Promise<BenchmarkTask | null> {
  const tasks = await getTasks();
  const taskIndex = tasks.findIndex((t) => t.id === taskId);
  if (taskIndex === -1) return null;

  tasks[taskIndex] = {
    ...tasks[taskIndex],
    status
  };

  await saveData(tasks);
  return tasks[taskIndex];
}

export async function runBenchmark(): Promise<BenchmarkTask[]> {
  const existingTasks = await getTasks();
  const existingUrls = new Set(existingTasks.map((t) => t.sourceUrl));
  const newTasks: BenchmarkTask[] = [];

  const FEEDS = [
    { name: 'Wirecutter', url: 'https://www.nytimes.com/wirecutter/feed/' },
    { name: 'RTINGS', url: 'https://www.rtings.com/rss/reviews.xml' }
  ];

  for (const feedConfig of FEEDS) {
    try {
      const feed = await parser.parseURL(feedConfig.url);
      if (feed.items) {
        for (const item of feed.items.slice(0, 5)) {
          const link = item.link || item.guid || '';
          if (link && !existingUrls.has(link)) {
            const rawTitle = item.title || 'Untitled Competitor Article';
            const formattedTitle = rawTitle.toLowerCase().includes('review')
              ? `Review: ${rawTitle}`
              : `Buyer's Guide: ${rawTitle}`;

            const task: BenchmarkTask = {
              id: crypto.randomUUID(),
              title: formattedTitle,
              description:
                item.contentSnippet ||
                item.summary ||
                `Analyze competitor content from ${feedConfig.name} and update our US buyer guides accordingly.`,
              competitor: feedConfig.name,
              sourceUrl: link,
              status: 'pending',
              createdAt: new Date().toISOString()
            };
            newTasks.push(task);
            existingUrls.add(link);
          }
        }
      }
    } catch (error) {
      console.warn(
        `Failed to fetch or parse feed from ${feedConfig.name}:`,
        error instanceof Error ? error.message : error
      );
    }
  }

  if (newTasks.length > 0) {
    const updated = [...newTasks, ...existingTasks];
    await saveData(updated);
    return updated;
  }

  return existingTasks;
}
