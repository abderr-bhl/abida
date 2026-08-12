import fs from 'fs';
import path from 'path';
import crypto from 'crypto';
import Parser from 'rss-parser';

export interface Task {
  id: string;
  title: string;
  description: string;
  status: 'pending' | 'completed' | 'ignored';
  source: 'Wirecutter' | 'RTINGS';
  sourceUrl: string;
  createdAt: string;
}

const TASKS_FILE_PATH = path.join(process.cwd(), 'data', 'tasks.json');

export function loadTasks(): Task[] {
  try {
    if (!fs.existsSync(TASKS_FILE_PATH)) {
      return [];
    }
    const data = fs.readFileSync(TASKS_FILE_PATH, 'utf-8');
    return JSON.parse(data) as Task[];
  } catch (err) {
    console.error('Error loading tasks:', err);
    return [];
  }
}

export function saveTasks(tasks: unknown): boolean {
  try {
    const dir = path.dirname(TASKS_FILE_PATH);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    fs.writeFileSync(TASKS_FILE_PATH, JSON.stringify(tasks, null, 2), 'utf-8');
    return true;
  } catch (err) {
    if (err instanceof Error) {
      const nodeErr = err as NodeJS.ErrnoException;
      if (nodeErr.code === 'EROFS') {
        console.warn('Read-only filesystem detected (EROFS). Skipping file write.');
        return false;
      }
    }
    console.error('Error saving tasks:', err);
    return false;
  }
}

export async function runBenchmark(): Promise<{ success: boolean; addedCount: number; message: string }> {
  const parser = new Parser();
  const existingTasks = loadTasks();
  const existingUrls = new Set(existingTasks.map(t => t.sourceUrl.toLowerCase()));
  const existingTitles = new Set(existingTasks.map(t => t.title.toLowerCase()));

  const feeds = [
    { name: 'Wirecutter' as const, url: 'https://www.nytimes.com/wirecutter/feed/' },
    { name: 'RTINGS' as const, url: 'https://www.rtings.com/rss/reviews.xml' }
  ];

  let addedCount = 0;
  const newTasks: Task[] = [...existingTasks];

  for (const feed of feeds) {
    try {
      const parsedFeed = await parser.parseURL(feed.url);

      for (const item of parsedFeed.items) {
        if (!item.link || !item.title) continue;

        const normalizedUrl = item.link.toLowerCase();
        const normalizedTitle = item.title.toLowerCase();

        // Check for duplicates in feed items
        const isUrlDuplicate = Array.from(existingUrls).some(u => u === normalizedUrl || normalizedUrl.includes(u) || u.includes(normalizedUrl));
        const isTitleDuplicate = Array.from(existingTitles).some(t => t === normalizedTitle || t.includes(normalizedTitle) || normalizedTitle.includes(t));

        if (isUrlDuplicate || isTitleDuplicate) {
          continue;
        }

        const isReview = normalizedTitle.includes('review') || feed.name === 'RTINGS';
        const taskType = isReview ? 'Review' : 'Guide';
        const title = `${taskType}: ${item.title}`;
        const description = `Competitor ${feed.name} published an article titled "${item.title}". Research and produce an optimized affiliate-ready version for the US market.`;

        const newTask: Task = {
          id: crypto.randomUUID(),
          title,
          description,
          status: 'pending',
          source: feed.name,
          sourceUrl: item.link,
          createdAt: new Date().toISOString()
        };

        newTasks.push(newTask);
        existingUrls.add(normalizedUrl);
        existingTitles.add(normalizedTitle);
        addedCount++;
      }
    } catch (err) {
      console.warn(`Warning: Failed to fetch or parse feed from ${feed.name} at ${feed.url}:`, err);
    }
  }

  if (addedCount > 0) {
    const saved = saveTasks(newTasks);
    if (!saved) {
      return {
        success: true,
        addedCount,
        message: `Identified ${addedCount} content gaps, but couldn't persist because the filesystem is read-only (EROFS).`
      };
    }
  }

  return {
    success: true,
    addedCount,
    message: `Successfully completed benchmark. Identified and added ${addedCount} new tasks.`
  };
}
