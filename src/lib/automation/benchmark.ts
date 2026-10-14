import crypto from 'crypto';
import fs from 'fs';
import path from 'path';
import Parser from 'rss-parser';
import { BenchmarkTask } from '@/types';

const DATA_DIR = path.join(process.cwd(), 'data');
const TASKS_FILE = path.join(DATA_DIR, 'tasks.json');

const parser = new Parser({
  headers: {
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
    'Accept': 'application/rss+xml, application/xml, text/xml; q=0.1',
  },
  timeout: 5000,
});

const COMPETITOR_FEEDS = [
  {
    name: 'Wirecutter',
    url: 'https://www.nytimes.com/wirecutter/feed/',
  },
  {
    name: 'RTINGS',
    url: 'https://www.rtings.com/rss/reviews.xml',
  },
];

const FALLBACK_TOPICS = [
  {
    title: 'Review: The Best Cordless Vacuums of 2025',
    description: 'Comprehensive review comparing battery life, suction power, and weight of top cordless vacuums.',
    competitor: 'Wirecutter',
    url: 'https://www.nytimes.com/wirecutter/reviews/best-cordless-vacuum/',
  },
  {
    title: 'Review: Top Noise-Canceling Headphones Review',
    description: 'Detailed analysis of ANC performance, sound quality, and comfort for flagship headphones.',
    competitor: 'RTINGS',
    url: 'https://www.rtings.com/headphones/reviews/best/by-feature/active-noise-cancelling-anc',
  },
  {
    title: 'Review: Best Air Purifiers for Allergies and Smoke',
    description: 'Evaluating HEPA filtration efficiency, CADR ratings, and noise levels across leading air purifiers.',
    competitor: 'Wirecutter',
    url: 'https://www.nytimes.com/wirecutter/reviews/best-air-purifier/',
  },
];

export function getTasks(): BenchmarkTask[] {
  try {
    if (!fs.existsSync(TASKS_FILE)) {
      return [];
    }
    const data = fs.readFileSync(TASKS_FILE, 'utf-8');
    return JSON.parse(data) as BenchmarkTask[];
  } catch (error) {
    if (error instanceof Error) {
      const err = error as NodeJS.ErrnoException;
      if (err.code === 'ENOENT') {
        return [];
      }
    }
    console.warn('Failed to read tasks file:', error);
    return [];
  }
}

export function saveTasks(tasks: BenchmarkTask[]): boolean {
  try {
    if (!fs.existsSync(DATA_DIR)) {
      fs.mkdirSync(DATA_DIR, { recursive: true });
    }
    const serializedData: unknown = JSON.stringify(tasks, null, 2);
    fs.writeFileSync(TASKS_FILE, serializedData as string, 'utf-8');
    return true;
  } catch (error) {
    if (error instanceof Error) {
      const err = error as NodeJS.ErrnoException;
      if (err.code === 'EROFS') {
        console.warn('Warning: Filesystem is read-only (EROFS). Tasks cannot be saved locally.');
        return false;
      }
    }
    console.error('Failed to save tasks file:', error);
    return false;
  }
}

export async function runBenchmark(): Promise<BenchmarkTask[]> {
  const existingTasks = getTasks();
  const existingUrls = new Set(existingTasks.map(t => t.url));
  const newTasks: BenchmarkTask[] = [];

  for (const feed of COMPETITOR_FEEDS) {
    let feedFetched = false;
    try {
      const parsedFeed = await parser.parseURL(feed.url);
      if (parsedFeed && parsedFeed.items && parsedFeed.items.length > 0) {
        feedFetched = true;
        for (const item of parsedFeed.items.slice(0, 5)) {
          const itemUrl = item.link || item.guid || `${feed.url}#${item.title}`;
          if (!existingUrls.has(itemUrl)) {
            const rawTitle = item.title?.trim() || 'Untitled Competitor Article';
            const title = rawTitle.startsWith('Review:') ? rawTitle : `Review: ${rawTitle}`;
            const description = item.contentSnippet || item.content || `Analyze competitor coverage on "${rawTitle}" and prepare a response guide.`;

            const task: BenchmarkTask = {
              id: crypto.randomUUID(),
              title,
              description,
              competitor: feed.name,
              url: itemUrl,
              createdAt: new Date().toISOString(),
              status: 'pending',
            };
            newTasks.push(task);
            existingUrls.add(itemUrl);
          }
        }
      }
    } catch (error) {
      console.warn(`Could not fetch RSS feed for ${feed.name}:`, error instanceof Error ? error.message : error);
    }

    if (!feedFetched) {
      // Use fallback topics for this competitor
      const competitorFallbacks = FALLBACK_TOPICS.filter(f => f.competitor === feed.name);
      for (const fallback of competitorFallbacks) {
        if (!existingUrls.has(fallback.url)) {
          const task: BenchmarkTask = {
            id: crypto.randomUUID(),
            title: fallback.title,
            description: fallback.description,
            competitor: fallback.competitor,
            url: fallback.url,
            createdAt: new Date().toISOString(),
            status: 'pending',
          };
          newTasks.push(task);
          existingUrls.add(fallback.url);
        }
      }
    }
  }

  // Combine and persist
  const updatedTasks = [...newTasks, ...existingTasks];
  saveTasks(updatedTasks);

  return newTasks;
}
