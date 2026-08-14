import fs from 'fs';
import path from 'path';
import crypto from 'crypto';
import Parser from 'rss-parser';

export interface AutomatedTask {
  id: string;
  title: string;
  description: string;
  sourceUrl: string;
  sourceCompetitor: 'Wirecutter' | 'RTINGS';
  status: 'pending' | 'in_progress' | 'completed' | 'ignored';
  createdAt: string;
  updatedAt: string;
}

const parser = new Parser();
const DATA_FILE_PATH = path.join(process.cwd(), 'data', 'tasks.json');

/**
 * Loads tasks from the JSON storage file.
 * Handles read-only file systems (EROFS) by logging a warning/error correctly.
 */
export function loadTasks(): AutomatedTask[] {
  try {
    if (!fs.existsSync(DATA_FILE_PATH)) {
      return [];
    }
    const rawData = fs.readFileSync(DATA_FILE_PATH, 'utf-8');
    return JSON.parse(rawData) as AutomatedTask[];
  } catch (error) {
    const err = error as Error & { code?: string };
    if (err.code === 'EROFS') {
      console.warn('Read-only file system detected when reading tasks: ', err.message);
    } else {
      console.error('Error reading tasks:', err);
    }
    return [];
  }
}

/**
 * Saves tasks to the JSON storage file.
 * Casts caught errors to NodeJS.ErrnoException to satisfy strict lint rules.
 */
export function saveTasks(tasks: AutomatedTask[]): boolean {
  try {
    const dirPath = path.dirname(DATA_FILE_PATH);
    if (!fs.existsSync(dirPath)) {
      fs.mkdirSync(dirPath, { recursive: true });
    }
    fs.writeFileSync(DATA_FILE_PATH, JSON.stringify(tasks, null, 2), 'utf-8');
    return true;
  } catch (error) {
    const err = error as Error & { code?: string };
    if (err.code === 'EROFS') {
      console.warn('Warning: Write operation ignored due to Read-only filesystem (EROFS):', err.message);
    } else {
      console.error('Failed to save tasks:', err);
    }
    return false;
  }
}

/**
 * Runs the competitive benchmarking process.
 * Fetches RSS feeds from Wirecutter and RTINGS, checks for content gaps, and populates tasks.
 */
export async function runBenchmarking(): Promise<{ added: number; total: number; error?: string }> {
  const existingTasks = loadTasks();
  const existingUrls = new Set(existingTasks.map(t => t.sourceUrl));
  let addedCount = 0;

  const feeds = [
    {
      name: 'Wirecutter' as const,
      url: 'https://www.nytimes.com/wirecutter/feed/',
    },
    {
      name: 'RTINGS' as const,
      url: 'https://www.rtings.com/rss/reviews.xml',
    }
  ];

  for (const feed of feeds) {
    try {
      // Fetch and parse the competitor RSS feed
      const parsedFeed = await parser.parseURL(feed.url);

      for (const item of parsedFeed.items) {
        const itemUrl = item.link || '';
        if (!itemUrl || existingUrls.has(itemUrl)) {
          continue;
        }

        // Standardize title and description into English format with 'Review: [Title]'
        const rawTitle = item.title || 'Unknown Product';
        const title = `Review: ${rawTitle}`;
        const description = item.contentSnippet || item.content || `A competitor analysis of the review published by ${feed.name}: "${rawTitle}"`;

        const newTask: AutomatedTask = {
          id: crypto.randomUUID(),
          title,
          description,
          sourceUrl: itemUrl,
          sourceCompetitor: feed.name,
          status: 'pending',
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        };

        existingTasks.push(newTask);
        existingUrls.add(itemUrl);
        addedCount++;
      }
    } catch (error) {
      // RTINGS or Wirecutter feed fetch might fail (e.g. RTINGS 404s).
      // We log the warning and continue to make the system robust.
      console.warn(`Could not fetch RSS feed for ${feed.name} (${feed.url}):`, error);
    }
  }

  if (addedCount > 0) {
    saveTasks(existingTasks);
  }

  return { added: addedCount, total: existingTasks.length };
}
