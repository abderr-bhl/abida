import fs from 'fs';
import path from 'path';
import crypto from 'crypto';
import Parser from 'rss-parser';

export interface Task {
  id: string;
  title: string;
  description: string;
  sourceUrl: string;
  competitor: string;
  status: 'pending' | 'in_progress' | 'completed' | 'cancelled';
  createdAt: string;
  updatedAt: string;
}

const DATA_DIR = path.join(process.cwd(), 'data');
const TASKS_FILE = path.join(DATA_DIR, 'tasks.json');

const FALLBACK_TOPICS = [
  {
    title: 'Review: Best Wireless Noise-Canceling Headphones 2025',
    description: 'Benchmarked from market trends. Comparative evaluation of flagship ANC headphones.',
    sourceUrl: 'https://www.nytimes.com/wirecutter/reviews/best-wireless-noise-canceling-headphones/',
    competitor: 'Wirecutter',
  },
  {
    title: 'Review: Best OLED TVs for Gaming and Movies',
    description: 'Benchmarked from market trends. Detailed display testing and response time benchmarking.',
    sourceUrl: 'https://www.rtings.com/tv/reviews/best/by-type/oled',
    competitor: 'RTINGS',
  },
  {
    title: 'Review: Best Robot Vacuums for Hardwood Floors',
    description: 'Benchmarked from market trends. Automated cleaning efficiency and obstacle avoidance assessment.',
    sourceUrl: 'https://www.nytimes.com/wirecutter/reviews/best-robot-vacuum/',
    competitor: 'Wirecutter',
  },
  {
    title: 'Review: Best Ergonomic Office Chairs',
    description: 'Benchmarked from market trends. Ergonomic support and durability testing.',
    sourceUrl: 'https://www.nytimes.com/wirecutter/reviews/best-office-chair/',
    competitor: 'Wirecutter',
  },
];

function ensureDirectoryExists() {
  try {
    if (!fs.existsSync(DATA_DIR)) {
      fs.mkdirSync(DATA_DIR, { recursive: true });
    }
  } catch (err) {
    if (err instanceof Error) {
      const errnoErr = err as NodeJS.ErrnoException;
      if (errnoErr.code === 'EROFS') {
        console.warn('Read-only filesystem: unable to create data directory.');
      }
    }
  }
}

function saveData(data: unknown): boolean {
  ensureDirectoryExists();
  try {
    fs.writeFileSync(TASKS_FILE, JSON.stringify(data, null, 2), 'utf-8');
    return true;
  } catch (err) {
    if (err instanceof Error) {
      const errnoErr = err as NodeJS.ErrnoException;
      if (errnoErr.code === 'EROFS') {
        console.warn('Read-only filesystem: unable to write tasks.json file.');
      } else {
        console.error('Failed to save tasks file:', err);
      }
    }
    return false;
  }
}

export function getTasks(): Task[] {
  try {
    if (fs.existsSync(TASKS_FILE)) {
      const content = fs.readFileSync(TASKS_FILE, 'utf-8');
      return JSON.parse(content) as Task[];
    }
  } catch (err) {
    if (err instanceof Error) {
      const errnoErr = err as NodeJS.ErrnoException;
      if (errnoErr.code === 'EROFS') {
        console.warn('Read-only filesystem: returning empty tasks list.');
      }
    }
  }
  return [];
}

export async function updateTaskStatus(id: string, status: string): Promise<boolean> {
  const tasks = getTasks();
  const index = tasks.findIndex((t) => t.id === id);
  if (index !== -1) {
    tasks[index].status = status as Task['status'];
    tasks[index].updatedAt = new Date().toISOString();
    return saveData(tasks);
  }
  return false;
}

export async function runBenchmark(): Promise<Task[]> {
  const parser = new Parser({
    headers: {
      'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
    },
    timeout: 5000,
  });

  const existingTasks = getTasks();
  const existingUrls = new Set(existingTasks.map((t) => t.sourceUrl));
  const newTasks: Task[] = [];

  const feeds = [
    { url: 'https://www.nytimes.com/wirecutter/feed/', name: 'Wirecutter' },
    { url: 'https://www.rtings.com/rss/reviews.xml', name: 'RTINGS' },
  ];

  for (const feedConfig of feeds) {
    try {
      const feed = await parser.parseURL(feedConfig.url);
      if (feed && feed.items) {
        for (const item of feed.items) {
          if (!item.link || existingUrls.has(item.link)) continue;

          const rawTitle = item.title?.trim() || 'New Competitor Review';
          const title = rawTitle.startsWith('Review:') ? rawTitle : `Review: ${rawTitle}`;
          const description = item.contentSnippet || item.summary || `Automated task created from competitor content on ${feedConfig.name}.`;

          const task: Task = {
            id: crypto.randomUUID(),
            title,
            description,
            sourceUrl: item.link,
            competitor: feedConfig.name,
            status: 'pending',
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
          };

          newTasks.push(task);
          existingUrls.add(item.link);
        }
      }
    } catch (err) {
      console.warn(`Failed to parse RSS feed from ${feedConfig.name}:`, err);
    }
  }

  if (newTasks.length === 0 && existingTasks.length === 0) {
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

  const allTasks = [...newTasks, ...existingTasks];
  saveData(allTasks);

  return allTasks;
}
