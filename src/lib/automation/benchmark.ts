import Parser from 'rss-parser';
import fs from 'fs';
import path from 'path';
import crypto from 'crypto';
import { Task, TaskStatus, BenchmarkResult } from '@/types';

const TASKS_FILE_PATH = path.join(process.cwd(), 'data', 'tasks.json');

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

const FALLBACK_COMPETITOR_TOPICS = [
  {
    title: 'The Best Wireless Earbuds for Working Out',
    link: 'https://www.nytimes.com/wirecutter/reviews/best-wireless-exercise-headphones/',
    category: 'Audio',
  },
  {
    title: 'The Best OLED TVs of 2025',
    link: 'https://www.rtings.com/tv/reviews/best/by-type/oled',
    category: 'Electronics',
  },
  {
    title: 'The Best Robot Vacuums for Pet Hair',
    link: 'https://www.nytimes.com/wirecutter/reviews/best-robot-vacuum/',
    category: 'Home',
  },
  {
    title: 'The Best Air Purifiers',
    link: 'https://www.nytimes.com/wirecutter/reviews/best-air-purifier/',
    category: 'Home Appliances',
  },
  {
    title: 'The Best Gaming Monitors for PS5 & Xbox Series X',
    link: 'https://www.rtings.com/monitor/reviews/best/ps5',
    category: 'Gaming',
  },
];

export async function getTasks(): Promise<Task[]> {
  try {
    if (!fs.existsSync(TASKS_FILE_PATH)) {
      return [];
    }
    const data = fs.readFileSync(TASKS_FILE_PATH, 'utf-8');
    const tasks = JSON.parse(data);
    return Array.isArray(tasks) ? (tasks as Task[]) : [];
  } catch (err: unknown) {
    if (err instanceof Error) {
      const errnoErr = err as NodeJS.ErrnoException;
      if (errnoErr.code === 'ENOENT') {
        return [];
      }
    }
    console.warn('Error reading tasks file:', err);
    return [];
  }
}

async function saveTasks(tasks: Task[]): Promise<boolean> {
  try {
    const dir = path.dirname(TASKS_FILE_PATH);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    const serializedData: unknown = JSON.stringify(tasks, null, 2);
    fs.writeFileSync(TASKS_FILE_PATH, serializedData as string, 'utf-8');
    return true;
  } catch (err: unknown) {
    if (err instanceof Error) {
      const errnoErr = err as NodeJS.ErrnoException;
      if (errnoErr.code === 'EROFS') {
        console.warn('Warning: Read-only filesystem encountered (EROFS). Unable to persist tasks to disk.');
        return false;
      }
    }
    console.error('Failed to save tasks:', err);
    return false;
  }
}

export async function updateTask(id: string, status: TaskStatus): Promise<Task | null> {
  const tasks = await getTasks();
  const taskIndex = tasks.findIndex((t) => t.id === id);
  if (taskIndex === -1) {
    return null;
  }

  tasks[taskIndex] = {
    ...tasks[taskIndex],
    status,
    updatedAt: new Date().toISOString(),
  };

  await saveTasks(tasks);
  return tasks[taskIndex];
}

export async function runBenchmark(): Promise<BenchmarkResult> {
  const parser = new Parser({
    timeout: 5000,
    headers: {
      'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
    },
  });

  const existingTasks = await getTasks();
  const newTasks: Task[] = [];

  for (const feedConfig of COMPETITOR_FEEDS) {
    let feedItems: { title?: string; link?: string; category?: string }[] = [];
    try {
      const feed = await parser.parseURL(feedConfig.url);
      feedItems = feed.items || [];
    } catch (feedError) {
      console.warn(`Could not fetch RSS feed for ${feedConfig.name}, using fallbacks:`, feedError);
      feedItems = FALLBACK_COMPETITOR_TOPICS;
    }

    if (feedItems.length === 0) {
      feedItems = FALLBACK_COMPETITOR_TOPICS;
    }

    for (const item of feedItems.slice(0, 3)) {
      if (!item.title) continue;

      const titleClean = item.title.trim();
      const taskTitle = titleClean.startsWith('Review:') ? titleClean : `Review: ${titleClean}`;

      const exists = existingTasks.some(
        (t) => t.title.toLowerCase() === taskTitle.toLowerCase() || (item.link && t.competitorUrl === item.link)
      );

      if (!exists) {
        const newTask: Task = {
          id: crypto.randomUUID(),
          title: taskTitle,
          description: `Analyze competitor article "${titleClean}" and create a superior US market guide / review for reviewguid.com addressing content gaps.`,
          category: item.category || 'Buyer Guide',
          competitorUrl: item.link,
          status: 'pending',
          priority: 'high',
          createdAt: new Date().toISOString(),
        };
        newTasks.push(newTask);
      }
    }
  }

  // If no new tasks created from RSS, ensure at least one benchmark task exists or fallback task is generated if missing
  if (newTasks.length === 0 && existingTasks.length === 0) {
    for (const fallback of FALLBACK_COMPETITOR_TOPICS.slice(0, 3)) {
      const taskTitle = `Review: ${fallback.title}`;
      newTasks.push({
        id: crypto.randomUUID(),
        title: taskTitle,
        description: `Analyze competitor article "${fallback.title}" and create a superior US market guide / review for reviewguid.com addressing content gaps.`,
        category: fallback.category,
        competitorUrl: fallback.link,
        status: 'pending',
        priority: 'high',
        createdAt: new Date().toISOString(),
      });
    }
  }

  const updatedTasksList = [...newTasks, ...existingTasks];
  await saveTasks(updatedTasksList);

  return {
    success: true,
    message: `Benchmarking complete. Created ${newTasks.length} new automated task(s).`,
    newTasksCount: newTasks.length,
    tasks: updatedTasksList,
    timestamp: new Date().toISOString(),
  };
}
