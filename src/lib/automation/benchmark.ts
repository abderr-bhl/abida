import fs from 'fs';
import path from 'path';
import crypto from 'crypto';
import Parser from 'rss-parser';
import { AutomatedTask, TaskStatus } from '@/types';

const DATA_DIR = path.join(process.cwd(), 'data');
const TASKS_FILE = path.join(DATA_DIR, 'tasks.json');

const parser = new Parser({
  headers: {
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
  },
  timeout: 10000,
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

const INITIAL_TASKS: AutomatedTask[] = [
  {
    id: 'task-1',
    title: 'Review: The Best Robot Vacuums for 2024',
    description: 'Benchmark Wirecutter recommendation on top-performing robot vacuums and compare features.',
    sourceUrl: 'https://www.nytimes.com/wirecutter/reviews/best-robot-vacuum/',
    competitor: 'Wirecutter',
    status: 'pending',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'task-2',
    title: 'Review: Top Noise Cancelling Headphones',
    description: 'Analyze recent RTINGS testing guidelines for noise canceling headphone frequency response.',
    sourceUrl: 'https://www.rtings.com/headphones/reviews/best/by-feature/active-noise-cancelling-anc',
    competitor: 'RTINGS',
    status: 'in_progress',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
];

function ensureDataDirectory(): void {
  try {
    if (!fs.existsSync(DATA_DIR)) {
      fs.mkdirSync(DATA_DIR, { recursive: true });
    }
  } catch (err: unknown) {
    if (err instanceof Error && (err as NodeJS.ErrnoException).code === 'EROFS') {
      console.warn('Warning: Read-only filesystem encountered when creating data directory.');
    } else {
      console.error('Error creating data directory:', err);
    }
  }
}

function loadTasksData(): AutomatedTask[] {
  ensureDataDirectory();
  try {
    if (!fs.existsSync(TASKS_FILE)) {
      saveTasksData(INITIAL_TASKS);
      return INITIAL_TASKS;
    }
    const content = fs.readFileSync(TASKS_FILE, 'utf-8');
    return JSON.parse(content) as AutomatedTask[];
  } catch (err: unknown) {
    if (err instanceof Error && (err as NodeJS.ErrnoException).code === 'EROFS') {
      console.warn('Warning: Read-only filesystem encountered when reading tasks file.');
    } else {
      console.error('Error loading tasks file:', err);
    }
    return INITIAL_TASKS;
  }
}

function saveTasksData(tasks: unknown): void {
  ensureDataDirectory();
  try {
    fs.writeFileSync(TASKS_FILE, JSON.stringify(tasks, null, 2), 'utf-8');
  } catch (err: unknown) {
    if (err instanceof Error && (err as NodeJS.ErrnoException).code === 'EROFS') {
      console.warn('Warning: Read-only filesystem encountered when writing tasks data.');
    } else {
      console.error('Error saving tasks data:', err);
    }
  }
}

export async function getAutomatedTasks(): Promise<AutomatedTask[]> {
  return loadTasksData();
}

export async function updateTaskStatus(id: string, status: TaskStatus): Promise<AutomatedTask | null> {
  const tasks = loadTasksData();
  const index = tasks.findIndex((t) => t.id === id);
  if (index === -1) {
    return null;
  }
  tasks[index] = {
    ...tasks[index],
    status,
    updatedAt: new Date().toISOString(),
  };
  saveTasksData(tasks);
  return tasks[index];
}

export async function runCompetitiveBenchmark(): Promise<{
  newTasksCount: number;
  processedFeeds: string[];
  tasks: AutomatedTask[];
}> {
  const existingTasks = loadTasksData();
  const processedFeeds: string[] = [];
  let newTasksCount = 0;

  for (const feedConfig of COMPETITOR_FEEDS) {
    try {
      const feed = await parser.parseURL(feedConfig.url);
      processedFeeds.push(feedConfig.name);

      const items = feed.items || [];
      for (const item of items.slice(0, 5)) {
        if (!item.title || !item.link) continue;

        const exists = existingTasks.some(
          (task) => task.sourceUrl === item.link || task.title.toLowerCase().includes(item.title!.toLowerCase())
        );

        if (!exists) {
          const newTask: AutomatedTask = {
            id: crypto.randomUUID(),
            title: `Review: ${item.title.trim()}`,
            description: item.contentSnippet
              ? item.contentSnippet.slice(0, 200).trim() + '...'
              : `New competitor article identified from ${feedConfig.name}. Review for content gap analysis.`,
            sourceUrl: item.link,
            competitor: feedConfig.name,
            status: 'pending',
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
          };

          existingTasks.unshift(newTask);
          newTasksCount++;
        }
      }
    } catch (error: unknown) {
      console.warn(`Failed to fetch or parse feed from ${feedConfig.name} (${feedConfig.url}):`, error);
    }
  }

  if (newTasksCount > 0) {
    saveTasksData(existingTasks);
  }

  return {
    newTasksCount,
    processedFeeds,
    tasks: existingTasks,
  };
}
