import crypto from 'crypto';
import fs from 'fs';
import path from 'path';
import Parser from 'rss-parser';

export interface BenchmarkTask {
  id: string;
  title: string;
  description: string;
  source: string;
  status: 'pending' | 'in_progress' | 'completed';
  createdAt: string;
  updatedAt: string;
  url: string;
}

const DATA_DIR = path.join(process.cwd(), 'data');
const TASKS_FILE = path.join(DATA_DIR, 'tasks.json');

function ensureDataDir(): void {
  try {
    if (!fs.existsSync(DATA_DIR)) {
      fs.mkdirSync(DATA_DIR, { recursive: true });
    }
  } catch (err: unknown) {
    if (err instanceof Error) {
      const error = err as NodeJS.ErrnoException;
      if (error.code === 'EROFS') {
        console.warn('Read-only filesystem detected, unable to create data directory.');
      }
    }
  }
}

export function loadTasks(): BenchmarkTask[] {
  try {
    ensureDataDir();
    if (fs.existsSync(TASKS_FILE)) {
      const data = fs.readFileSync(TASKS_FILE, 'utf-8');
      return JSON.parse(data) as BenchmarkTask[];
    }
  } catch (err: unknown) {
    console.warn('Failed to load tasks from local storage:', err);
  }
  return [];
}

export function saveTasks(tasks: unknown): void {
  try {
    ensureDataDir();
    fs.writeFileSync(TASKS_FILE, JSON.stringify(tasks, null, 2), 'utf-8');
  } catch (err: unknown) {
    if (err instanceof Error) {
      const error = err as NodeJS.ErrnoException;
      if (error.code === 'EROFS') {
        console.warn('Read-only filesystem detected, unable to save tasks.');
        return;
      }
    }
    console.error('Error saving tasks:', err);
  }
}

const COMPETITOR_FEEDS = [
  { name: 'Wirecutter', url: 'https://www.nytimes.com/wirecutter/feed/' },
  { name: 'RTINGS', url: 'https://www.rtings.com/rss/reviews.xml' }
];

export async function runBenchmark(): Promise<BenchmarkTask[]> {
  const parser = new Parser({
    headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) ReviewGuidBot/1.0' },
    timeout: 8000
  });

  const existingTasks = loadTasks();
  const existingUrls = new Set(existingTasks.map(t => t.url));
  const newTasks: BenchmarkTask[] = [];

  for (const feed of COMPETITOR_FEEDS) {
    try {
      const parsedFeed = await parser.parseURL(feed.url);
      for (const item of parsedFeed.items || []) {
        if (item.link && !existingUrls.has(item.link)) {
          existingUrls.add(item.link);
          const rawTitle = item.title?.trim() || 'New Competitor Content';
          let taskType = 'Review';
          const lower = rawTitle.toLowerCase();
          if (lower.includes('guide') || lower.includes('best') || lower.includes('how to')) {
            taskType = 'Guide';
          } else if (lower.includes('vs') || lower.includes('versus') || lower.includes('compared')) {
            taskType = 'Comparison';
          }

          const now = new Date().toISOString();
          const newTask: BenchmarkTask = {
            id: crypto.randomUUID(),
            title: `${taskType}: ${rawTitle}`,
            description: item.contentSnippet || item.summary || `Competitor content identified from ${feed.name}: ${rawTitle}`,
            source: feed.name,
            status: 'pending',
            createdAt: now,
            updatedAt: now,
            url: item.link
          };
          newTasks.push(newTask);
        }
      }
    } catch (err: unknown) {
      console.warn(`Failed or skipped parsing RSS feed for ${feed.name}:`, err);
    }
  }

  const updatedTasks = [...newTasks, ...existingTasks];
  saveTasks(updatedTasks);
  return updatedTasks;
}
