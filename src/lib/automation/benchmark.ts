import Parser from 'rss-parser';
import crypto from 'crypto';
import fs from 'fs';
import path from 'path';

export interface Task {
  id: string;
  title: string;
  description: string;
  source: string;
  sourceUrl: string;
  status: 'pending' | 'in-progress' | 'completed';
  createdAt: string;
}

const DATA_DIR = path.join(process.cwd(), 'data');
const TASKS_FILE = path.join(DATA_DIR, 'tasks.json');

const parser = new Parser({
  timeout: 5000,
  headers: {
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) ReviewGuidBot/1.0',
  },
});

const RSS_FEEDS = [
  {
    name: 'Wirecutter',
    url: 'https://www.nytimes.com/wirecutter/feed/',
  },
  {
    name: 'RTINGS',
    url: 'https://www.rtings.com/rss/reviews.xml',
  },
];

export function getTasks(): Task[] {
  try {
    if (!fs.existsSync(TASKS_FILE)) {
      return [];
    }
    const content = fs.readFileSync(TASKS_FILE, 'utf-8');
    return JSON.parse(content) as Task[];
  } catch (error) {
    if (error instanceof Error && (error as NodeJS.ErrnoException).code === 'EROFS') {
      console.warn('Read-only filesystem: unable to read tasks file');
    }
    return [];
  }
}

function saveTasks(data: unknown): void {
  try {
    if (!fs.existsSync(DATA_DIR)) {
      fs.mkdirSync(DATA_DIR, { recursive: true });
    }
    fs.writeFileSync(TASKS_FILE, JSON.stringify(data, null, 2), 'utf-8');
  } catch (error) {
    if (error instanceof Error && (error as NodeJS.ErrnoException).code === 'EROFS') {
      console.warn('Read-only filesystem: unable to write tasks to data/tasks.json');
    } else {
      console.error('Error saving tasks:', error);
    }
  }
}

export async function runBenchmark(): Promise<Task[]> {
  const existingTasks = getTasks();
  const existingUrls = new Set(existingTasks.map(t => t.sourceUrl));
  const newTasks: Task[] = [];

  for (const feedConfig of RSS_FEEDS) {
    try {
      const feed = await parser.parseURL(feedConfig.url);
      const items = feed.items || [];

      for (const item of items.slice(0, 5)) {
        const link = item.link || item.guid || '';
        if (!link || existingUrls.has(link)) {
          continue;
        }

        const cleanTitle = item.title ? item.title.trim() : 'New Article';
        const taskTitle = cleanTitle.toLowerCase().includes('review')
          ? `Review: ${cleanTitle}`
          : `Buyer Guide: ${cleanTitle}`;

        const newTask: Task = {
          id: crypto.randomUUID(),
          title: taskTitle,
          description: `Competitive analysis task for US market based on ${feedConfig.name} article: "${cleanTitle}".`,
          source: feedConfig.name,
          sourceUrl: link,
          status: 'pending',
          createdAt: new Date().toISOString(),
        };

        newTasks.push(newTask);
        existingUrls.add(link);
      }
    } catch (error) {
      console.warn(`Could not fetch RSS feed for ${feedConfig.name} (${feedConfig.url}):`, error instanceof Error ? error.message : error);
    }
  }

  // If no new tasks found from live RSS (e.g., offline or network error), ensure we have mock baseline tasks if empty
  let updatedTasks = [...newTasks, ...existingTasks];

  if (updatedTasks.length === 0) {
    updatedTasks = [
      {
        id: crypto.randomUUID(),
        title: 'Review: Best Air Purifiers for Allergies 2024',
        description: 'Competitive analysis task for US market based on Wirecutter article.',
        source: 'Wirecutter',
        sourceUrl: 'https://www.nytimes.com/wirecutter/reviews/best-air-purifier/',
        status: 'pending',
        createdAt: new Date().toISOString(),
      },
      {
        id: crypto.randomUUID(),
        title: 'Buyer Guide: Best Wireless Noise-Canceling Headphones',
        description: 'Competitive analysis task for US market based on RTINGS review.',
        source: 'RTINGS',
        sourceUrl: 'https://www.rtings.com/headphones/reviews/best/wireless-noise-cancelling-headphones',
        status: 'in-progress',
        createdAt: new Date().toISOString(),
      },
    ];
  }

  saveTasks(updatedTasks);
  return updatedTasks;
}

export function updateTaskStatus(id: string, status: 'pending' | 'in-progress' | 'completed'): Task | null {
  const tasks = getTasks();
  const taskIndex = tasks.findIndex(t => t.id === id);

  if (taskIndex === -1) {
    return null;
  }

  tasks[taskIndex].status = status;
  saveTasks(tasks);
  return tasks[taskIndex];
}
