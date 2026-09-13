import Parser from 'rss-parser';
import crypto from 'crypto';
import fs from 'fs';
import path from 'path';

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

const FEEDS = [
  { name: 'Wirecutter', url: 'https://www.nytimes.com/wirecutter/feed/' },
  { name: 'RTINGS', url: 'https://www.rtings.com/rss/reviews.xml' },
];

export async function loadTasks(): Promise<Task[]> {
  try {
    if (!fs.existsSync(TASKS_FILE)) {
      return [];
    }
    const data = fs.readFileSync(TASKS_FILE, 'utf-8');
    return JSON.parse(data) as Task[];
  } catch (error) {
    if (error instanceof Error) {
      const err = error as NodeJS.ErrnoException;
      if (err.code === 'ENOENT') {
        return [];
      }
    }
    console.error('Error loading tasks:', error);
    return [];
  }
}

export async function saveTasks(tasks: Task[]): Promise<boolean> {
  try {
    if (!fs.existsSync(DATA_DIR)) {
      fs.mkdirSync(DATA_DIR, { recursive: true });
    }
    const dataToSave: unknown = tasks;
    fs.writeFileSync(TASKS_FILE, JSON.stringify(dataToSave, null, 2), 'utf-8');
    return true;
  } catch (error) {
    if (error instanceof Error) {
      const err = error as NodeJS.ErrnoException;
      if (err.code === 'EROFS') {
        console.warn('Read-only filesystem detected (EROFS). Task changes cannot be persisted to disk.');
        return false;
      }
    }
    console.error('Error saving tasks:', error);
    return false;
  }
}

export async function runBenchmarking(): Promise<{ addedCount: number; totalTasks: number }> {
  const parser = new Parser({
    headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) ReviewGuidBot/1.0' },
    timeout: 5000,
  });

  const existingTasks = await loadTasks();
  const existingUrls = new Set(existingTasks.map((t) => t.sourceUrl));
  const newTasks: Task[] = [];

  for (const feed of FEEDS) {
    try {
      const feedData = await parser.parseURL(feed.url);
      for (const item of feedData.items || []) {
        if (!item.link) continue;
        if (existingUrls.has(item.link)) continue;

        const rawTitle = item.title ? item.title.trim() : 'Competitor Update';
        const title = rawTitle.startsWith('Review:') ? rawTitle : `Review: ${rawTitle}`;
        const description =
          item.contentSnippet || item.content || `Analyze competitor content from ${feed.name}: ${item.title || 'New article'}`;

        const task: Task = {
          id: crypto.randomUUID(),
          title,
          description,
          sourceUrl: item.link,
          competitor: feed.name,
          status: 'pending',
          createdAt: new Date().toISOString(),
        };

        newTasks.push(task);
        existingUrls.add(item.link);
      }
    } catch (error) {
      console.warn(`Failed to fetch RSS feed for ${feed.name} (${feed.url}):`, error instanceof Error ? error.message : error);
    }
  }

  const allTasks = [...newTasks, ...existingTasks];
  await saveTasks(allTasks);

  return {
    addedCount: newTasks.length,
    totalTasks: allTasks.length,
  };
}
