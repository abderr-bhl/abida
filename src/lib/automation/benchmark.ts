import fs from 'fs';
import path from 'path';
import crypto from 'crypto';
import Parser from 'rss-parser';
import { Task } from '@/types';

const DATA_FILE = path.join(process.cwd(), 'data', 'tasks.json');

const COMPETITOR_FEEDS = [
  { name: 'Wirecutter', url: 'https://www.nytimes.com/wirecutter/feed/' },
  { name: 'RTINGS', url: 'https://www.rtings.com/rss/reviews.xml' },
];

export async function loadTasks(): Promise<Task[]> {
  try {
    if (!fs.existsSync(DATA_FILE)) {
      return [];
    }
    const rawData = fs.readFileSync(DATA_FILE, 'utf-8');
    const tasks = JSON.parse(rawData);
    return Array.isArray(tasks) ? tasks : [];
  } catch (err: unknown) {
    const error = err as NodeJS.ErrnoException;
    console.error('Error reading tasks file:', error);
    return [];
  }
}

export async function saveTasks(tasks: Task[]): Promise<boolean> {
  try {
    const dirPath = path.dirname(DATA_FILE);
    if (!fs.existsSync(dirPath)) {
      fs.mkdirSync(dirPath, { recursive: true });
    }
    fs.writeFileSync(DATA_FILE, JSON.stringify(tasks, null, 2), 'utf-8');
    return true;
  } catch (err: unknown) {
    const error = err as NodeJS.ErrnoException;
    if (error.code === 'EROFS') {
      console.warn('Read-only filesystem encountered when saving tasks (e.g. Vercel serverless). Tasks stored in memory only.');
    } else {
      console.error('Error writing tasks file:', error);
    }
    return false;
  }
}

export async function runBenchmark(): Promise<{ addedCount: number; tasks: Task[] }> {
  const parser = new Parser({
    timeout: 8000,
    headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)' },
  });

  const existingTasks = await loadTasks();
  const existingUrls = new Set(existingTasks.map((t) => t.sourceUrl));
  const newTasks: Task[] = [];
  const now = new Date().toISOString();

  for (const feedConfig of COMPETITOR_FEEDS) {
    try {
      const feed = await parser.parseURL(feedConfig.url);
      if (feed && feed.items) {
        for (const item of feed.items) {
          if (!item.link || existingUrls.has(item.link)) {
            continue;
          }

          const rawTitle = item.title?.trim() || 'Untitled Article';
          const title = rawTitle.startsWith('Review:') ? rawTitle : `Review: ${rawTitle}`;
          const description =
            item.contentSnippet?.trim() ||
            item.content?.trim() ||
            `New competitor article detected from ${feedConfig.name}: ${rawTitle}`;

          const newTask: Task = {
            id: crypto.randomUUID(),
            title,
            description,
            sourceUrl: item.link,
            sourceCompetitor: feedConfig.name,
            status: 'pending',
            createdAt: now,
            updatedAt: now,
          };

          newTasks.push(newTask);
          existingUrls.add(item.link);
        }
      }
    } catch (err: unknown) {
      const error = err as NodeJS.ErrnoException;
      console.warn(`Failed to fetch or parse feed for ${feedConfig.name} (${feedConfig.url}):`, error.message);
    }
  }

  const updatedTasks = [...newTasks, ...existingTasks];
  if (newTasks.length > 0) {
    await saveTasks(updatedTasks);
  }

  return { addedCount: newTasks.length, tasks: updatedTasks };
}
