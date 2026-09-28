import crypto from 'crypto';
import fs from 'fs';
import path from 'path';
import Parser from 'rss-parser';

export interface Task {
  id: string;
  title: string;
  description: string;
  sourceUrl: string;
  competitor: string;
  status: 'pending' | 'in_progress' | 'completed';
  createdAt: string;
}

const DATA_DIR = path.join(process.cwd(), 'data');
const TASKS_FILE = path.join(DATA_DIR, 'tasks.json');

// Fallback topics when competitor RSS feeds are unreachable or blocked
const FALLBACK_TOPICS = [
  {
    title: 'The Best Wireless Noise-Canceling Headphones',
    description: 'Competitive review analysis based on Wirecutter recommendation guidelines for noise-canceling headphones.',
    sourceUrl: 'https://www.nytimes.com/wirecutter/reviews/best-wireless-noise-canceling-headphones/',
    competitor: 'Wirecutter',
  },
  {
    title: 'The Best OLED TVs of 2025',
    description: 'Competitive benchmarking report analyzing recent display tests and ratings from RTINGS.',
    sourceUrl: 'https://www.rtings.com/tv/reviews/best/by-type/oled',
    competitor: 'RTINGS',
  },
  {
    title: 'The Best Ergonomic Office Chairs',
    description: 'Competitive content review analyzing ergonomic testing methodology and top selections from Wirecutter.',
    sourceUrl: 'https://www.nytimes.com/wirecutter/reviews/best-office-chair/',
    competitor: 'Wirecutter',
  },
  {
    title: 'The Best Robot Vacuums',
    description: 'Benchmarking task based on competitor vacuum navigation and suction performance benchmarks.',
    sourceUrl: 'https://www.nytimes.com/wirecutter/reviews/best-robot-vacuum/',
    competitor: 'Wirecutter',
  },
];

export function getTasks(): Task[] {
  try {
    if (!fs.existsSync(TASKS_FILE)) {
      return [];
    }
    const fileContent = fs.readFileSync(TASKS_FILE, 'utf-8');
    const parsed: unknown = JSON.parse(fileContent);
    if (Array.isArray(parsed)) {
      return parsed as Task[];
    }
    return [];
  } catch (err) {
    console.error('Failed to read tasks file:', err);
    return [];
  }
}

export function saveTasks(tasks: Task[]): boolean {
  try {
    if (!fs.existsSync(DATA_DIR)) {
      fs.mkdirSync(DATA_DIR, { recursive: true });
    }
    const dataToSave: unknown = tasks;
    fs.writeFileSync(TASKS_FILE, JSON.stringify(dataToSave, null, 2), 'utf-8');
    return true;
  } catch (err) {
    if (err instanceof Error) {
      const errnoErr = err as NodeJS.ErrnoException;
      if (errnoErr.code === 'EROFS') {
        console.warn('Read-only filesystem detected (EROFS). Skipping local task persistence.');
        return false;
      }
    }
    console.error('Failed to save tasks file:', err);
    return false;
  }
}

export async function runBenchmark(): Promise<{ addedTasksCount: number; tasks: Task[] }> {
  const existingTasks = getTasks();
  const existingTitles = new Set(existingTasks.map(t => t.title.toLowerCase()));
  const newTasks: Task[] = [];

  const parser = new Parser({
    timeout: 5000,
    headers: {
      'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
    },
  });

  const feeds = [
    { name: 'Wirecutter', url: 'https://www.nytimes.com/wirecutter/feed/' },
    { name: 'RTINGS', url: 'https://www.rtings.com/rss/reviews.xml' },
  ];

  for (const feedConfig of feeds) {
    try {
      const feed = await parser.parseURL(feedConfig.url);
      if (feed.items && feed.items.length > 0) {
        for (const item of feed.items.slice(0, 5)) {
          if (!item.title) continue;

          const title = item.title.toLowerCase().startsWith('review:')
            ? item.title
            : `Review: ${item.title}`;

          if (!existingTitles.has(title.toLowerCase())) {
            const newTask: Task = {
              id: crypto.randomUUID(),
              title,
              description: item.contentSnippet || item.summary || `Automated benchmark task derived from ${feedConfig.name} article: "${item.title}".`,
              sourceUrl: item.link || feedConfig.url,
              competitor: feedConfig.name,
              status: 'pending',
              createdAt: new Date().toISOString(),
            };
            newTasks.push(newTask);
            existingTitles.add(title.toLowerCase());
          }
        }
      }
    } catch (err) {
      console.warn(`Failed to fetch RSS feed for ${feedConfig.name}, utilizing fallbacks:`, err instanceof Error ? err.message : err);
    }
  }

  // If no new tasks were added from live feeds, generate from fallback topics
  if (newTasks.length === 0) {
    for (const fallback of FALLBACK_TOPICS) {
      const title = fallback.title.toLowerCase().startsWith('review:')
        ? fallback.title
        : `Review: ${fallback.title}`;

      if (!existingTitles.has(title.toLowerCase())) {
        const newTask: Task = {
          id: crypto.randomUUID(),
          title,
          description: fallback.description,
          sourceUrl: fallback.sourceUrl,
          competitor: fallback.competitor,
          status: 'pending',
          createdAt: new Date().toISOString(),
        };
        newTasks.push(newTask);
        existingTitles.add(title.toLowerCase());
      }
    }
  }

  const updatedTasks = [...newTasks, ...existingTasks];
  saveTasks(updatedTasks);

  return {
    addedTasksCount: newTasks.length,
    tasks: updatedTasks,
  };
}
