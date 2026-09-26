import fs from 'fs';
import path from 'path';
import crypto from 'crypto';
import Parser from 'rss-parser';

export type TaskStatus = 'PENDING' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED';

export interface Task {
  id: string;
  title: string;
  description: string;
  competitorUrl: string;
  source: string;
  status: TaskStatus;
  createdAt: string;
}

const DATA_DIR = path.join(process.cwd(), 'data');
const TASKS_FILE = path.join(DATA_DIR, 'tasks.json');

const FALLBACK_TOPICS = [
  {
    title: 'Review: The Best Noise-Canceling Headphones for 2025',
    description: 'Benchmarked from Wirecutter top choices. Analyze market features and update comparison guide.',
    competitorUrl: 'https://www.nytimes.com/wirecutter/reviews/best-noise-canceling-headphones/',
    source: 'Wirecutter (Fallback)',
  },
  {
    title: 'Review: Best OLED TVs for Gaming and Movies',
    description: 'Benchmarked from RTINGS top lab measurements. Produce updated side-by-side performance chart.',
    competitorUrl: 'https://www.rtings.com/tv/reviews/best/by-usage/hdr-gaming',
    source: 'RTINGS (Fallback)',
  },
  {
    title: 'Review: The Best Wireless Ergonomic Keyboards',
    description: 'Benchmarked competitor guide. Compare mechanical switches and battery longevity for remote work.',
    competitorUrl: 'https://www.nytimes.com/wirecutter/reviews/best-ergonomic-keyboard/',
    source: 'Wirecutter (Fallback)',
  },
];

export function getTasks(): Task[] {
  try {
    if (!fs.existsSync(TASKS_FILE)) {
      return [];
    }
    const data = fs.readFileSync(TASKS_FILE, 'utf-8');
    return JSON.parse(data) as Task[];
  } catch (error) {
    console.error('Error reading tasks file:', error);
    return [];
  }
}

export function saveTasks(tasks: unknown): boolean {
  try {
    if (!fs.existsSync(DATA_DIR)) {
      fs.mkdirSync(DATA_DIR, { recursive: true });
    }
    fs.writeFileSync(TASKS_FILE, JSON.stringify(tasks, null, 2), 'utf-8');
    return true;
  } catch (error) {
    if (error instanceof Error) {
      const errnoErr = error as NodeJS.ErrnoException;
      if (errnoErr.code === 'EROFS') {
        console.warn('FileSystem is read-only. Cannot save tasks to disk.');
        return false;
      }
    }
    console.error('Error saving tasks file:', error);
    return false;
  }
}

export async function runBenchmark(): Promise<{ addedCount: number; tasks: Task[] }> {
  const parser = new Parser({
    headers: {
      'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
    },
    timeout: 8000,
  });

  const existingTasks = getTasks();
  const existingUrls = new Set(existingTasks.map((t) => t.competitorUrl));
  const newTasks: Task[] = [];

  const feeds = [
    { url: 'https://www.nytimes.com/wirecutter/feed/', name: 'Wirecutter' },
    { url: 'https://www.rtings.com/rss/reviews.xml', name: 'RTINGS' },
  ];

  for (const feed of feeds) {
    try {
      const parsedFeed = await parser.parseURL(feed.url);
      for (const item of parsedFeed.items || []) {
        const itemUrl = item.link || item.guid;
        if (!itemUrl || existingUrls.has(itemUrl)) continue;

        const title = item.title ? `Review: ${item.title}` : `Review: Competitor Insight from ${feed.name}`;
        const description = item.contentSnippet || item.content || `Automated task created from ${feed.name} competitor benchmarking feed.`;

        const newTask: Task = {
          id: crypto.randomUUID(),
          title,
          description: description.slice(0, 300),
          competitorUrl: itemUrl,
          source: feed.name,
          status: 'PENDING',
          createdAt: new Date().toISOString(),
        };

        newTasks.push(newTask);
        existingUrls.add(itemUrl);
      }
    } catch (feedError) {
      console.warn(`Failed to parse RSS feed for ${feed.name}:`, feedError);
    }
  }

  // If no new tasks were discovered from live RSS, generate fallback tasks to ensure continuous automation benchmarking
  if (newTasks.length === 0) {
    for (const fallback of FALLBACK_TOPICS) {
      if (!existingUrls.has(fallback.competitorUrl)) {
        const newTask: Task = {
          id: crypto.randomUUID(),
          title: fallback.title,
          description: fallback.description,
          competitorUrl: fallback.competitorUrl,
          source: fallback.source,
          status: 'PENDING',
          createdAt: new Date().toISOString(),
        };
        newTasks.push(newTask);
        existingUrls.add(fallback.competitorUrl);
      }
    }
  }

  const updatedTasks = [...newTasks, ...existingTasks];
  saveTasks(updatedTasks);

  return {
    addedCount: newTasks.length,
    tasks: updatedTasks,
  };
}
