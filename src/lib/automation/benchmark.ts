import fs from 'fs';
import path from 'path';
import crypto from 'crypto';
import Parser from 'rss-parser';
import { Task, TaskStatus } from '@/types';

const DATA_DIR = path.join(process.cwd(), 'data');
const TASKS_FILE = path.join(DATA_DIR, 'tasks.json');

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
    title: 'The Best Noise-Canceling Headphones for 2025',
    description: 'Comprehensive review comparing Sony WH-1000XM5, Bose QuietComfort Ultra, and Apple AirPods Max.',
    sourceUrl: 'https://www.nytimes.com/wirecutter/reviews/best-noise-cancelling-headphones/',
    competitor: 'Wirecutter',
  },
  {
    title: 'Review: LG C4 OLED TV (2025)',
    description: 'Detailed analysis of picture quality, gaming features, and peak brightness levels.',
    sourceUrl: 'https://www.rtings.com/tv/reviews/lg/c4-oled',
    competitor: 'RTINGS',
  },
  {
    title: 'The Best Standing Desks for Home Office',
    description: 'Testing ergonomics, stability, motor noise, and weight capacity across top standing desk brands.',
    sourceUrl: 'https://www.nytimes.com/wirecutter/reviews/best-standing-desk/',
    competitor: 'Wirecutter',
  },
  {
    title: 'Comparison: Dyson V15 vs Shark Stratos Cordless Vacuum',
    description: 'Side-by-side suction, battery runtime, and pet hair cleanup comparison.',
    sourceUrl: 'https://www.rtings.com/vacuum/reviews/dyson/v15-detect',
    competitor: 'RTINGS',
  },
];

export async function getTasks(): Promise<Task[]> {
  try {
    if (!fs.existsSync(TASKS_FILE)) {
      return [];
    }
    const data = fs.readFileSync(TASKS_FILE, 'utf-8');
    return JSON.parse(data) as Task[];
  } catch (error: unknown) {
    if (error instanceof Error) {
      const err = error as NodeJS.ErrnoException;
      if (err.code === 'ENOENT') {
        return [];
      }
      console.warn('Error reading tasks file:', err.message);
    }
    return [];
  }
}

export async function saveTasks(tasks: Task[]): Promise<boolean> {
  try {
    if (!fs.existsSync(DATA_DIR)) {
      fs.mkdirSync(DATA_DIR, { recursive: true });
    }
    fs.writeFileSync(TASKS_FILE, JSON.stringify(tasks, null, 2), 'utf-8');
    return true;
  } catch (error: unknown) {
    if (error instanceof Error) {
      const err = error as NodeJS.ErrnoException;
      if (err.code === 'EROFS') {
        console.warn('Read-only filesystem detected. Unable to persist tasks to disk.');
      } else {
        console.error('Failed to save tasks:', err.message);
      }
    }
    return false;
  }
}

export async function updateTaskStatus(id: string, status: TaskStatus): Promise<Task | null> {
  const tasks = await getTasks();
  const taskIndex = tasks.findIndex((t) => t.id === id);
  if (taskIndex === -1) {
    return null;
  }

  const updatedTask: Task = {
    ...tasks[taskIndex],
    status,
    updatedAt: new Date().toISOString(),
  };

  tasks[taskIndex] = updatedTask;
  await saveTasks(tasks);
  return updatedTask;
}

export async function runBenchmark(): Promise<{ addedCount: number; totalCount: number }> {
  const parser = new Parser({
    headers: {
      'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
    },
    timeout: 5000,
  });

  const existingTasks = await getTasks();
  const existingUrls = new Set(existingTasks.map((t) => t.sourceUrl));
  const newTasks: Task[] = [];

  for (const feedConfig of COMPETITOR_FEEDS) {
    try {
      const feed = await parser.parseURL(feedConfig.url);
      const items = feed.items.slice(0, 5);

      for (const item of items) {
        const itemUrl = item.link || item.guid || '';
        if (!itemUrl || existingUrls.has(itemUrl)) {
          continue;
        }

        const rawTitle = item.title?.trim() || 'Untitled Competitor Article';
        const formattedTitle = rawTitle.toLowerCase().startsWith('review:') || rawTitle.toLowerCase().startsWith('guide:')
          ? rawTitle
          : `Review: ${rawTitle}`;

        const task: Task = {
          id: crypto.randomUUID(),
          title: formattedTitle,
          description: item.contentSnippet?.slice(0, 200) || item.summary?.slice(0, 200) || `Automated analysis for ${formattedTitle}`,
          sourceUrl: itemUrl,
          competitor: feedConfig.name,
          status: 'pending',
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        };

        newTasks.push(task);
        existingUrls.add(itemUrl);
      }
    } catch (feedErr: unknown) {
      if (feedErr instanceof Error) {
        console.warn(`Failed to fetch RSS feed for ${feedConfig.name}:`, feedErr.message);
      }
    }
  }

  // If no new tasks were discovered from live RSS feeds, use fallbacks to guarantee task creation
  if (newTasks.length === 0) {
    for (const fallback of FALLBACK_TOPICS) {
      if (!existingUrls.has(fallback.sourceUrl)) {
        const task: Task = {
          id: crypto.randomUUID(),
          title: fallback.title,
          description: fallback.description,
          sourceUrl: fallback.sourceUrl,
          competitor: fallback.competitor,
          status: 'pending',
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        };
        newTasks.push(task);
        existingUrls.add(fallback.sourceUrl);
      }
    }
  }

  const updatedTasksList = [...newTasks, ...existingTasks];
  await saveTasks(updatedTasksList);

  return {
    addedCount: newTasks.length,
    totalCount: updatedTasksList.length,
  };
}
