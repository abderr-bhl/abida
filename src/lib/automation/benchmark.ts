import fs from 'fs';
import path from 'path';
import crypto from 'crypto';
import Parser from 'rss-parser';
import { BenchmarkTask, BenchmarkTaskType } from '@/types';

const DATA_DIR = path.join(process.cwd(), 'data');
const TASKS_FILE = path.join(DATA_DIR, 'tasks.json');

const parser = new Parser();

const RSS_FEEDS = [
  { competitor: 'Wirecutter', url: 'https://www.nytimes.com/wirecutter/feed/' },
  { competitor: 'RTINGS', url: 'https://www.rtings.com/rss/reviews.xml' },
];

function ensureDataDir() {
  try {
    if (!fs.existsSync(DATA_DIR)) {
      fs.mkdirSync(DATA_DIR, { recursive: true });
    }
  } catch (err) {
    const error = err as NodeJS.ErrnoException;
    if (error.code === 'EROFS') {
      console.warn('Read-only filesystem: unable to create data directory.');
    } else {
      console.error('Error creating data directory:', err);
    }
  }
}

export function loadTasks(): BenchmarkTask[] {
  try {
    ensureDataDir();
    if (!fs.existsSync(TASKS_FILE)) {
      return [];
    }
    const data = fs.readFileSync(TASKS_FILE, 'utf-8');
    const parsed = JSON.parse(data);
    return Array.isArray(parsed) ? (parsed as BenchmarkTask[]) : [];
  } catch (err) {
    const error = err as NodeJS.ErrnoException;
    if (error.code === 'EROFS') {
      console.warn('Read-only filesystem: returning empty tasks.');
    } else {
      console.error('Error reading tasks file:', err);
    }
    return [];
  }
}

export function saveTasks(tasks: unknown): boolean {
  try {
    ensureDataDir();
    fs.writeFileSync(TASKS_FILE, JSON.stringify(tasks, null, 2), 'utf-8');
    return true;
  } catch (err) {
    const error = err as NodeJS.ErrnoException;
    if (error.code === 'EROFS') {
      console.warn('Read-only filesystem: failed to save tasks.');
    } else {
      console.error('Error writing tasks file:', err);
    }
    return false;
  }
}

function determineTaskType(title: string, link: string): BenchmarkTaskType {
  const lowerTitle = title.toLowerCase();
  const lowerLink = link.toLowerCase();

  if (lowerTitle.includes('vs') || lowerTitle.includes('versus') || lowerLink.includes('vs')) {
    return 'comparison';
  }
  if (lowerTitle.includes('review') || lowerLink.includes('review')) {
    return 'review';
  }
  if (lowerTitle.includes('news') || lowerTitle.includes('deal') || lowerTitle.includes('announced')) {
    return 'news';
  }
  return 'guide';
}

function generateTaskDescription(itemTitle: string, type: BenchmarkTaskType, competitor: string): string {
  switch (type) {
    case 'guide':
      return `Review: ${itemTitle}. Competitor ${competitor} published a new buying guide. Analyze structure and product picks to update our US guide catalog.`;
    case 'review':
      return `Review: ${itemTitle}. ${competitor} published a detailed product review. Assess rating, specs, pros/cons for our review benchmark.`;
    case 'comparison':
      return `Review: ${itemTitle}. Competitor comparison identified. Build or update comparison matrix based on ${competitor}'s evaluation criteria.`;
    case 'news':
      return `Review: ${itemTitle}. Relevant industry news from ${competitor}. Evaluate impact for news feed.`;
  }
}

export async function runBenchmark(): Promise<{ added: number; total: number }> {
  const existingTasks = loadTasks();
  const existingLinks = new Set(existingTasks.map((t) => t.link));
  const newTasks: BenchmarkTask[] = [];

  for (const feed of RSS_FEEDS) {
    try {
      const parsedFeed = await parser.parseURL(feed.url);
      for (const item of parsedFeed.items || []) {
        if (!item.link || existingLinks.has(item.link)) continue;

        const title = item.title || 'Untitled Article';
        const type = determineTaskType(title, item.link);
        const description = generateTaskDescription(title, type, feed.competitor);

        const newTask: BenchmarkTask = {
          id: crypto.randomUUID(),
          competitor: feed.competitor,
          title: `Review: ${title}`,
          link: item.link,
          pubDate: item.pubDate || new Date().toISOString(),
          status: 'pending',
          type,
          createdAt: new Date().toISOString(),
          description,
        };

        newTasks.push(newTask);
        existingLinks.add(item.link);
      }
    } catch (err) {
      console.warn(`Failed to fetch RSS feed from ${feed.competitor} (${feed.url}):`, err);
    }
  }

  const updatedTasks = [...newTasks, ...existingTasks];
  saveTasks(updatedTasks);

  return {
    added: newTasks.length,
    total: updatedTasks.length,
  };
}
