import Parser from 'rss-parser';
import * as fs from 'fs';
import * as path from 'path';
import crypto from 'crypto';

export interface Task {
  id: string;
  title: string;
  description: string;
  competitorUrl: string;
  source: 'Wirecutter' | 'RTINGS' | 'Fallback';
  status: 'pending' | 'in_progress' | 'completed' | 'cancelled';
  createdAt: string;
}

const parser = new Parser();
const DATA_DIR = path.join(process.cwd(), 'data');
const TASKS_FILE = path.join(DATA_DIR, 'tasks.json');

const FALLBACK_TOPICS = [
  {
    title: 'Review: Best Noise-Canceling Headphones of 2025',
    description: 'Competitive analysis of flagship active noise-canceling wireless headphones for US buyers.',
    competitorUrl: 'https://www.nytimes.com/wirecutter/reviews/best-noise-cancelling-headphones/',
    source: 'Fallback' as const,
  },
  {
    title: 'Review: Top 4K OLED TVs for Gaming',
    description: 'Comprehensive review and latency comparison for premium OLED gaming displays.',
    competitorUrl: 'https://www.rtings.com/tv/reviews/best/by-usage/hdr-gaming',
    source: 'Fallback' as const,
  },
  {
    title: 'Review: Best Ergonomic Office Chairs',
    description: 'In-depth ergonomic comparison and durability evaluations for home office setups.',
    competitorUrl: 'https://www.nytimes.com/wirecutter/reviews/best-office-chair/',
    source: 'Fallback' as const,
  },
];

export async function loadTasks(): Promise<Task[]> {
  try {
    if (!fs.existsSync(TASKS_FILE)) {
      return [];
    }
    const data = fs.readFileSync(TASKS_FILE, 'utf-8');
    return JSON.parse(data) as Task[];
  } catch (error) {
    console.warn('Unable to read tasks file:', error);
    return [];
  }
}

export async function saveTasks(tasks: Task[]): Promise<void> {
  try {
    if (!fs.existsSync(DATA_DIR)) {
      fs.mkdirSync(DATA_DIR, { recursive: true });
    }
    fs.writeFileSync(TASKS_FILE, JSON.stringify(tasks, null, 2), 'utf-8');
  } catch (error: unknown) {
    if (error instanceof Error && (error as NodeJS.ErrnoException).code === 'EROFS') {
      console.warn('Read-only filesystem detected (EROFS). Skipping file write.');
    } else {
      console.error('Failed to save tasks:', error);
    }
  }
}

export async function runCompetitiveBenchmark(): Promise<{ addedCount: number; tasks: Task[] }> {
  const existingTasks = await loadTasks();
  const existingUrls = new Set(existingTasks.map(t => t.competitorUrl));
  const newTasks: Task[] = [];

  const feeds = [
    { name: 'Wirecutter', url: 'https://www.nytimes.com/wirecutter/feed/' },
    { name: 'RTINGS', url: 'https://www.rtings.com/rss/reviews.xml' },
  ];

  for (const feedConfig of feeds) {
    try {
      const feed = await parser.parseURL(feedConfig.url);
      for (const item of feed.items) {
        if (!item.link || existingUrls.has(item.link)) continue;

        const rawTitle = item.title || 'Untitled Article';
        const taskTitle = rawTitle.startsWith('Review:') ? rawTitle : `Review: ${rawTitle}`;
        const taskDescription = item.contentSnippet || item.summary || `Automated task generated from competitor article: ${rawTitle}`;

        const newTask: Task = {
          id: crypto.randomUUID(),
          title: taskTitle,
          description: taskDescription.substring(0, 300),
          competitorUrl: item.link,
          source: feedConfig.name as 'Wirecutter' | 'RTINGS',
          status: 'pending',
          createdAt: new Date().toISOString(),
        };

        newTasks.push(newTask);
        existingUrls.add(item.link);
      }
    } catch (feedError) {
      console.warn(`Failed to fetch RSS feed for ${feedConfig.name}:`, feedError);
    }
  }

  // If no new tasks were derived from live RSS feeds (e.g. captcha or 404), add fallbacks if missing
  if (newTasks.length === 0) {
    for (const fallback of FALLBACK_TOPICS) {
      if (!existingUrls.has(fallback.competitorUrl)) {
        const newTask: Task = {
          id: crypto.randomUUID(),
          title: fallback.title,
          description: fallback.description,
          competitorUrl: fallback.competitorUrl,
          source: fallback.source,
          status: 'pending',
          createdAt: new Date().toISOString(),
        };
        newTasks.push(newTask);
        existingUrls.add(fallback.competitorUrl);
      }
    }
  }

  const updatedTasks = [...newTasks, ...existingTasks];
  await saveTasks(updatedTasks);

  return { addedCount: newTasks.length, tasks: updatedTasks };
}
