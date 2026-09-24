import Parser from 'rss-parser';
import fs from 'fs';
import path from 'path';
import { randomUUID } from 'crypto';

export interface Task {
  id: string;
  title: string;
  description: string;
  source: string;
  sourceUrl?: string;
  status: 'pending' | 'in_progress' | 'completed';
  createdAt: string;
}

const DATA_DIR = path.join(process.cwd(), 'data');
const TASKS_FILE = path.join(DATA_DIR, 'tasks.json');

const FEEDS = [
  {
    name: 'Wirecutter',
    url: 'https://www.nytimes.com/wirecutter/feed/',
    fallbacks: [
      {
        title: 'The Best Wireless Noise-Canceling Headphones',
        link: 'https://www.nytimes.com/wirecutter/reviews/best-wireless-headphones/',
        summary: 'In-depth evaluation of top noise-canceling headphones for travel and work.',
      },
      {
        title: 'The Best Robot Vacuums for Hardwood and Carpet',
        link: 'https://www.nytimes.com/wirecutter/reviews/best-robot-vacuum/',
        summary: 'Hands-on testing of automated vacuums across various floor surfaces.',
      },
      {
        title: 'The Best 4K TVs for Every Budget',
        link: 'https://www.nytimes.com/wirecutter/reviews/best-4k-tv/',
        summary: 'Comparing OLED, QLED, and LED models for color accuracy and HDR performance.',
      },
    ],
  },
  {
    name: 'RTINGS',
    url: 'https://www.rtings.com/rss/reviews.xml',
    fallbacks: [
      {
        title: 'Samsung S90C OLED TV Review and Lab Benchmark',
        link: 'https://www.rtings.com/tv/reviews/samsung/s90c-oled',
        summary: 'Quantitative contrast, motion clarity, and response time measurements.',
      },
      {
        title: 'LG C3 OLED TV Performance Review',
        link: 'https://www.rtings.com/tv/reviews/lg/c3-oled',
        summary: 'Extensive lab testing covering input lag, brightness, and viewing angles.',
      },
      {
        title: 'Sony WH-1000XM5 Headphones Review',
        link: 'https://www.rtings.com/headphones/reviews/sony/wh-1000xm5-wireless',
        summary: 'Frequency response consistency, active noise isolation, and microphone score.',
      },
    ],
  },
];

export function loadTasks(): Task[] {
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
  } catch (err) {
    if (err instanceof Error && (err as NodeJS.ErrnoException).code === 'ENOENT') {
      return [];
    }
    console.error('Error reading tasks file:', err);
    return [];
  }
}

export function saveTasks(tasks: Task[]): void {
  try {
    if (!fs.existsSync(DATA_DIR)) {
      fs.mkdirSync(DATA_DIR, { recursive: true });
    }
    fs.writeFileSync(TASKS_FILE, JSON.stringify(tasks, null, 2), 'utf-8');
  } catch (err) {
    if (err instanceof Error && (err as NodeJS.ErrnoException).code === 'EROFS') {
      console.warn('FileSystem is read-only (EROFS). Task persistence skipped.');
    } else {
      console.error('Failed to save tasks:', err);
    }
  }
}

export async function runBenchmark(): Promise<{ addedTasksCount: number; totalTasksCount: number }> {
  const existingTasks = loadTasks();
  const existingTitles = new Set(existingTasks.map((t) => t.title.toLowerCase()));

  const parser = new Parser({
    timeout: 5000,
    headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)' },
  });

  const newTasks: Task[] = [];

  for (const feedConfig of FEEDS) {
    let itemsParsed = 0;
    try {
      const feed = await parser.parseURL(feedConfig.url);
      if (feed && feed.items && feed.items.length > 0) {
        for (const item of feed.items) {
          if (!item.title) continue;
          const articleTitle = item.title.trim();
          const taskTitle = `Review: ${articleTitle}`;

          if (!existingTitles.has(taskTitle.toLowerCase())) {
            existingTitles.add(taskTitle.toLowerCase());
            const newTask: Task = {
              id: randomUUID(),
              title: taskTitle,
              description:
                item.contentSnippet ||
                item.summary ||
                `Analyze competitor coverage for "${articleTitle}" and create an optimized US buyer guide.`,
              source: feedConfig.name,
              sourceUrl: item.link || '',
              status: 'pending',
              createdAt: new Date().toISOString(),
            };
            newTasks.push(newTask);
            itemsParsed++;
          }
        }
      }
    } catch (err) {
      console.warn(
        `Could not fetch RSS feed for ${feedConfig.name} (${feedConfig.url}):`,
        err instanceof Error ? err.message : err
      );
    }

    if (itemsParsed === 0 && feedConfig.fallbacks) {
      for (const fallback of feedConfig.fallbacks) {
        const taskTitle = `Review: ${fallback.title}`;
        if (!existingTitles.has(taskTitle.toLowerCase())) {
          existingTitles.add(taskTitle.toLowerCase());
          const newTask: Task = {
            id: randomUUID(),
            title: taskTitle,
            description: fallback.summary,
            source: feedConfig.name,
            sourceUrl: fallback.link,
            status: 'pending',
            createdAt: new Date().toISOString(),
          };
          newTasks.push(newTask);
        }
      }
    }
  }

  const updatedTasks = [...newTasks, ...existingTasks];
  saveTasks(updatedTasks);

  return {
    addedTasksCount: newTasks.length,
    totalTasksCount: updatedTasks.length,
  };
}
