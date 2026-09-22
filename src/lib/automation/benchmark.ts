import fs from 'fs';
import path from 'path';
import crypto from 'crypto';
import Parser from 'rss-parser';
import { BenchmarkTask } from '@/types';

const DATA_DIR = path.join(process.cwd(), 'data');
const TASKS_FILE = path.join(DATA_DIR, 'tasks.json');

const RSS_FEEDS = [
  {
    name: 'Wirecutter',
    url: 'https://www.nytimes.com/wirecutter/feed/',
  },
  {
    name: 'RTINGS',
    url: 'https://www.rtings.com/rss/reviews.xml',
  },
];

const DEFAULT_INITIAL_TASKS: BenchmarkTask[] = [
  {
    id: crypto.randomUUID(),
    title: 'Review: Wirecutter Best Noise-Canceling Headphones 2025',
    description: 'Wirecutter updated their wireless noise-canceling headphones recommendations. Perform gap analysis and update our US buyer guide.',
    sourceUrl: 'https://www.nytimes.com/wirecutter/reviews/best-noise-cancelling-headphones/',
    sourceName: 'Wirecutter',
    status: 'pending',
    createdAt: new Date().toISOString(),
  },
  {
    id: crypto.randomUUID(),
    title: 'Review: RTINGS Best OLED TVs for Gaming',
    description: 'Analyze recent RTINGS lab benchmarks on 4K OLED gaming monitors/TVs and draft comparative content for the US audience.',
    sourceUrl: 'https://www.rtings.com/tv/reviews/best/by-features/oled',
    sourceName: 'RTINGS',
    status: 'in_progress',
    createdAt: new Date(Date.now() - 86400000).toISOString(),
  },
];

export function getTasks(): BenchmarkTask[] {
  try {
    if (!fs.existsSync(TASKS_FILE)) {
      saveTasks(DEFAULT_INITIAL_TASKS);
      return DEFAULT_INITIAL_TASKS;
    }
    const raw = fs.readFileSync(TASKS_FILE, 'utf-8');
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed)) {
      return parsed as BenchmarkTask[];
    }
  } catch (error) {
    console.warn('Failed to read tasks file, falling back to default tasks:', error);
  }
  return DEFAULT_INITIAL_TASKS;
}

export function saveTasks(tasks: unknown): boolean {
  try {
    if (!fs.existsSync(DATA_DIR)) {
      fs.mkdirSync(DATA_DIR, { recursive: true });
    }
    fs.writeFileSync(TASKS_FILE, JSON.stringify(tasks, null, 2), 'utf-8');
    return true;
  } catch (error) {
    if (error instanceof Error) {
      const errnoErr = error as NodeJS.ErrnoException;
      if (errnoErr.code === 'EROFS') {
        console.warn('Read-only filesystem detected (EROFS). Task changes not written to disk.');
        return false;
      }
    }
    console.error('Failed to save tasks:', error);
    return false;
  }
}

export async function runBenchmark(): Promise<{
  newTasksCount: number;
  totalTasksCount: number;
  tasks: BenchmarkTask[];
}> {
  const parser = new Parser({
    timeout: 8000,
  });

  const existingTasks = getTasks();
  const existingUrls = new Set(existingTasks.map(t => t.sourceUrl));
  const newTasks: BenchmarkTask[] = [];

  for (const feed of RSS_FEEDS) {
    try {
      const feedData = await parser.parseURL(feed.url);
      if (feedData && feedData.items) {
        for (const item of feedData.items) {
          const itemUrl = item.link || item.guid || '';
          if (!itemUrl || existingUrls.has(itemUrl)) {
            continue;
          }

          const rawTitle = item.title ? item.title.trim() : 'New Article';
          const taskTitle = rawTitle.toLowerCase().startsWith('review:') || rawTitle.toLowerCase().startsWith('guide:')
            ? rawTitle
            : `Review: ${rawTitle}`;

          const snippet = item.contentSnippet || item.content || 'No description available.';
          const cleanSnippet = snippet.replace(/<[^>]*>?/gm, '').slice(0, 250);

          const newTask: BenchmarkTask = {
            id: crypto.randomUUID(),
            title: taskTitle,
            description: `Competitor (${feed.name}) published: "${cleanSnippet}". Analyze coverage and create competitive US market content gap task.`,
            sourceUrl: itemUrl,
            sourceName: feed.name,
            status: 'pending',
            createdAt: new Date().toISOString(),
          };

          newTasks.push(newTask);
          existingUrls.add(itemUrl);
        }
      }
    } catch (feedError) {
      console.warn(`Could not fetch or parse RSS feed for ${feed.name} (${feed.url}):`, feedError);
      // Continue without breaking execution when RTINGS or Wirecutter fails (e.g. 404 or network timeout)
    }
  }

  const updatedTasks = [...newTasks, ...existingTasks];
  saveTasks(updatedTasks);

  return {
    newTasksCount: newTasks.length,
    totalTasksCount: updatedTasks.length,
    tasks: updatedTasks,
  };
}
