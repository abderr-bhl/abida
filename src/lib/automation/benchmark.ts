import Parser from 'rss-parser';
import * as fs from 'fs';
import * as path from 'path';
import crypto from 'crypto';
import { BenchmarkTask, TaskStatus } from '@/types';

const parser = new Parser({
  timeout: 8000,
  headers: {
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
  },
});

const DATA_DIR = path.join(process.cwd(), 'data');
const TASKS_FILE = path.join(DATA_DIR, 'tasks.json');

const COMPETITOR_FEEDS = [
  { name: 'Wirecutter', url: 'https://www.nytimes.com/wirecutter/feed/' },
  { name: 'RTINGS', url: 'https://www.rtings.com/rss/reviews.xml' },
];

const FALLBACK_TOPICS = [
  {
    title: 'Review: Best Noise-Canceling Headphones for 2025',
    description: 'Wirecutter updated their wireless noise-canceling headphones recommendations. Analysis of sound quality and battery life needed.',
    competitor: 'Wirecutter',
    sourceUrl: 'https://www.nytimes.com/wirecutter/reviews/best-noise-cancelling-headphones/',
  },
  {
    title: 'Review: Top 4K OLED TVs Tested for Gaming',
    description: 'RTINGS published extensive test results for 2025 OLED TVs. Need coverage on brightness and VRR compatibility.',
    competitor: 'RTINGS',
    sourceUrl: 'https://www.rtings.com/tv/reviews/best/by-feature/oled',
  },
  {
    title: 'Review: Ergonomic Office Chairs for Home Working',
    description: 'Wirecutter published new findings on ergonomic lumbar support chairs. Content gap identified in home office guides.',
    competitor: 'Wirecutter',
    sourceUrl: 'https://www.nytimes.com/wirecutter/reviews/best-office-chair/',
  },
];

export async function getTasks(): Promise<BenchmarkTask[]> {
  try {
    if (!fs.existsSync(TASKS_FILE)) {
      return [];
    }
    const data = fs.readFileSync(TASKS_FILE, 'utf-8');
    const parsed = JSON.parse(data);
    return Array.isArray(parsed) ? parsed : [];
  } catch (error: unknown) {
    console.warn('Could not read tasks file:', error);
    return [];
  }
}

export async function saveTasks(tasks: BenchmarkTask[]): Promise<boolean> {
  try {
    if (!fs.existsSync(DATA_DIR)) {
      fs.mkdirSync(DATA_DIR, { recursive: true });
    }
    fs.writeFileSync(TASKS_FILE, JSON.stringify(tasks, null, 2), 'utf-8');
    return true;
  } catch (error: unknown) {
    const err = error as NodeJS.ErrnoException;
    if (err.code === 'EROFS') {
      console.warn('Read-only filesystem encountered when saving tasks.');
    } else {
      console.error('Failed to save tasks:', error);
    }
    return false;
  }
}

export async function updateTaskStatus(id: string, status: TaskStatus): Promise<BenchmarkTask | null> {
  const tasks = await getTasks();
  const index = tasks.findIndex((t) => t.id === id);
  if (index === -1) return null;

  tasks[index].status = status;
  tasks[index].updatedAt = new Date().toISOString();
  await saveTasks(tasks);
  return tasks[index];
}

export async function runBenchmark(): Promise<{ tasksCreated: number; tasks: BenchmarkTask[] }> {
  const existingTasks = await getTasks();
  const existingUrls = new Set(existingTasks.map((t) => t.sourceUrl));
  const newTasks: BenchmarkTask[] = [];

  for (const feedConfig of COMPETITOR_FEEDS) {
    try {
      const feed = await parser.parseURL(feedConfig.url);
      const items = feed.items || [];

      for (const item of items.slice(0, 3)) {
        if (!item.link || existingUrls.has(item.link)) continue;

        const title = item.title ? `Review: ${item.title}` : `Review: New content from ${feedConfig.name}`;
        const description = item.contentSnippet || item.content || `Competitor benchmark task generated from ${feedConfig.name} article: ${title}`;

        const newTask: BenchmarkTask = {
          id: crypto.randomUUID(),
          title,
          description: description.substring(0, 300),
          competitor: feedConfig.name,
          sourceUrl: item.link,
          status: 'pending',
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        };

        newTasks.push(newTask);
        existingUrls.add(item.link);
      }
    } catch (feedError) {
      console.warn(`Failed to fetch RSS feed for ${feedConfig.name}, using fallback items:`, feedError);
    }
  }

  if (newTasks.length === 0) {
    for (const fallback of FALLBACK_TOPICS) {
      if (!existingUrls.has(fallback.sourceUrl)) {
        const newTask: BenchmarkTask = {
          id: crypto.randomUUID(),
          title: fallback.title,
          description: fallback.description,
          competitor: fallback.competitor,
          sourceUrl: fallback.sourceUrl,
          status: 'pending',
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        };
        newTasks.push(newTask);
        existingUrls.add(fallback.sourceUrl);
      }
    }
  }

  const updatedTasksList = [...newTasks, ...existingTasks];
  await saveTasks(updatedTasksList);

  return {
    tasksCreated: newTasks.length,
    tasks: updatedTasksList,
  };
}
