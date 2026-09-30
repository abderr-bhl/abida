import fs from 'fs';
import path from 'path';
import crypto from 'crypto';
import Parser from 'rss-parser';
import { BenchmarkTask, TaskStatus } from '@/types';

const DATA_DIR = path.join(process.cwd(), 'data');
const TASKS_FILE = path.join(DATA_DIR, 'tasks.json');

const parser = new Parser({
  headers: {
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
    'Accept': 'application/rss+xml, application/xml, text/xml;q=0.9, */*;q=0.8',
  },
  timeout: 10000,
});

const COMPETITOR_FEEDS = [
  { name: 'Wirecutter', url: 'https://www.nytimes.com/wirecutter/feed/' },
  { name: 'RTINGS', url: 'https://www.rtings.com/rss/reviews.xml' },
];

const FALLBACK_TOPICS = [
  {
    title: 'Best Noise-Canceling Headphones of 2025',
    description: 'Competitive review covering top wireless over-ear noise canceling headphones.',
    competitor: 'Wirecutter',
    sourceUrl: 'https://www.nytimes.com/wirecutter/reviews/best-noise-cancelling-headphones/',
  },
  {
    title: 'Best Ergonomic Office Chairs for Working From Home',
    description: 'Detailed analysis on lumbar support, durability, and comfort for home office seating.',
    competitor: 'Wirecutter',
    sourceUrl: 'https://www.nytimes.com/wirecutter/reviews/best-office-chair/',
  },
  {
    title: 'Best 4K OLED TVs for Gaming and Movies',
    description: 'Comprehensive benchmark of picture quality, refresh rates, and HDR performance.',
    competitor: 'RTINGS',
    sourceUrl: 'https://www.rtings.com/tv/reviews/best/by-features/oled',
  },
  {
    title: 'Best Robot Vacuums for Dog & Cat Hair',
    description: 'Hands-on evaluation of suction power, obstacle avoidance, and self-emptying bases.',
    competitor: 'Wirecutter',
    sourceUrl: 'https://www.nytimes.com/wirecutter/reviews/best-robot-vacuum/',
  },
];

let inMemoryTasks: BenchmarkTask[] = [];

export function getTasks(): BenchmarkTask[] {
  try {
    if (fs.existsSync(TASKS_FILE)) {
      const data = fs.readFileSync(TASKS_FILE, 'utf-8');
      const parsed = JSON.parse(data) as unknown;
      if (Array.isArray(parsed)) {
        inMemoryTasks = parsed as BenchmarkTask[];
        return inMemoryTasks;
      }
    }
  } catch (error) {
    if (error instanceof Error) {
      const err = error as NodeJS.ErrnoException;
      if (err.code === 'EROFS') {
        console.warn('Read-only filesystem detected, using in-memory store.');
      } else {
        console.error('Error reading tasks file:', err);
      }
    }
  }
  return inMemoryTasks;
}

export function saveTasks(tasks: BenchmarkTask[]): boolean {
  inMemoryTasks = tasks;
  try {
    if (!fs.existsSync(DATA_DIR)) {
      fs.mkdirSync(DATA_DIR, { recursive: true });
    }
    const dataToWrite = JSON.stringify(tasks, null, 2);
    fs.writeFileSync(TASKS_FILE, dataToWrite, 'utf-8');
    return true;
  } catch (error) {
    if (error instanceof Error) {
      const err = error as NodeJS.ErrnoException;
      if (err.code === 'EROFS') {
        console.warn('Read-only filesystem: unable to persist tasks to disk.');
        return false;
      } else {
        console.error('Error saving tasks file:', err);
      }
    }
    return false;
  }
}

export async function runBenchmark(): Promise<{ addedCount: number; tasks: BenchmarkTask[] }> {
  const existingTasks = getTasks();
  const existingUrls = new Set(existingTasks.map(t => t.sourceUrl));
  const existingTitles = new Set(existingTasks.map(t => t.title.toLowerCase()));

  const newTasks: BenchmarkTask[] = [];

  for (const feedConfig of COMPETITOR_FEEDS) {
    try {
      const feed = await parser.parseURL(feedConfig.url);
      if (feed.items && feed.items.length > 0) {
        for (const item of feed.items.slice(0, 5)) {
          const itemTitle = item.title?.trim();
          const itemLink = item.link?.trim() || feedConfig.url;

          if (!itemTitle) continue;

          const formattedTitle = itemTitle.startsWith('Review:') ? itemTitle : `Review: ${itemTitle}`;

          if (existingUrls.has(itemLink) || existingTitles.has(formattedTitle.toLowerCase())) {
            continue;
          }

          const newTask: BenchmarkTask = {
            id: crypto.randomUUID(),
            title: formattedTitle,
            description: item.contentSnippet || item.summary || `Competitor content benchmark item from ${feedConfig.name}.`,
            sourceUrl: itemLink,
            competitor: feedConfig.name,
            status: 'pending',
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
          };

          newTasks.push(newTask);
          existingUrls.add(itemLink);
          existingTitles.add(formattedTitle.toLowerCase());
        }
      }
    } catch (feedError) {
      console.warn(`Could not fetch RSS feed for ${feedConfig.name}:`, feedError instanceof Error ? feedError.message : feedError);
    }
  }

  // Fallback check if no new tasks were gathered from feeds or if initial feed list empty
  if (newTasks.length === 0 && existingTasks.length === 0) {
    for (const fallback of FALLBACK_TOPICS) {
      const formattedTitle = fallback.title.startsWith('Review:') ? fallback.title : `Review: ${fallback.title}`;
      if (!existingTitles.has(formattedTitle.toLowerCase())) {
        const newTask: BenchmarkTask = {
          id: crypto.randomUUID(),
          title: formattedTitle,
          description: fallback.description,
          sourceUrl: fallback.sourceUrl,
          competitor: fallback.competitor,
          status: 'pending',
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        };
        newTasks.push(newTask);
        existingTitles.add(formattedTitle.toLowerCase());
      }
    }
  }

  const updatedTasks = [...newTasks, ...existingTasks];
  saveTasks(updatedTasks);

  return {
    addedCount: newTasks.length,
    tasks: updatedTasks,
  };
}

export function updateTaskStatus(taskId: string, newStatus: TaskStatus): BenchmarkTask | null {
  const tasks = getTasks();
  const taskIndex = tasks.findIndex(t => t.id === taskId);

  if (taskIndex === -1) {
    return null;
  }

  tasks[taskIndex] = {
    ...tasks[taskIndex],
    status: newStatus,
    updatedAt: new Date().toISOString(),
  };

  saveTasks(tasks);
  return tasks[taskIndex];
}
