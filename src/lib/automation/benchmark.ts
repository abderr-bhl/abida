import fs from 'fs';
import path from 'path';
import crypto from 'crypto';
import Parser from 'rss-parser';
import { Task, TaskStatus } from '@/types';

const TASKS_FILE = path.join(process.cwd(), 'data', 'tasks.json');

const RSS_FEEDS = [
  { name: 'Wirecutter', url: 'https://www.nytimes.com/wirecutter/feed/' },
  { name: 'RTINGS', url: 'https://www.rtings.com/rss/reviews.xml' },
];

const FALLBACK_TOPICS = [
  {
    title: 'Review: The Best Cordless Vacuums of 2025',
    description: 'Benchmarked from competitor review: In-depth evaluation of top-rated cordless stick vacuums for battery life and suction power.',
    source: 'Wirecutter Benchmark Fallback',
    sourceUrl: 'https://www.nytimes.com/wirecutter/reviews/best-cordless-vacuum/',
  },
  {
    title: 'Review: Best Noise-Canceling Headphones for Travel',
    description: 'Benchmarked from competitor review: Comparative testing of active noise cancellation, comfort, and sound quality for premium over-ear headphones.',
    source: 'RTINGS Benchmark Fallback',
    sourceUrl: 'https://www.rtings.com/headphones/reviews/best/by-feature/active-noise-cancelling',
  },
  {
    title: 'Review: Top OLED TVs for Gaming and Movies',
    description: 'Benchmarked from competitor review: Analysis of display latency, peak brightness, and color accuracy across major OLED TV brands.',
    source: 'RTINGS Benchmark Fallback',
    sourceUrl: 'https://www.rtings.com/tv/reviews/best/by-type/oled',
  },
  {
    title: 'Review: The Best Smart Thermostats for Energy Efficiency',
    description: 'Benchmarked from competitor review: Hands-on testing of smart home integration, scheduling capabilities, and energy savings.',
    source: 'Wirecutter Benchmark Fallback',
    sourceUrl: 'https://www.nytimes.com/wirecutter/reviews/the-best-thermostat/',
  },
];

export function getTasks(): Task[] {
  try {
    if (!fs.existsSync(TASKS_FILE)) {
      return [];
    }
    const data = fs.readFileSync(TASKS_FILE, 'utf-8');
    const parsed: unknown = JSON.parse(data);
    if (Array.isArray(parsed)) {
      return parsed as Task[];
    }
    return [];
  } catch (error) {
    if (error instanceof Error) {
      const err = error as NodeJS.ErrnoException;
      if (err.code === 'EROFS') {
        console.warn('Read-only filesystem: unable to read tasks file.');
      }
    }
    return [];
  }
}

export function saveTasks(tasks: Task[]): boolean {
  try {
    const dir = path.dirname(TASKS_FILE);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    fs.writeFileSync(TASKS_FILE, JSON.stringify(tasks, null, 2), 'utf-8');
    return true;
  } catch (error) {
    if (error instanceof Error) {
      const err = error as NodeJS.ErrnoException;
      if (err.code === 'EROFS') {
        console.warn('Read-only filesystem: unable to write tasks file.');
      } else {
        console.error('Failed to save tasks:', err.message);
      }
    }
    return false;
  }
}

export async function runBenchmark(): Promise<{ success: boolean; newTasksCount: number; message: string }> {
  const existingTasks = getTasks();
  const existingTitles = new Set(existingTasks.map(t => t.title.toLowerCase()));
  const newTasks: Task[] = [];
  const parser = new Parser({
    headers: {
      'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
    },
    timeout: 5000,
  });

  for (const feed of RSS_FEEDS) {
    try {
      const feedData = await parser.parseURL(feed.url);
      if (feedData && feedData.items) {
        for (const item of feedData.items.slice(0, 5)) {
          if (!item.title) continue;
          const cleanTitle = item.title.replace(/^(Review:\s*)+/i, '').trim();
          const taskTitle = `Review: ${cleanTitle}`;

          if (!existingTitles.has(taskTitle.toLowerCase())) {
            existingTitles.add(taskTitle.toLowerCase());
            newTasks.push({
              id: crypto.randomUUID(),
              title: taskTitle,
              description: item.contentSnippet || item.summary || `Automated benchmark task derived from ${feed.name}: ${item.title}`,
              source: feed.name,
              sourceUrl: item.link || feed.url,
              status: 'pending',
              createdAt: new Date().toISOString(),
            });
          }
        }
      }
    } catch (feedError) {
      console.warn(`Failed to fetch RSS feed for ${feed.name}:`, feedError instanceof Error ? feedError.message : feedError);
    }
  }

  if (newTasks.length === 0) {
    for (const fallback of FALLBACK_TOPICS) {
      if (!existingTitles.has(fallback.title.toLowerCase())) {
        existingTitles.add(fallback.title.toLowerCase());
        newTasks.push({
          id: crypto.randomUUID(),
          title: fallback.title,
          description: fallback.description,
          source: fallback.source,
          sourceUrl: fallback.sourceUrl,
          status: 'pending',
          createdAt: new Date().toISOString(),
        });
      }
    }
  }

  if (newTasks.length > 0) {
    const updatedTasks = [...newTasks, ...existingTasks];
    saveTasks(updatedTasks);
    return {
      success: true,
      newTasksCount: newTasks.length,
      message: `Benchmark completed. Added ${newTasks.length} new tasks.`,
    };
  }

  return {
    success: true,
    newTasksCount: 0,
    message: 'Benchmark completed. No new tasks created.',
  };
}

export function updateTaskStatus(taskId: string, status: TaskStatus): boolean {
  const tasks = getTasks();
  const index = tasks.findIndex(t => t.id === taskId);
  if (index === -1) return false;

  tasks[index].status = status;
  return saveTasks(tasks);
}
