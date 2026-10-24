import Parser from 'rss-parser';
import * as fs from 'fs';
import * as path from 'path';
import crypto from 'crypto';
import { Task, TaskStatus } from '@/types';
import { sanitizeUrl } from '@/lib/sanitize';

const DATA_DIR = path.join(process.cwd(), 'data');
const TASKS_FILE = path.join(DATA_DIR, 'tasks.json');

const parser = new Parser({
  headers: {
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
  },
  timeout: 5000,
});

const FALLBACK_TOPICS = [
  {
    title: 'Review: The Best Noise-Canceling Headphones for Travel in 2025',
    competitor: 'Wirecutter',
    url: 'https://www.nytimes.com/wirecutter/reviews/best-noise-cancelling-headphones/',
    description: 'Competitive gap analysis: High consumer interest in ANC wireless headphones.',
    actionRequired: 'Create comprehensive buyer guide comparing Sony WH-1000XM5 and Bose QuietComfort Ultra.',
  },
  {
    title: 'Review: Best OLED TVs for Gaming and Home Theater',
    competitor: 'RTINGS',
    url: 'https://www.rtings.com/tv/reviews/best/by-type/oled',
    description: 'Benchmarked RTINGS rating system for 4K 120Hz OLED televisions.',
    actionRequired: 'Draft side-by-side spec comparison between LG C4 and Samsung S90D.',
  },
  {
    title: 'Guide: Best Robot Vacuums for Pet Hair and Hardwood Floors',
    competitor: 'Wirecutter',
    url: 'https://www.nytimes.com/wirecutter/reviews/best-robot-vacuum/',
    description: 'Monitored trending article on automated home cleaning solutions.',
    actionRequired: 'Update top picks for self-emptying robot vacuum cleaners with Amazon affiliate links.',
  },
  {
    title: 'Review: Top Ergonomic Office Chairs for Remote Work',
    competitor: 'RTINGS',
    url: 'https://www.rtings.com/chair/reviews/best/office-chairs',
    description: 'Identified ergonomic desk setup gap in lumbar support category.',
    actionRequired: 'Publish detailed review of Herman Miller Aeron vs Steelcase Gesture.',
  },
];

function ensureDataDirectoryExists(): void {
  try {
    if (!fs.existsSync(DATA_DIR)) {
      fs.mkdirSync(DATA_DIR, { recursive: true });
    }
  } catch (error) {
    if (error instanceof Error) {
      const err = error as NodeJS.ErrnoException;
      if (err.code === 'EROFS') {
        console.warn('Read-only filesystem detected (EROFS). Skipping directory creation.');
        return;
      }
    }
    console.error('Error creating data directory:', error);
  }
}

function saveData(tasks: unknown): boolean {
  ensureDataDirectoryExists();
  try {
    fs.writeFileSync(TASKS_FILE, JSON.stringify(tasks, null, 2), 'utf-8');
    return true;
  } catch (error) {
    if (error instanceof Error) {
      const err = error as NodeJS.ErrnoException;
      if (err.code === 'EROFS') {
        console.warn('Read-only filesystem (EROFS). Local task persistence skipped.');
        return false;
      }
    }
    console.error('Failed to save tasks to JSON:', error);
    return false;
  }
}

export function loadTasks(): Task[] {
  try {
    if (fs.existsSync(TASKS_FILE)) {
      const data = fs.readFileSync(TASKS_FILE, 'utf-8');
      const parsed = JSON.parse(data);
      if (Array.isArray(parsed)) {
        return parsed as Task[];
      }
    }
  } catch (error) {
    if (error instanceof Error) {
      const err = error as NodeJS.ErrnoException;
      if (err.code === 'EROFS') {
        console.warn('Read-only filesystem (EROFS). Returning empty task array.');
        return [];
      }
    }
    console.error('Error reading tasks file:', error);
  }

  // Initialize with initial fallback tasks if file doesn't exist yet
  const initialTasks: Task[] = FALLBACK_TOPICS.map((topic) => ({
    id: crypto.randomUUID(),
    title: topic.title,
    description: topic.description,
    competitor: topic.competitor,
    url: sanitizeUrl(topic.url),
    status: 'pending' as TaskStatus,
    createdAt: new Date().toISOString(),
    actionRequired: topic.actionRequired,
  }));

  saveData(initialTasks);
  return initialTasks;
}

export function updateTaskStatusInStore(taskId: string, status: TaskStatus): Task[] {
  const tasks = loadTasks();
  const updated = tasks.map((task) => (task.id === taskId ? { ...task, status } : task));
  saveData(updated);
  return updated;
}

export async function runBenchmark(): Promise<{ added: number; total: number; tasks: Task[] }> {
  const existingTasks = loadTasks();
  const existingTitles = new Set(existingTasks.map((t) => t.title.toLowerCase()));
  const newTasks: Task[] = [];

  const feedsToMonitor = [
    { competitor: 'Wirecutter', url: 'https://www.nytimes.com/wirecutter/feed/' },
    { competitor: 'RTINGS', url: 'https://www.rtings.com/rss/reviews.xml' },
  ];

  for (const feedConfig of feedsToMonitor) {
    try {
      const feed = await parser.parseURL(feedConfig.url);
      if (feed && feed.items) {
        for (const item of feed.items.slice(0, 5)) {
          const rawTitle = item.title?.trim() || '';
          if (!rawTitle) continue;

          const formattedTitle = rawTitle.toLowerCase().startsWith('review:') || rawTitle.toLowerCase().startsWith('guide:')
            ? rawTitle
            : `Review: ${rawTitle}`;

          if (!existingTitles.has(formattedTitle.toLowerCase())) {
            const newTask: Task = {
              id: crypto.randomUUID(),
              title: formattedTitle,
              description: item.contentSnippet || item.summary || `Automated gap benchmark from ${feedConfig.competitor}.`,
              competitor: feedConfig.competitor,
              url: sanitizeUrl(item.link || feedConfig.url),
              status: 'pending',
              createdAt: new Date().toISOString(),
              actionRequired: `Evaluate ${feedConfig.competitor} coverage and write US market buyer's guide.`,
            };
            newTasks.push(newTask);
            existingTitles.add(formattedTitle.toLowerCase());
          }
        }
      }
    } catch (feedError) {
      console.warn(`Could not fetch RSS feed for ${feedConfig.competitor}:`, feedError);
    }
  }

  // If no new tasks were identified from live RSS feeds, add a fresh fallback topic
  if (newTasks.length === 0) {
    for (const fallback of FALLBACK_TOPICS) {
      if (!existingTitles.has(fallback.title.toLowerCase())) {
        const newTask: Task = {
          id: crypto.randomUUID(),
          title: fallback.title,
          description: fallback.description,
          competitor: fallback.competitor,
          url: sanitizeUrl(fallback.url),
          status: 'pending',
          createdAt: new Date().toISOString(),
          actionRequired: fallback.actionRequired,
        };
        newTasks.push(newTask);
        existingTitles.add(fallback.title.toLowerCase());
        break;
      }
    }
  }

  const combinedTasks = [...newTasks, ...existingTasks];
  saveData(combinedTasks);

  return {
    added: newTasks.length,
    total: combinedTasks.length,
    tasks: combinedTasks,
  };
}
