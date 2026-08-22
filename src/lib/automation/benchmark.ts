import Parser from 'rss-parser';
import fs from 'fs';
import path from 'path';
import crypto from 'crypto';
import { BenchmarkTask } from '@/types';

const COMPETITOR_FEEDS = [
  { name: 'Wirecutter', url: 'https://www.nytimes.com/wirecutter/feed/' },
  { name: 'RTINGS', url: 'https://www.rtings.com/rss/reviews.xml' },
];

const DATA_DIR = path.join(process.cwd(), 'data');
const TASKS_FILE = path.join(DATA_DIR, 'tasks.json');

function ensureDataDir(): void {
  try {
    if (!fs.existsSync(DATA_DIR)) {
      fs.mkdirSync(DATA_DIR, { recursive: true });
    }
  } catch (error) {
    const err = error as NodeJS.ErrnoException;
    if (err.code !== 'EROFS') {
      console.error('Error creating data directory:', err);
    }
  }
}

export function loadTasks(): BenchmarkTask[] {
  try {
    ensureDataDir();
    if (!fs.existsSync(TASKS_FILE)) {
      return [];
    }
    const raw = fs.readFileSync(TASKS_FILE, 'utf-8');
    const parsed: unknown = JSON.parse(raw);
    if (Array.isArray(parsed)) {
      return parsed as BenchmarkTask[];
    }
    return [];
  } catch (error) {
    const err = error as NodeJS.ErrnoException;
    if (err.code !== 'ENOENT' && err.code !== 'EROFS') {
      console.error('Error reading tasks file:', err);
    }
    return [];
  }
}

export function saveTasks(tasks: BenchmarkTask[]): void {
  try {
    ensureDataDir();
    fs.writeFileSync(TASKS_FILE, JSON.stringify(tasks, null, 2), 'utf-8');
  } catch (error) {
    const err = error as NodeJS.ErrnoException;
    if (err.code === 'EROFS') {
      console.warn('Read-only filesystem encountered when saving tasks.');
    } else {
      console.error('Error writing tasks file:', err);
    }
  }
}

export async function runCompetitorBenchmark(): Promise<{ added: number; total: number; errors: string[] }> {
  const parser = new Parser({
    headers: {
      'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) ReviewGuidBot/1.0',
    },
    timeout: 10000,
  });

  const existingTasks = loadTasks();
  const existingUrls = new Set(existingTasks.map(t => t.sourceUrl));
  const newTasks: BenchmarkTask[] = [];
  const errors: string[] = [];

  for (const feedConfig of COMPETITOR_FEEDS) {
    try {
      const feed = await parser.parseURL(feedConfig.url);
      const items = feed.items || [];

      for (const item of items.slice(0, 10)) {
        if (!item.link || existingUrls.has(item.link)) {
          continue;
        }

        const taskTitle = `Review: ${item.title || 'Untitled Competitor Article'}`;
        const taskDescription = item.contentSnippet || item.summary || `Analyze competitor coverage on "${item.title}" to create matching US buyer's guide or review.`;

        const task: BenchmarkTask = {
          id: crypto.randomUUID(),
          title: taskTitle,
          description: taskDescription,
          competitor: feedConfig.name,
          sourceUrl: item.link,
          pubDate: item.pubDate || new Date().toISOString(),
          status: 'pending',
          createdAt: new Date().toISOString(),
        };

        newTasks.push(task);
        existingUrls.add(item.link);
      }
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : String(err);
      console.error(`Failed to fetch/parse feed for ${feedConfig.name}:`, errorMessage);
      errors.push(`${feedConfig.name}: ${errorMessage}`);
    }
  }

  const updatedTasks = [...newTasks, ...existingTasks];
  saveTasks(updatedTasks);

  return {
    added: newTasks.length,
    total: updatedTasks.length,
    errors,
  };
}
