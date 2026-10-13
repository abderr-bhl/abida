import fs from 'fs';
import path from 'path';
import crypto from 'crypto';
import Parser from 'rss-parser';
import { Task } from '@/types';

const TASKS_FILE_PATH = path.join(process.cwd(), 'data', 'tasks.json');

const FALLBACK_COMPETITOR_ITEMS = [
  {
    title: 'Review: The Best Wireless Noise-Canceling Headphones',
    description: 'Competitive review analysis of top noise-canceling headphones for travel and office work.',
    competitor: 'Wirecutter',
    competitorUrl: 'https://www.nytimes.com/wirecutter/reviews/best-wireless-noise-canceling-headphones/',
  },
  {
    title: 'Review: The 4 Best OLED TVs - Spring 2025',
    description: 'In-depth lab performance tests comparing LG, Sony, and Samsung OLED flagship displays.',
    competitor: 'RTINGS',
    competitorUrl: 'https://www.rtings.com/tv/reviews/best/by-type/oled',
  },
  {
    title: 'Review: The Best Standing Desks for Home Office',
    description: 'Ergonomic evaluation and durability comparison of motorized standing desks.',
    competitor: 'Wirecutter',
    competitorUrl: 'https://www.nytimes.com/wirecutter/reviews/best-standing-desk/',
  },
  {
    title: 'Review: The Best Gaming Mice with Low Latency',
    description: 'Precision and sensor benchmarking for competitive esports gaming mice.',
    competitor: 'RTINGS',
    competitorUrl: 'https://www.rtings.com/mouse/reviews/best/by-usage/gaming',
  },
];

export function getStoredTasks(): Task[] {
  try {
    if (!fs.existsSync(TASKS_FILE_PATH)) {
      return [];
    }
    const data = fs.readFileSync(TASKS_FILE_PATH, 'utf-8');
    return JSON.parse(data) as Task[];
  } catch (error) {
    if (error instanceof Error) {
      const err = error as NodeJS.ErrnoException;
      if (err.code === 'ENOENT') {
        return [];
      }
    }
    console.warn('Error reading tasks file:', error);
    return [];
  }
}

export function saveTasks(tasks: unknown): void {
  try {
    const dir = path.dirname(TASKS_FILE_PATH);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    fs.writeFileSync(TASKS_FILE_PATH, JSON.stringify(tasks, null, 2), 'utf-8');
  } catch (error) {
    if (error instanceof Error) {
      const err = error as NodeJS.ErrnoException;
      if (err.code === 'EROFS') {
        console.warn('Read-only filesystem: unable to persist tasks to disk.');
        return;
      }
    }
    console.error('Error saving tasks:', error);
  }
}

export async function runBenchmark(): Promise<{ newTasksCount: number; tasks: Task[] }> {
  const parser = new Parser({
    timeout: 5000,
    headers: {
      'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
    },
  });

  const existingTasks = getStoredTasks();
  const existingUrls = new Set(existingTasks.map(t => t.competitorUrl));
  const existingTitles = new Set(existingTasks.map(t => t.title.toLowerCase()));

  const newTasks: Task[] = [];

  const feeds = [
    { name: 'Wirecutter', url: 'https://www.nytimes.com/wirecutter/feed/' },
    { name: 'RTINGS', url: 'https://www.rtings.com/rss/reviews.xml' },
  ];

  for (const feedConfig of feeds) {
    try {
      const feed = await parser.parseURL(feedConfig.url);
      if (feed && feed.items) {
        for (const item of feed.items) {
          if (!item.title) continue;

          const rawTitle = item.title.trim();
          const title = rawTitle.toLowerCase().startsWith('review:') ? rawTitle : `Review: ${rawTitle}`;
          const competitorUrl = item.link || item.guid || feedConfig.url;

          if (existingUrls.has(competitorUrl) || existingTitles.has(title.toLowerCase())) {
            continue;
          }

          const newTask: Task = {
            id: crypto.randomUUID(),
            title,
            description: item.contentSnippet || item.summary || `Automated task created from ${feedConfig.name} content gap monitoring.`,
            competitor: feedConfig.name,
            competitorUrl,
            status: 'pending',
            createdAt: new Date().toISOString(),
          };

          newTasks.push(newTask);
          existingUrls.add(competitorUrl);
          existingTitles.add(title.toLowerCase());
        }
      }
    } catch (feedError) {
      console.warn(`Feed parsing error for ${feedConfig.name}:`, feedError);
    }
  }

  // If no new tasks were parsed from RSS feeds (e.g. 404, captcha, network blocks), use fallbacks
  if (newTasks.length === 0 && existingTasks.length === 0) {
    for (const fallback of FALLBACK_COMPETITOR_ITEMS) {
      if (!existingUrls.has(fallback.competitorUrl) && !existingTitles.has(fallback.title.toLowerCase())) {
        const newTask: Task = {
          id: crypto.randomUUID(),
          title: fallback.title,
          description: fallback.description,
          competitor: fallback.competitor,
          competitorUrl: fallback.competitorUrl,
          status: 'pending',
          createdAt: new Date().toISOString(),
        };
        newTasks.push(newTask);
        existingUrls.add(fallback.competitorUrl);
        existingTitles.add(fallback.title.toLowerCase());
      }
    }
  }

  const updatedTasks = [...newTasks, ...existingTasks];
  saveTasks(updatedTasks);

  return {
    newTasksCount: newTasks.length,
    tasks: updatedTasks,
  };
}
