import fs from 'fs';
import path from 'path';
import crypto from 'crypto';
import Parser from 'rss-parser';
import { Task, TaskType } from '@/types/task';

const DATA_DIR = path.join(process.cwd(), 'data');
const TASKS_FILE = path.join(DATA_DIR, 'tasks.json');

const parser = new Parser({
  headers: {
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
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
    title: 'The Best Wireless Earbuds for 2025',
    description: 'Comprehensive review and comparison of top noise-canceling wireless earbuds for daily use.',
    competitor: 'Wirecutter',
    url: 'https://www.nytimes.com/wirecutter/reviews/best-wireless-earbuds/',
    type: 'review' as TaskType,
  },
  {
    title: 'The Best 4K TVs: OLED, QLED, and Budget Options',
    description: 'In-depth testing of picture quality, gaming performance, and smart TV features for modern living rooms.',
    competitor: 'RTINGS',
    url: 'https://www.rtings.com/tv/reviews/best/by-resolution/4k-ultra-hd-uhd',
    type: 'guide' as TaskType,
  },
  {
    title: 'Best Mechanical Keyboards for Ergonomics and Gaming',
    description: 'Evaluating durability, key switches, and typing comfort across top mechanical keyboard brands.',
    competitor: 'Wirecutter',
    url: 'https://www.nytimes.com/wirecutter/reviews/best-mechanical-keyboards/',
    type: 'review' as TaskType,
  },
  {
    title: 'Top Robot Vacuums for Hardwood Floors and Pet Hair',
    description: 'Testing navigation, suction power, and self-emptying docks of the best robotic vacuums.',
    competitor: 'Wirecutter',
    url: 'https://www.nytimes.com/wirecutter/reviews/best-robot-vacuum-cleaners/',
    type: 'guide' as TaskType,
  },
];

export function getStoredTasks(): Task[] {
  try {
    if (!fs.existsSync(TASKS_FILE)) {
      return [];
    }
    const raw = fs.readFileSync(TASKS_FILE, 'utf-8');
    return JSON.parse(raw) as Task[];
  } catch (error) {
    console.error('Error reading tasks file:', error);
    return [];
  }
}

export function saveTasks(tasks: Task[]): void {
  try {
    if (!fs.existsSync(DATA_DIR)) {
      fs.mkdirSync(DATA_DIR, { recursive: true });
    }
    fs.writeFileSync(TASKS_FILE, JSON.stringify(tasks, null, 2), 'utf-8');
  } catch (error) {
    const err = error as NodeJS.ErrnoException;
    if (err.code === 'EROFS') {
      console.warn('FileSystem is read-only. Cannot save tasks to disk.');
    } else {
      console.error('Error saving tasks:', error);
    }
  }
}

function determineTaskType(title: string): TaskType {
  const lower = title.toLowerCase();
  if (lower.includes('vs') || lower.includes('compared') || lower.includes('comparison')) {
    return 'comparison';
  }
  if (lower.includes('how to') || lower.includes('guide') || lower.includes('buying')) {
    return 'guide';
  }
  if (lower.includes('news') || lower.includes('update') || lower.includes('announcement')) {
    return 'blog';
  }
  return 'review';
}

export async function runCompetitiveBenchmark(): Promise<{ addedCount: number; tasks: Task[] }> {
  const existingTasks = getStoredTasks();
  const existingUrls = new Set(existingTasks.map((t) => t.url));
  const newTasks: Task[] = [];

  for (const feedConfig of COMPETITOR_FEEDS) {
    try {
      const feed = await parser.parseURL(feedConfig.url);
      const items = feed.items || [];

      for (const item of items.slice(0, 5)) {
        if (!item.link || existingUrls.has(item.link)) continue;

        const rawTitle = item.title || 'Untitled Competitor Article';
        const type = determineTaskType(rawTitle);
        const title = `Review: ${rawTitle}`;
        const description = item.contentSnippet || item.content || `Competitor task generated from ${feedConfig.name}.`;

        const task: Task = {
          id: crypto.randomUUID(),
          title,
          description,
          competitor: feedConfig.name,
          url: item.link,
          createdAt: new Date().toISOString(),
          status: 'pending',
          type,
        };

        newTasks.push(task);
        existingUrls.add(item.link);
      }
    } catch (err) {
      console.warn(`Failed to fetch RSS feed for ${feedConfig.name}, continuing...`, err);
    }
  }

  // If no new tasks were fetched via RSS feeds, use fallbacks
  if (newTasks.length === 0) {
    for (const fallback of FALLBACK_TOPICS) {
      if (!existingUrls.has(fallback.url)) {
        const task: Task = {
          id: crypto.randomUUID(),
          title: `Review: ${fallback.title}`,
          description: fallback.description,
          competitor: fallback.competitor,
          url: fallback.url,
          createdAt: new Date().toISOString(),
          status: 'pending',
          type: fallback.type,
        };
        newTasks.push(task);
        existingUrls.add(fallback.url);
      }
    }
  }

  const updatedTasks = [...newTasks, ...existingTasks];
  if (newTasks.length > 0) {
    saveTasks(updatedTasks);
  }

  return {
    addedCount: newTasks.length,
    tasks: updatedTasks,
  };
}

export function updateTaskStatusInStore(taskId: string, status: Task['status']): Task[] {
  const tasks = getStoredTasks();
  const updated = tasks.map((t) => (t.id === taskId ? { ...t, status } : t));
  saveTasks(updated);
  return updated;
}
