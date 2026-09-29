import fs from 'fs';
import path from 'path';
import { randomUUID } from 'crypto';
import Parser from 'rss-parser';
import { Task } from '@/types';
import { sanitizeUrl } from '@/lib/sanitize';

const DATA_DIR = path.join(process.cwd(), 'data');
const TASKS_FILE = path.join(DATA_DIR, 'tasks.json');

const parser = new Parser({
  headers: {
    'User-Agent':
      'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
  },
  timeout: 5000,
});

const FALLBACK_TOPICS = [
  {
    title: 'Review: The Best Wireless Noise-Canceling Headphones',
    description: 'Benchmarked from Wirecutter top coverage in audio equipment.',
    competitor: 'Wirecutter',
    competitorUrl: 'https://www.nytimes.com/wirecutter/reviews/best-wireless-headphones/',
  },
  {
    title: 'Review: The Best Robot Vacuums for Pet Hair',
    description: 'Benchmarked from Wirecutter top coverage in smart home appliances.',
    competitor: 'Wirecutter',
    competitorUrl: 'https://www.nytimes.com/wirecutter/reviews/best-robot-vacuum/',
  },
  {
    title: 'Review: LG C3 OLED TV Performance & Calibration',
    description: 'Benchmarked from RTINGS in-depth TV testing and laboratory ratings.',
    competitor: 'RTINGS',
    competitorUrl: 'https://www.rtings.com/tv/reviews/lg/c3-oled',
  },
  {
    title: 'Review: The Best Air Purifiers for Large Rooms',
    description: 'Benchmarked from Wirecutter top coverage in home air quality.',
    competitor: 'Wirecutter',
    competitorUrl: 'https://www.nytimes.com/wirecutter/reviews/best-air-purifier/',
  },
  {
    title: 'Review: Sony WH-1000XM5 Noise Canceling Benchmark',
    description: 'Benchmarked from RTINGS headphone frequency response and isolation tests.',
    competitor: 'RTINGS',
    competitorUrl: 'https://www.rtings.com/headphones/reviews/sony/wh-1000xm5-wireless',
  },
];

export function getTasks(): Task[] {
  try {
    if (!fs.existsSync(TASKS_FILE)) {
      return [];
    }
    const content = fs.readFileSync(TASKS_FILE, 'utf8');
    return JSON.parse(content) as Task[];
  } catch (error: unknown) {
    console.warn('Failed to read tasks file:', error);
    return [];
  }
}

export function saveTasks(tasks: Task[]): void {
  try {
    if (!fs.existsSync(DATA_DIR)) {
      fs.mkdirSync(DATA_DIR, { recursive: true });
    }
    fs.writeFileSync(TASKS_FILE, JSON.stringify(tasks, null, 2), 'utf8');
  } catch (error: unknown) {
    if (error instanceof Error) {
      const err = error as NodeJS.ErrnoException;
      if (err.code === 'EROFS') {
        console.warn('Read-only filesystem: unable to persist tasks to disk.');
        return;
      }
    }
    console.error('Error saving tasks:', error);
  }
}

export async function runBenchmark(): Promise<{
  success: boolean;
  newTasksCount: number;
  tasks: Task[];
}> {
  const existingTasks = getTasks();
  const existingTitles = new Set(existingTasks.map((t) => t.title.toLowerCase()));

  const newTasks: Task[] = [];
  const now = new Date().toISOString();

  // Try fetching Wirecutter RSS
  try {
    const feed = await parser.parseURL('https://www.nytimes.com/wirecutter/feed/');
    if (feed.items && feed.items.length > 0) {
      for (const item of feed.items.slice(0, 5)) {
        if (!item.title) continue;
        const taskTitle = item.title.startsWith('Review:') ? item.title : `Review: ${item.title}`;
        if (!existingTitles.has(taskTitle.toLowerCase())) {
          existingTitles.add(taskTitle.toLowerCase());
          newTasks.push({
            id: randomUUID(),
            title: taskTitle,
            description: item.contentSnippet || item.summary || 'Competitor article identified via Wirecutter RSS feed.',
            status: 'pending',
            competitor: 'Wirecutter',
            competitorUrl: sanitizeUrl(item.link || 'https://www.nytimes.com/wirecutter/'),
            createdAt: now,
            updatedAt: now,
          });
        }
      }
    }
  } catch (err: unknown) {
    console.warn('Wirecutter RSS feed fetch error, using fallbacks if needed:', err);
  }

  // Try fetching RTINGS RSS
  try {
    const feed = await parser.parseURL('https://www.rtings.com/rss/reviews.xml');
    if (feed.items && feed.items.length > 0) {
      for (const item of feed.items.slice(0, 5)) {
        if (!item.title) continue;
        const taskTitle = item.title.startsWith('Review:') ? item.title : `Review: ${item.title}`;
        if (!existingTitles.has(taskTitle.toLowerCase())) {
          existingTitles.add(taskTitle.toLowerCase());
          newTasks.push({
            id: randomUUID(),
            title: taskTitle,
            description: item.contentSnippet || item.summary || 'Competitor article identified via RTINGS RSS feed.',
            status: 'pending',
            competitor: 'RTINGS',
            competitorUrl: sanitizeUrl(item.link || 'https://www.rtings.com/'),
            createdAt: now,
            updatedAt: now,
          });
        }
      }
    }
  } catch (err: unknown) {
    console.warn('RTINGS RSS feed fetch error, using fallbacks if needed:', err);
  }

  // If no new tasks were added, inject fallback tasks
  if (newTasks.length === 0) {
    for (const fallback of FALLBACK_TOPICS) {
      if (!existingTitles.has(fallback.title.toLowerCase())) {
        existingTitles.add(fallback.title.toLowerCase());
        newTasks.push({
          id: randomUUID(),
          title: fallback.title,
          description: fallback.description,
          status: 'pending',
          competitor: fallback.competitor,
          competitorUrl: sanitizeUrl(fallback.competitorUrl),
          createdAt: now,
          updatedAt: now,
        });
      }
    }
  }

  const updatedTasks = [...newTasks, ...existingTasks];
  saveTasks(updatedTasks);

  return {
    success: true,
    newTasksCount: newTasks.length,
    tasks: updatedTasks,
  };
}

export function updateTaskStatus(
  id: string,
  status: 'pending' | 'in_progress' | 'completed'
): Task | null {
  const tasks = getTasks();
  const taskIndex = tasks.findIndex((t) => t.id === id);
  if (taskIndex === -1) return null;

  tasks[taskIndex] = {
    ...tasks[taskIndex],
    status,
    updatedAt: new Date().toISOString(),
  };

  saveTasks(tasks);
  return tasks[taskIndex];
}
