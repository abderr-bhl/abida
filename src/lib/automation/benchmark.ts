import crypto from 'crypto';
import fs from 'fs';
import path from 'path';
import Parser from 'rss-parser';

export type TaskStatus = 'pending' | 'in_progress' | 'completed' | 'cancelled';

export interface Task {
  id: string;
  title: string;
  category: string;
  description: string;
  sourceUrl: string;
  competitor: string;
  status: TaskStatus;
  createdAt: string;
  updatedAt: string;
}

const DATA_DIR = path.join(process.cwd(), 'data');
const TASKS_FILE = path.join(DATA_DIR, 'tasks.json');

const FALLBACK_TOPICS: Array<{ title: string; category: string; description: string; sourceUrl: string; competitor: string }> = [
  {
    title: 'Review: The Best Robot Vacuums for Pet Hair in 2025',
    category: 'Home Appliances',
    description: 'Wirecutter published a major update on pet-focused robot vacuums with anti-tangle brushrolls.',
    sourceUrl: 'https://www.nytimes.com/wirecutter/reviews/best-robot-vacuum/',
    competitor: 'Wirecutter'
  },
  {
    title: 'Review: Best Wireless Noise-Canceling Headphones',
    category: 'Electronics',
    description: 'RTINGS published updated frequency response tests and active noise cancellation benchmarks for flagship headphones.',
    sourceUrl: 'https://www.rtings.com/headphones/reviews/best/by-feature/active-noise-cancelling-anc',
    competitor: 'RTINGS'
  },
  {
    title: 'Guide: Best OLED TVs for Gaming and Movies',
    category: 'Electronics',
    description: 'Competitors released comprehensive lab testing on response time, burn-in risk, and peak brightness for 2025 OLED TVs.',
    sourceUrl: 'https://www.rtings.com/tv/reviews/best/by-type/oled',
    competitor: 'RTINGS'
  },
  {
    title: 'Review: Best Air Purifiers for Allergies and Smoke',
    category: 'Home Appliances',
    description: 'Wirecutter performed clean air delivery rate (CADR) testing across top HEPA air purifiers.',
    sourceUrl: 'https://www.nytimes.com/wirecutter/reviews/best-air-purifier/',
    competitor: 'Wirecutter'
  }
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
  } catch (error: unknown) {
    if (error instanceof Error) {
      const err = error as NodeJS.ErrnoException;
      if (err.code === 'ENOENT') {
        return [];
      }
    }
    console.warn('Failed to read tasks file:', error);
    return [];
  }
}

export function saveData(tasks: Task[]): boolean {
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
        console.warn('Read-only filesystem encountered (EROFS). Cannot write tasks.json.');
        return false;
      }
    }
    console.error('Failed to save tasks file:', error);
    return false;
  }
}

export async function runBenchmark(): Promise<{ success: boolean; newTasksCount: number; tasks: Task[] }> {
  const existingTasks = getTasks();
  const existingUrls = new Set(existingTasks.map(t => t.sourceUrl));
  const existingTitles = new Set(existingTasks.map(t => t.title.toLowerCase()));

  const newTasksToInsert: Task[] = [];
  const parser = new Parser({
    headers: {
      'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
    },
    timeout: 5000
  });

  const feeds = [
    { name: 'Wirecutter', url: 'https://www.nytimes.com/wirecutter/feed/' },
    { name: 'RTINGS', url: 'https://www.rtings.com/rss/reviews.xml' }
  ];

  for (const feedConfig of feeds) {
    try {
      const feed = await parser.parseURL(feedConfig.url);
      if (feed.items && feed.items.length > 0) {
        for (const item of feed.items.slice(0, 5)) {
          const rawTitle = item.title?.trim() || '';
          const link = item.link?.trim() || '';
          if (!rawTitle || !link) continue;

          const formattedTitle = rawTitle.startsWith('Review:') || rawTitle.startsWith('Guide:')
            ? rawTitle
            : `Review: ${rawTitle}`;

          if (existingUrls.has(link) || existingTitles.has(formattedTitle.toLowerCase())) {
            continue;
          }

          const category = rawTitle.toLowerCase().includes('tv') || rawTitle.toLowerCase().includes('headphone')
            ? 'Electronics'
            : 'Home Appliances';

          const now = new Date().toISOString();
          const newTask: Task = {
            id: crypto.randomUUID(),
            title: formattedTitle,
            category,
            description: item.contentSnippet || item.summary || `Automated task created based on competitor content published by ${feedConfig.name}.`,
            sourceUrl: link,
            competitor: feedConfig.name,
            status: 'pending',
            createdAt: now,
            updatedAt: now
          };

          newTasksToInsert.push(newTask);
          existingUrls.add(link);
          existingTitles.add(formattedTitle.toLowerCase());
        }
      }
    } catch (feedError: unknown) {
      console.warn(`Could not fetch RSS feed for ${feedConfig.name}:`, feedError);
    }
  }

  if (newTasksToInsert.length === 0) {
    for (const fallback of FALLBACK_TOPICS) {
      if (!existingUrls.has(fallback.sourceUrl) && !existingTitles.has(fallback.title.toLowerCase())) {
        const now = new Date().toISOString();
        const newTask: Task = {
          id: crypto.randomUUID(),
          title: fallback.title,
          category: fallback.category,
          description: fallback.description,
          sourceUrl: fallback.sourceUrl,
          competitor: fallback.competitor,
          status: 'pending',
          createdAt: now,
          updatedAt: now
        };
        newTasksToInsert.push(newTask);
        existingUrls.add(fallback.sourceUrl);
        existingTitles.add(fallback.title.toLowerCase());
      }
    }
  }

  const updatedTasks = [...newTasksToInsert, ...existingTasks];
  saveData(updatedTasks);

  return {
    success: true,
    newTasksCount: newTasksToInsert.length,
    tasks: updatedTasks
  };
}

export function updateTaskStatus(taskId: string, status: TaskStatus): boolean {
  const tasks = getTasks();
  const taskIndex = tasks.findIndex(t => t.id === taskId);
  if (taskIndex === -1) {
    return false;
  }

  tasks[taskIndex].status = status;
  tasks[taskIndex].updatedAt = new Date().toISOString();
  return saveData(tasks);
}
