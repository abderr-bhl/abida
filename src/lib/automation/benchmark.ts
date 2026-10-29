import fs from 'fs';
import path from 'path';
import crypto from 'crypto';
import Parser from 'rss-parser';
import { BenchmarkTask } from '@/types';

const DATA_DIR = path.join(process.cwd(), 'data');
const TASKS_FILE = path.join(DATA_DIR, 'tasks.json');

const parser = new Parser({
  headers: {
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
  },
  timeout: 10000,
});

const COMPETITOR_FEEDS = [
  { name: 'Wirecutter', url: 'https://www.nytimes.com/wirecutter/feed/', category: 'electronics' },
  { name: 'RTINGS', url: 'https://www.rtings.com/rss/reviews.xml', category: 'reviews' },
];

const FALLBACK_COMPETITOR_TOPICS = [
  {
    title: 'The Best OLED TVs of 2025',
    description: 'Comprehensive review and comparison of top OLED TVs in the US market.',
    source: 'Wirecutter',
    targetUrl: 'https://www.nytimes.com/wirecutter/reviews/best-tv/',
    category: 'TVs & Home Theater',
  },
  {
    title: 'The 5 Best Noise-Canceling Headphones - Winter 2025 Reviews',
    description: 'Testing active noise cancellation, sound quality, and battery life.',
    source: 'RTINGS',
    targetUrl: 'https://www.rtings.com/headphones/reviews/best/by-feature/active-noise-cancelling-anc',
    category: 'Headphones',
  },
  {
    title: 'The Best Wireless Gaming Mouse',
    description: 'Hands-on benchmarks for ultra-low latency wireless gaming mice.',
    source: 'Wirecutter',
    targetUrl: 'https://www.nytimes.com/wirecutter/reviews/best-gaming-mouse/',
    category: 'Gaming Gear',
  },
];

function ensureDataDir() {
  try {
    if (!fs.existsSync(DATA_DIR)) {
      fs.mkdirSync(DATA_DIR, { recursive: true });
    }
  } catch (error) {
    const err = error as NodeJS.ErrnoException;
    if (err.code === 'EROFS') {
      console.warn('Read-only filesystem detected, data persistence limited.');
    } else {
      throw error;
    }
  }
}

export function loadTasks(): BenchmarkTask[] {
  ensureDataDir();
  try {
    if (fs.existsSync(TASKS_FILE)) {
      const data = fs.readFileSync(TASKS_FILE, 'utf-8');
      return JSON.parse(data) as BenchmarkTask[];
    }
  } catch (error) {
    console.error('Failed to read tasks file:', error);
  }
  return [];
}

export function saveTasks(tasks: BenchmarkTask[]): void {
  ensureDataDir();
  try {
    fs.writeFileSync(TASKS_FILE, JSON.stringify(tasks, null, 2), 'utf-8');
  } catch (error) {
    const err = error as NodeJS.ErrnoException;
    if (err.code === 'EROFS') {
      console.warn('Read-only filesystem: unable to save tasks to disk.');
    } else {
      console.error('Failed to write tasks file:', error);
    }
  }
}

export async function runBenchmarking(): Promise<{ addedCount: number; totalCount: number }> {
  const existingTasks = loadTasks();
  const existingUrls = new Set(existingTasks.map((t) => t.targetUrl));
  const newTasks: BenchmarkTask[] = [];

  for (const feedConfig of COMPETITOR_FEEDS) {
    try {
      const feed = await parser.parseURL(feedConfig.url);
      if (feed && feed.items) {
        for (const item of feed.items) {
          const itemUrl = item.link || item.guid;
          if (!itemUrl || existingUrls.has(itemUrl)) continue;

          const title = item.title ? `Review: ${item.title}` : 'Competitor Content Benchmark';
          const description = item.contentSnippet || item.content || `Benchmarked from ${feedConfig.name}`;

          const newTask: BenchmarkTask = {
            id: crypto.randomUUID(),
            title: title.trim(),
            description: description.trim().substring(0, 300),
            source: feedConfig.name,
            targetUrl: itemUrl,
            status: 'pending',
            category: feedConfig.category,
            createdAt: new Date().toISOString(),
          };

          newTasks.push(newTask);
          existingUrls.add(itemUrl);
        }
      }
    } catch (feedError) {
      console.warn(`Failed to fetch RSS feed for ${feedConfig.name}:`, feedError);
    }
  }

  // If no new tasks were retrieved from RSS feeds (e.g. network failure or bot captcha), use fallback topics
  if (newTasks.length === 0 && existingTasks.length === 0) {
    for (const topic of FALLBACK_COMPETITOR_TOPICS) {
      if (!existingUrls.has(topic.targetUrl)) {
        newTasks.push({
          id: crypto.randomUUID(),
          title: topic.title,
          description: topic.description,
          source: topic.source,
          targetUrl: topic.targetUrl,
          status: 'pending',
          category: topic.category,
          createdAt: new Date().toISOString(),
        });
        existingUrls.add(topic.targetUrl);
      }
    }
  }

  const updatedTasks = [...newTasks, ...existingTasks];
  saveTasks(updatedTasks);

  return {
    addedCount: newTasks.length,
    totalCount: updatedTasks.length,
  };
}
