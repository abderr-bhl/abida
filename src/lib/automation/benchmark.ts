import crypto from 'crypto';
import fs from 'fs';
import path from 'path';
import Parser from 'rss-parser';
import { Task, TaskStatus } from '@/types';

const DATA_DIR = path.join(process.cwd(), 'data');
const TASKS_FILE = path.join(DATA_DIR, 'tasks.json');

const parser = new Parser({
  headers: {
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
  },
  timeout: 10000
});

const COMPETITOR_FEEDS = [
  { name: 'Wirecutter', url: 'https://www.nytimes.com/wirecutter/feed/' },
  { name: 'RTINGS', url: 'https://www.rtings.com/rss/reviews.xml' }
];

const FALLBACK_TOPICS = [
  {
    title: 'Review: Best Wireless Noise-Canceling Headphones of 2025',
    description: 'Benchmarked from competitor coverage. Create an in-depth review comparing Sony WH-1000XM5 and Bose QuietComfort Ultra for US consumers.',
    category: 'Electronics',
    sourceCompetitor: 'Wirecutter',
    sourceUrl: 'https://www.nytimes.com/wirecutter/reviews/best-noise-cancelling-headphones/'
  },
  {
    title: 'Review: Best 4K OLED TVs for Gaming and Movies',
    description: 'Benchmarked from competitor coverage. Analyze LG C4, Samsung S90D, and Sony A80L for optimal US home theater setups.',
    category: 'Home Entertainment',
    sourceCompetitor: 'RTINGS',
    sourceUrl: 'https://www.rtings.com/tv/reviews/best/by-usage/hdr-gaming'
  },
  {
    title: 'Review: Best Robot Vacuums for Pet Hair',
    description: 'Benchmarked from competitor coverage. Evaluate suction performance, obstacle avoidance, and auto-empty docks on top US models.',
    category: 'Home Appliances',
    sourceCompetitor: 'Wirecutter',
    sourceUrl: 'https://www.nytimes.com/wirecutter/reviews/best-robot-vacuum/'
  }
];

function ensureDataDirectoryExists(): void {
  try {
    if (!fs.existsSync(DATA_DIR)) {
      fs.mkdirSync(DATA_DIR, { recursive: true });
    }
  } catch (error: unknown) {
    if (error instanceof Error) {
      const err = error as NodeJS.ErrnoException;
      if (err.code === 'EROFS') {
        console.warn('Read-only filesystem detected; skipping data directory creation.');
        return;
      }
    }
    console.error('Failed to create data directory:', error);
  }
}

export function loadTasks(): Task[] {
  try {
    ensureDataDirectoryExists();
    if (!fs.existsSync(TASKS_FILE)) {
      return [];
    }
    const rawData = fs.readFileSync(TASKS_FILE, 'utf-8');
    const parsed = JSON.parse(rawData);
    if (Array.isArray(parsed)) {
      return parsed as Task[];
    }
    return [];
  } catch (error: unknown) {
    console.error('Error loading tasks:', error);
    return [];
  }
}

export function saveTasks(tasks: unknown): boolean {
  try {
    ensureDataDirectoryExists();
    const jsonContent = JSON.stringify(tasks, null, 2);
    fs.writeFileSync(TASKS_FILE, jsonContent, 'utf-8');
    return true;
  } catch (error: unknown) {
    if (error instanceof Error) {
      const err = error as NodeJS.ErrnoException;
      if (err.code === 'EROFS') {
        console.warn('Read-only filesystem detected; unable to persist tasks to disk.');
        return false;
      }
    }
    console.error('Error saving tasks:', error);
    return false;
  }
}

export async function runBenchmark(): Promise<{ added: number; total: number; tasks: Task[] }> {
  const existingTasks = loadTasks();
  const existingTitles = new Set(existingTasks.map((t) => t.title.toLowerCase().trim()));
  const newTasks: Task[] = [];
  const now = new Date().toISOString();

  for (const feedConfig of COMPETITOR_FEEDS) {
    try {
      const feed = await parser.parseURL(feedConfig.url);
      const items = feed.items || [];

      for (const item of items.slice(0, 5)) {
        const rawTitle = item.title?.trim() || '';
        if (!rawTitle) continue;

        const formattedTitle = rawTitle.toLowerCase().startsWith('review:')
          ? rawTitle
          : `Review: ${rawTitle}`;

        if (existingTitles.has(formattedTitle.toLowerCase().trim())) {
          continue;
        }

        const newTask: Task = {
          id: crypto.randomUUID(),
          title: formattedTitle,
          description: item.contentSnippet || item.summary || `Automated content gap benchmark from ${feedConfig.name}.`,
          category: item.categories?.[0] || 'General Review',
          status: 'pending',
          sourceCompetitor: feedConfig.name,
          sourceUrl: item.link || feedConfig.url,
          createdAt: now,
          updatedAt: now
        };

        newTasks.push(newTask);
        existingTitles.add(formattedTitle.toLowerCase().trim());
      }
    } catch (feedError) {
      console.warn(`Failed to fetch RSS feed for ${feedConfig.name}:`, feedError);
    }
  }

  // If no new tasks were parsed from live RSS feeds (e.g. captcha or network issue), check fallbacks
  if (newTasks.length === 0) {
    for (const fallback of FALLBACK_TOPICS) {
      if (!existingTitles.has(fallback.title.toLowerCase().trim())) {
        const newTask: Task = {
          id: crypto.randomUUID(),
          title: fallback.title,
          description: fallback.description,
          category: fallback.category,
          status: 'pending',
          sourceCompetitor: fallback.sourceCompetitor,
          sourceUrl: fallback.sourceUrl,
          createdAt: now,
          updatedAt: now
        };
        newTasks.push(newTask);
        existingTitles.add(fallback.title.toLowerCase().trim());
      }
    }
  }

  const updatedTasks = [...newTasks, ...existingTasks];
  saveTasks(updatedTasks);

  return {
    added: newTasks.length,
    total: updatedTasks.length,
    tasks: updatedTasks
  };
}

export function updateTaskStatus(taskId: string, newStatus: TaskStatus): Task | null {
  const tasks = loadTasks();
  const index = tasks.findIndex((t) => t.id === taskId);
  if (index === -1) {
    return null;
  }

  tasks[index] = {
    ...tasks[index],
    status: newStatus,
    updatedAt: new Date().toISOString()
  };

  saveTasks(tasks);
  return tasks[index];
}
