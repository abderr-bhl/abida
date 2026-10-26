import crypto from 'crypto';
import fs from 'fs';
import path from 'path';
import Parser from 'rss-parser';
import { Task, TaskStatus } from '@/types';

const DATA_DIR = path.join(process.cwd(), 'data');
const TASKS_FILE = path.join(DATA_DIR, 'tasks.json');

const parser = new Parser({
  headers: {
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
  },
  timeout: 10000,
});

const COMPETITOR_FEEDS = [
  { name: 'Wirecutter', url: 'https://www.nytimes.com/wirecutter/feed/', category: 'General Buying Guides' },
  { name: 'RTINGS', url: 'https://www.rtings.com/rss/reviews.xml', category: 'Tech & Electronics' },
];

const FALLBACK_TOPICS = [
  {
    title: 'Review: Best Air Purifiers for US Homes',
    description: 'Comprehensive testing and review of top air purifiers for allergies and dust.',
    sourceUrl: 'https://www.nytimes.com/wirecutter/reviews/best-air-purifier/',
    competitor: 'Wirecutter',
    category: 'Home & Kitchen',
  },
  {
    title: 'Review: Best 4K Gaming Monitors of 2025',
    description: 'In-depth benchmark comparison of high refresh rate 4K gaming displays.',
    sourceUrl: 'https://www.rtings.com/monitor/reviews/best/by-usage/gaming',
    competitor: 'RTINGS',
    category: 'Tech & Electronics',
  },
  {
    title: 'Review: Best Wireless Noise-Canceling Headphones',
    description: 'Audio testing and noise isolation benchmark for top premium headphones.',
    sourceUrl: 'https://www.nytimes.com/wirecutter/reviews/best-noise-cancelling-headphones/',
    competitor: 'Wirecutter',
    category: 'Audio',
  },
  {
    title: 'Review: Best Robot Vacuums for Hardwood Floors',
    description: 'Automated cleaning performance analysis and obstacle avoidance tests.',
    sourceUrl: 'https://www.rtings.com/robot-vacuum/reviews/best/by-feature/hardwood-floors',
    competitor: 'RTINGS',
    category: 'Home Appliances',
  },
];

function ensureDataDir(): void {
  try {
    if (!fs.existsSync(DATA_DIR)) {
      fs.mkdirSync(DATA_DIR, { recursive: true });
    }
  } catch (error) {
    if (error instanceof Error) {
      const err = error as NodeJS.ErrnoException;
      if (err.code === 'EROFS') {
        console.warn('Read-only filesystem detected when creating data dir:', err.message);
        return;
      }
    }
    throw error;
  }
}

export function getTasks(): Task[] {
  ensureDataDir();
  try {
    if (!fs.existsSync(TASKS_FILE)) {
      return [];
    }
    const rawData = fs.readFileSync(TASKS_FILE, 'utf-8');
    const parsedData: unknown = JSON.parse(rawData);
    if (Array.isArray(parsedData)) {
      return parsedData as Task[];
    }
    return [];
  } catch (error) {
    console.error('Error reading tasks.json:', error);
    return [];
  }
}

export function saveData(data: unknown): void {
  ensureDataDir();
  try {
    fs.writeFileSync(TASKS_FILE, JSON.stringify(data, null, 2), 'utf-8');
  } catch (error) {
    if (error instanceof Error) {
      const err = error as NodeJS.ErrnoException;
      if (err.code === 'EROFS') {
        console.warn('Read-only filesystem detected, unable to write to data/tasks.json:', err.message);
        return;
      }
    }
    throw error;
  }
}

export async function runBenchmark(): Promise<{ tasksAdded: number; totalTasks: number; success: boolean }> {
  const existingTasks = getTasks();
  const existingTitles = new Set(existingTasks.map(t => t.title.toLowerCase()));
  const newTasks: Task[] = [];

  for (const feedConfig of COMPETITOR_FEEDS) {
    try {
      const feed = await parser.parseURL(feedConfig.url);
      if (feed && feed.items && feed.items.length > 0) {
        for (const item of feed.items.slice(0, 5)) {
          if (!item.title) continue;
          const cleanTitle = item.title.trim();
          const taskTitle = cleanTitle.toLowerCase().startsWith('review:') ? cleanTitle : `Review: ${cleanTitle}`;
          if (existingTitles.has(taskTitle.toLowerCase())) continue;

          existingTitles.add(taskTitle.toLowerCase());
          newTasks.push({
            id: crypto.randomUUID(),
            title: taskTitle,
            description: item.contentSnippet || item.summary || `Benchmark task generated from ${feedConfig.name}`,
            sourceUrl: item.link,
            competitor: feedConfig.name,
            category: feedConfig.category,
            status: 'pending',
            createdAt: new Date().toISOString(),
          });
        }
      }
    } catch (feedError) {
      console.warn(`Could not fetch RSS feed for ${feedConfig.name}:`, feedError);
    }
  }

  // If no new tasks were added from live RSS feeds, use fallbacks to guarantee task generation
  if (newTasks.length === 0) {
    for (const fallback of FALLBACK_TOPICS) {
      if (!existingTitles.has(fallback.title.toLowerCase())) {
        existingTitles.add(fallback.title.toLowerCase());
        newTasks.push({
          id: crypto.randomUUID(),
          title: fallback.title,
          description: fallback.description,
          sourceUrl: fallback.sourceUrl,
          competitor: fallback.competitor,
          category: fallback.category,
          status: 'pending',
          createdAt: new Date().toISOString(),
        });
      }
    }
  }

  const updatedTasks = [...newTasks, ...existingTasks];
  saveData(updatedTasks);

  return {
    tasksAdded: newTasks.length,
    totalTasks: updatedTasks.length,
    success: true,
  };
}

export function updateTaskStatusInStore(taskId: string, status: TaskStatus): Task | null {
  const tasks = getTasks();
  const taskIndex = tasks.findIndex(t => t.id === taskId);
  if (taskIndex === -1) return null;

  tasks[taskIndex].status = status;
  saveData(tasks);
  return tasks[taskIndex];
}
