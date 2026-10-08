import Parser from 'rss-parser';
import crypto from 'crypto';
import fs from 'fs';
import path from 'path';
import { Task } from '@/types';

const TASKS_FILE_PATH = path.join(process.cwd(), 'data', 'tasks.json');

const parser = new Parser({
  timeout: 5000,
  headers: {
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
  }
});

const COMPETITOR_FEEDS = [
  {
    name: 'Wirecutter',
    url: 'https://www.nytimes.com/wirecutter/feed/',
    fallbacks: [
      { title: 'The Best Air Purifiers of 2025', url: 'https://www.nytimes.com/wirecutter/reviews/best-air-purifier/' },
      { title: 'The Best Cordless Vacuum Cleaners', url: 'https://www.nytimes.com/wirecutter/reviews/best-cordless-vacuum/' },
      { title: 'The Best Ergonomic Office Chairs', url: 'https://www.nytimes.com/wirecutter/reviews/best-office-chair/' }
    ]
  },
  {
    name: 'RTINGS',
    url: 'https://www.rtings.com/rss/reviews.xml',
    fallbacks: [
      { title: 'The 5 Best Smart TVs for Bright Rooms', url: 'https://www.rtings.com/tv/reviews/best/by-feature/bright-rooms' },
      { title: 'The 5 Best Gaming Monitors', url: 'https://www.rtings.com/monitor/reviews/best/by-usage/gaming' },
      { title: 'The 5 Best Wireless Earbuds for Running', url: 'https://www.rtings.com/headphones/reviews/best/by-feature/running' }
    ]
  }
];

export function loadTasks(): Task[] {
  try {
    if (!fs.existsSync(TASKS_FILE_PATH)) {
      return [];
    }
    const data = fs.readFileSync(TASKS_FILE_PATH, 'utf-8');
    return JSON.parse(data) as Task[];
  } catch (err) {
    if (err instanceof Error && (err as NodeJS.ErrnoException).code === 'EROFS') {
      console.warn('Read-only filesystem: unable to read tasks from data/tasks.json');
      return [];
    }
    console.error('Error loading tasks:', err);
    return [];
  }
}

export function saveData(data: unknown): void {
  try {
    const dirPath = path.dirname(TASKS_FILE_PATH);
    if (!fs.existsSync(dirPath)) {
      fs.mkdirSync(dirPath, { recursive: true });
    }
    fs.writeFileSync(TASKS_FILE_PATH, JSON.stringify(data, null, 2), 'utf-8');
  } catch (err) {
    if (err instanceof Error && (err as NodeJS.ErrnoException).code === 'EROFS') {
      console.warn('Read-only filesystem: unable to save data to data/tasks.json');
    } else {
      throw err;
    }
  }
}

export async function runBenchmark(): Promise<{ added: number; total: number; newTasks: Task[] }> {
  const existingTasks = loadTasks();
  const existingUrls = new Set(existingTasks.map(t => t.sourceUrl));
  const existingTitles = new Set(existingTasks.map(t => t.title.toLowerCase()));

  const newTasks: Task[] = [];

  for (const feedConfig of COMPETITOR_FEEDS) {
    let feedItems: Array<{ title: string; link: string; summary?: string }> = [];

    try {
      const feed = await parser.parseURL(feedConfig.url);
      if (feed && feed.items && feed.items.length > 0) {
        feedItems = feed.items
          .filter(item => item.title && item.link)
          .map(item => ({
            title: item.title!.trim(),
            link: item.link!.trim(),
            summary: item.contentSnippet || item.content || undefined
          }));
      }
    } catch (err) {
      console.warn(`Failed to fetch RSS feed for ${feedConfig.name}, using fallbacks:`, err);
    }

    if (feedItems.length === 0) {
      feedItems = feedConfig.fallbacks.map(f => ({
        title: f.title,
        link: f.url,
        summary: `Benchmark review identified from ${feedConfig.name}`
      }));
    }

    for (const item of feedItems) {
      const taskTitle = item.title.startsWith('Review:') || item.title.startsWith('Guide:')
        ? item.title
        : `Review: ${item.title}`;

      if (existingUrls.has(item.link) || existingTitles.has(taskTitle.toLowerCase())) {
        continue;
      }

      const newTask: Task = {
        id: crypto.randomUUID(),
        title: taskTitle,
        description: item.summary || `Automated competitive benchmark task created from ${feedConfig.name} article.`,
        competitor: feedConfig.name,
        sourceUrl: item.link,
        status: 'pending',
        createdAt: new Date().toISOString(),
        category: feedConfig.name === 'RTINGS' ? 'Electronics & Display' : 'Home & Tech'
      };

      newTasks.push(newTask);
      existingUrls.add(newTask.sourceUrl);
      existingTitles.add(newTask.title.toLowerCase());
    }
  }

  const updatedTasks = [...newTasks, ...existingTasks];
  if (newTasks.length > 0) {
    saveData(updatedTasks);
  }

  return {
    added: newTasks.length,
    total: updatedTasks.length,
    newTasks
  };
}
