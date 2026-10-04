import crypto from 'crypto';
import fs from 'fs/promises';
import path from 'path';
import Parser from 'rss-parser';

export type TaskStatus = 'pending' | 'in_progress' | 'completed' | 'dismissed';
export type TaskPriority = 'low' | 'medium' | 'high';

export interface Task {
  id: string;
  title: string;
  description: string;
  source: string;
  category: string;
  status: TaskStatus;
  priority: TaskPriority;
  createdAt: string;
  url?: string;
}

const DATA_DIR = path.join(process.cwd(), 'data');
const TASKS_FILE = path.join(DATA_DIR, 'tasks.json');

const parser = new Parser({
  headers: {
    'User-Agent':
      'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
  },
  timeout: 5000,
});

const FALLBACK_COMPETITOR_TOPICS = [
  {
    title: 'Review: Best Noise-Canceling Headphones of 2026',
    description: 'Competitive review analysis comparing top wireless ANC headphones in the US market.',
    source: 'Wirecutter Benchmark',
    category: 'Electronics',
    priority: 'high' as TaskPriority,
    url: 'https://www.nytimes.com/wirecutter/reviews/best-noise-cancelling-headphones/',
  },
  {
    title: 'Guide: Best Ergonomic Office Chairs for Home Working',
    description: 'US buyer guide benchmarking top-rated ergonomic chairs and lumbar support.',
    source: 'Wirecutter Benchmark',
    category: 'Home & Office',
    priority: 'high' as TaskPriority,
    url: 'https://www.nytimes.com/wirecutter/reviews/best-office-chair/',
  },
  {
    title: 'Review: 4K OLED Gaming Monitors Comparison',
    description: 'RTINGS competitor benchmark evaluating high refresh rate 4K gaming displays.',
    source: 'RTINGS Benchmark',
    category: 'Tech & Gaming',
    priority: 'medium' as TaskPriority,
    url: 'https://www.rtings.com/monitor/reviews/best/by-usage/gaming',
  },
  {
    title: 'Guide: Best Robot Vacuum Cleaners with Self-Empty Station',
    description: 'Automated gap analysis for smart home cleaning products popular in North America.',
    source: 'Wirecutter Benchmark',
    category: 'Smart Home',
    priority: 'medium' as TaskPriority,
    url: 'https://www.nytimes.com/wirecutter/reviews/best-robot-vacuum/',
  },
];

async function ensureDataDirectory(): Promise<void> {
  try {
    await fs.mkdir(DATA_DIR, { recursive: true });
  } catch (err: unknown) {
    if (err instanceof Error) {
      const errnoErr = err as NodeJS.ErrnoException;
      if (errnoErr.code === 'EROFS') {
        console.warn('Read-only filesystem detected, proceeding in-memory mode.');
        return;
      }
    }
  }
}

async function saveData(data: unknown): Promise<boolean> {
  await ensureDataDirectory();
  try {
    const jsonContent = JSON.stringify(data, null, 2);
    await fs.writeFile(TASKS_FILE, jsonContent, 'utf-8');
    return true;
  } catch (err: unknown) {
    if (err instanceof Error) {
      const errnoErr = err as NodeJS.ErrnoException;
      if (errnoErr.code === 'EROFS') {
        console.warn('Unable to write tasks file: Read-only filesystem (EROFS).');
        return false;
      }
    }
    console.error('Error saving tasks data:', err);
    return false;
  }
}

export async function getTasks(): Promise<Task[]> {
  try {
    const fileContent = await fs.readFile(TASKS_FILE, 'utf-8');
    const tasks: Task[] = JSON.parse(fileContent);
    return tasks;
  } catch (err: unknown) {
    if (err instanceof Error) {
      const errnoErr = err as NodeJS.ErrnoException;
      if (errnoErr.code === 'ENOENT' || errnoErr.code === 'EROFS') {
        return [];
      }
    }
    return [];
  }
}

export async function saveTasks(tasks: Task[]): Promise<boolean> {
  return saveData(tasks);
}

export async function runBenchmark(): Promise<Task[]> {
  const existingTasks = await getTasks();
  const existingTitles = new Set(existingTasks.map(t => t.title.toLowerCase()));
  const newTasks: Task[] = [];

  const feeds = [
    {
      name: 'Wirecutter',
      url: 'https://www.nytimes.com/wirecutter/feed/',
    },
    {
      name: 'RTINGS',
      url: 'https://www.rtings.com/rss/reviews.xml',
    },
  ];

  let fetchedAny = false;

  for (const feedConfig of feeds) {
    try {
      const feed = await parser.parseURL(feedConfig.url);
      if (feed.items && feed.items.length > 0) {
        fetchedAny = true;
        for (const item of feed.items.slice(0, 5)) {
          const rawTitle = item.title?.trim();
          if (!rawTitle) continue;

          const formattedTitle = rawTitle.toLowerCase().includes('review')
            ? `Review: ${rawTitle}`
            : `Guide: ${rawTitle}`;

          if (existingTitles.has(formattedTitle.toLowerCase())) {
            continue;
          }

          const newTask: Task = {
            id: crypto.randomUUID(),
            title: formattedTitle,
            description: item.contentSnippet || item.summary || `Automated competitor benchmark task created from ${feedConfig.name}.`,
            source: `${feedConfig.name} Feed`,
            category: 'Electronics & Home',
            status: 'pending',
            priority: 'high',
            createdAt: new Date().toISOString(),
            url: item.link || undefined,
          };

          newTasks.push(newTask);
          existingTitles.add(formattedTitle.toLowerCase());
        }
      }
    } catch (feedError) {
      console.warn(`Failed to fetch or parse RSS feed for ${feedConfig.name}:`, feedError);
    }
  }

  if (!fetchedAny || newTasks.length === 0) {
    for (const fallback of FALLBACK_COMPETITOR_TOPICS) {
      if (!existingTitles.has(fallback.title.toLowerCase())) {
        const newTask: Task = {
          id: crypto.randomUUID(),
          title: fallback.title,
          description: fallback.description,
          source: fallback.source,
          category: fallback.category,
          status: 'pending',
          priority: fallback.priority,
          createdAt: new Date().toISOString(),
          url: fallback.url,
        };
        newTasks.push(newTask);
        existingTitles.add(fallback.title.toLowerCase());
      }
    }
  }

  const updatedTasks = [...newTasks, ...existingTasks];
  await saveTasks(updatedTasks);
  return updatedTasks;
}

export async function updateTaskStatus(id: string, status: TaskStatus): Promise<Task | null> {
  const tasks = await getTasks();
  let updatedTask: Task | null = null;

  const newTasks = tasks.map(task => {
    if (task.id === id) {
      updatedTask = { ...task, status };
      return updatedTask;
    }
    return task;
  });

  if (updatedTask) {
    await saveTasks(newTasks);
  }

  return updatedTask;
}

export async function deleteTask(id: string): Promise<boolean> {
  const tasks = await getTasks();
  const initialLength = tasks.length;
  const filteredTasks = tasks.filter(t => t.id !== id);

  if (filteredTasks.length < initialLength) {
    await saveTasks(filteredTasks);
    return true;
  }

  return false;
}
