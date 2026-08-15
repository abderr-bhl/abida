import Parser from 'rss-parser';
import fs from 'fs';
import path from 'path';
import crypto from 'crypto';
import { guides, newsPosts, reviews, comparisons } from '@/lib/mockData';

export interface TaskItem {
  id: string;
  title: string;
  description: string;
  competitor: string;
  sourceUrl: string;
  category: string;
  status: 'PENDING' | 'IN_PROGRESS' | 'COMPLETED';
  createdAt: string;
  updatedAt: string;
}

const COMPETITOR_FEEDS = [
  { name: 'Wirecutter', url: 'https://www.nytimes.com/wirecutter/feed/' },
  { name: 'RTINGS', url: 'https://www.rtings.com/rss/reviews.xml' }
];

const DATA_DIR = path.join(process.cwd(), 'data');
const TASKS_FILE = path.join(DATA_DIR, 'tasks.json');

export function getTasks(): TaskItem[] {
  try {
    if (!fs.existsSync(TASKS_FILE)) {
      return [];
    }
    const content = fs.readFileSync(TASKS_FILE, 'utf-8');
    return JSON.parse(content) as TaskItem[];
  } catch (err: unknown) {
    const error = err as NodeJS.ErrnoException;
    if (error.code === 'EROFS') {
      console.warn('Read-only filesystem: unable to read tasks file');
    }
    return [];
  }
}

export function saveData(tasks: TaskItem[]): boolean {
  try {
    if (!fs.existsSync(DATA_DIR)) {
      fs.mkdirSync(DATA_DIR, { recursive: true });
    }
    fs.writeFileSync(TASKS_FILE, JSON.stringify(tasks, null, 2), 'utf-8');
    return true;
  } catch (err: unknown) {
    const error = err as NodeJS.ErrnoException;
    if (error.code === 'EROFS') {
      console.warn('Read-only filesystem: unable to write tasks file');
    }
    return false;
  }
}

export async function runCompetitorBenchmark(): Promise<{ added: number; total: number; errors: string[] }> {
  const parser = new Parser();
  const existingTasks = getTasks();
  let addedCount = 0;
  const errors: string[] = [];

  const existingTitles = new Set([
    ...guides.map(g => g.title.toLowerCase()),
    ...newsPosts.map(n => n.title.toLowerCase()),
    ...reviews.map(r => r.title.toLowerCase()),
    ...comparisons.map(c => c.title.toLowerCase()),
    ...existingTasks.map(t => t.title.toLowerCase())
  ]);

  for (const feedConfig of COMPETITOR_FEEDS) {
    try {
      const feed = await parser.parseURL(feedConfig.url);
      for (const item of feed.items || []) {
        if (!item.title || !item.link) continue;

        const titleLower = item.title.toLowerCase();
        const hasExistingMatch = Array.from(existingTitles).some(t =>
          t.includes(titleLower) || titleLower.includes(t)
        );

        if (!hasExistingMatch) {
          const newTask: TaskItem = {
            id: crypto.randomUUID(),
            title: `Review: ${item.title}`,
            description: `Automated gap detected from ${feedConfig.name}. Analyze and cover this topic for the US market: ${item.snippet || item.contentSnippet || item.title}`,
            competitor: feedConfig.name,
            sourceUrl: item.link,
            category: item.categories && item.categories[0] ? item.categories[0] : 'General',
            status: 'PENDING',
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
          };

          existingTasks.unshift(newTask);
          existingTitles.add(titleLower);
          addedCount++;
        }
      }
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : String(err);
      errors.push(`Failed to fetch ${feedConfig.name}: ${errorMessage}`);
    }
  }

  if (addedCount > 0) {
    saveData(existingTasks);
  }

  return { added: addedCount, total: existingTasks.length, errors };
}
