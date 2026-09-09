import fs from 'fs';
import path from 'path';
import crypto from 'crypto';
import Parser from 'rss-parser';
import { BenchmarkTask } from '@/types';

const DATA_DIR = path.join(process.cwd(), 'data');
const TASKS_FILE = path.join(DATA_DIR, 'tasks.json');

const parser = new Parser({
  headers: {
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) ReviewGuid/1.0',
  },
  timeout: 5000,
});

export function getTasks(): BenchmarkTask[] {
  try {
    if (!fs.existsSync(TASKS_FILE)) {
      return [];
    }
    const content = fs.readFileSync(TASKS_FILE, 'utf-8');
    return JSON.parse(content) as BenchmarkTask[];
  } catch (error) {
    console.warn('Error reading tasks file:', error);
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
      const nodeErr = err as NodeJS.ErrnoException;
      if (nodeErr.code === 'EROFS') {
        console.warn('Read-only filesystem detected, unable to persist tasks to disk.');
        return;
      }
    }
    console.error('Error writing tasks file:', err);
  }
}

interface FeedSource {
  name: string;
  url: string;
}

const COMPETITOR_FEEDS: FeedSource[] = [
  { name: 'Wirecutter', url: 'https://www.nytimes.com/wirecutter/feed/' },
  { name: 'RTINGS', url: 'https://www.rtings.com/rss/reviews.xml' },
];

export async function runBenchmark(): Promise<BenchmarkTask[]> {
  const existingTasks = getTasks();
  const existingUrls = new Set(existingTasks.map((t) => t.url));
  const newTasks: BenchmarkTask[] = [];

  for (const feedSource of COMPETITOR_FEEDS) {
    try {
      const feed = await parser.parseURL(feedSource.url);
      const items = feed.items || [];

      for (const item of items.slice(0, 5)) {
        const itemUrl = item.link || item.guid || '';
        const itemTitle = item.title || 'Untitled Competitor Article';

        if (!itemUrl || existingUrls.has(itemUrl)) {
          continue;
        }

        const task: BenchmarkTask = {
          id: crypto.randomUUID(),
          title: `Review: ${itemTitle}`,
          description: `Competitor ${feedSource.name} published "${itemTitle}". Analyze coverage and prepare competitive content for US audience.`,
          source: feedSource.name,
          url: itemUrl,
          status: 'pending',
          createdAt: new Date().toISOString(),
        };

        newTasks.push(task);
        existingUrls.add(itemUrl);
      }
    } catch (error) {
      console.warn(`Could not parse RSS feed for ${feedSource.name} (${feedSource.url}):`, error);
    }
  }

  // Fallback / mock task generation if no feed items returned (e.g. offline sandbox or feed unreachable)
  if (newTasks.length === 0 && existingTasks.length === 0) {
    const fallbackTasks: BenchmarkTask[] = [
      {
        id: crypto.randomUUID(),
        title: 'Review: Best Noise-Canceling Headphones 2025',
        description: 'Competitor Wirecutter updated top picks for noise-canceling headphones. Benchmark rankings and update affiliate links.',
        source: 'Wirecutter',
        url: 'https://www.nytimes.com/wirecutter/reviews/best-noise-cancelling-headphones/',
        status: 'pending',
        createdAt: new Date().toISOString(),
      },
      {
        id: crypto.randomUUID(),
        title: 'Review: Top 4K OLED TVs Comparison',
        description: 'Competitor RTINGS updated lab benchmarks for LG and Samsung OLED TVs. Review technical metrics and summary.',
        source: 'RTINGS',
        url: 'https://www.rtings.com/tv/reviews/best/by-features/oled',
        status: 'pending',
        createdAt: new Date().toISOString(),
      },
    ];
    newTasks.push(...fallbackTasks);
  }

  const updatedTasks = [...newTasks, ...existingTasks];
  saveTasks(updatedTasks);

  return newTasks;
}
