import Parser from 'rss-parser';
import fs from 'fs';
import path from 'path';
import { randomUUID } from 'crypto';

export interface BenchmarkTask {
  id: string;
  title: string;
  description: string;
  competitorUrl: string;
  source: string;
  status: 'pending' | 'in_progress' | 'completed' | 'cancelled';
  createdAt: string;
  updatedAt: string;
}

const DATA_DIR = path.join(process.cwd(), 'data');
const TASKS_FILE = path.join(DATA_DIR, 'tasks.json');

const RSS_FEEDS = [
  { name: 'Wirecutter', url: 'https://www.nytimes.com/wirecutter/feed/' },
  { name: 'RTINGS', url: 'https://www.rtings.com/rss/reviews.xml' },
];

const FALLBACK_TOPICS = [
  {
    title: 'The Best Wireless Noise-Canceling Headphones',
    link: 'https://www.nytimes.com/wirecutter/reviews/best-[#]-noise-canceling-headphones/',
    source: 'Wirecutter',
    description: 'Competitive analysis task for recent market recommendations on top noise-canceling headphones.',
  },
  {
    title: 'Best 4K OLED TVs For 2025 Benchmarking',
    link: 'https://www.rtings.com/tv/reviews/best/by-type/oled',
    source: 'RTINGS',
    description: 'Benchmarking task covering US market standard ratings and measurements for OLED televisions.',
  },
  {
    title: 'The Best Ergonomic Office Chairs',
    link: 'https://www.nytimes.com/wirecutter/reviews/best-office-chair/',
    source: 'Wirecutter',
    description: 'Review task examining ergonomics, durability, and warranty comparisons from top US retailers.',
  },
];

export function getStoredTasks(): BenchmarkTask[] {
  try {
    if (!fs.existsSync(TASKS_FILE)) {
      return [];
    }
    const raw = fs.readFileSync(TASKS_FILE, 'utf-8');
    const parsed: unknown = JSON.parse(raw);
    if (Array.isArray(parsed)) {
      return parsed as BenchmarkTask[];
    }
    return [];
  } catch (err) {
    console.warn('Failed to read tasks file:', err);
    return [];
  }
}

export function saveTasks(tasks: unknown): void {
  try {
    if (!fs.existsSync(DATA_DIR)) {
      fs.mkdirSync(DATA_DIR, { recursive: true });
    }
    fs.writeFileSync(TASKS_FILE, JSON.stringify(tasks, null, 2), 'utf-8');
  } catch (err) {
    if (err instanceof Error) {
      const errnoErr = err as NodeJS.ErrnoException;
      if (errnoErr.code === 'EROFS') {
        console.warn('Read-only filesystem detected, skipping disk write for benchmark tasks.');
        return;
      }
    }
    console.error('Error saving benchmark tasks:', err);
  }
}

export async function runCompetitiveBenchmark(): Promise<{ count: number; tasks: BenchmarkTask[] }> {
  const parser = new Parser({
    headers: {
      'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
    },
    timeout: 5000,
  });

  const existingTasks = getStoredTasks();
  const existingUrls = new Set(existingTasks.map(t => t.competitorUrl));
  const newTasks: BenchmarkTask[] = [];

  for (const feed of RSS_FEEDS) {
    try {
      const feedData = await parser.parseURL(feed.url);
      const items = feedData.items.slice(0, 5);

      for (const item of items) {
        const itemUrl = item.link || item.guid || '';
        if (itemUrl && !existingUrls.has(itemUrl)) {
          const rawTitle = item.title?.trim() || 'New Competitor Review';
          const taskTitle = rawTitle.startsWith('Review:') ? rawTitle : `Review: ${rawTitle}`;
          const task: BenchmarkTask = {
            id: randomUUID(),
            title: taskTitle,
            description: item.contentSnippet?.slice(0, 200) || `Automated analysis for ${feed.name} coverage on ${rawTitle}.`,
            competitorUrl: itemUrl,
            source: feed.name,
            status: 'pending',
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
          };
          newTasks.push(task);
          existingUrls.add(itemUrl);
        }
      }
    } catch (feedErr) {
      console.warn(`Could not fetch RSS feed from ${feed.name}:`, feedErr);
    }
  }

  if (newTasks.length === 0 && existingTasks.length === 0) {
    for (const fallback of FALLBACK_TOPICS) {
      if (!existingUrls.has(fallback.link)) {
        const task: BenchmarkTask = {
          id: randomUUID(),
          title: `Review: ${fallback.title}`,
          description: fallback.description,
          competitorUrl: fallback.link,
          source: fallback.source,
          status: 'pending',
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        };
        newTasks.push(task);
        existingUrls.add(fallback.link);
      }
    }
  }

  const updatedTasks = [...newTasks, ...existingTasks];
  saveTasks(updatedTasks);

  return {
    count: newTasks.length,
    tasks: newTasks,
  };
}
