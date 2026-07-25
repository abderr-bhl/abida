import Parser from 'rss-parser';
import fs from 'fs';
import path from 'path';
import crypto from 'crypto';
import { Task, BenchmarkRecord } from '@/types';

const TASKS_FILE = path.join(process.cwd(), 'data', 'tasks.json');
const HISTORY_FILE = path.join(process.cwd(), 'data', 'history.json');

// Ensure data directory exists
function ensureDataDir() {
  const dir = path.join(process.cwd(), 'data');
  if (!fs.existsSync(dir)) {
    try {
      fs.mkdirSync(dir, { recursive: true });
    } catch (err) {
      if (err instanceof Error) {
        const errnoErr = err as NodeJS.ErrnoException;
        if (errnoErr.code === 'EROFS') {
          console.warn('Warning: Read-only filesystem. Cannot create data directory.');
        }
      }
    }
  }
}

export async function loadTasks(): Promise<Task[]> {
  ensureDataDir();
  if (!fs.existsSync(TASKS_FILE)) {
    return [];
  }
  try {
    const content = fs.readFileSync(TASKS_FILE, 'utf8');
    return JSON.parse(content) as Task[];
  } catch (err) {
    console.error('Error reading tasks file:', err);
    return [];
  }
}

export async function saveData(data: unknown): Promise<boolean> {
  ensureDataDir();
  try {
    const content = JSON.stringify(data, null, 2);
    fs.writeFileSync(TASKS_FILE, content, 'utf8');
    return true;
  } catch (err) {
    if (err instanceof Error) {
      const errnoErr = err as NodeJS.ErrnoException;
      if (errnoErr.code === 'EROFS') {
        console.warn('Warning: Read-only filesystem. Cannot save tasks data.');
        return false;
      }
    }
    console.error('Error saving data to tasks.json:', err);
    return false;
  }
}

export async function loadHistory(): Promise<BenchmarkRecord | null> {
  ensureDataDir();
  if (!fs.existsSync(HISTORY_FILE)) {
    return null;
  }
  try {
    const content = fs.readFileSync(HISTORY_FILE, 'utf8');
    return JSON.parse(content) as BenchmarkRecord;
  } catch (err) {
    console.error('Error reading history file:', err);
    return null;
  }
}

export async function saveHistory(record: BenchmarkRecord): Promise<boolean> {
  ensureDataDir();
  try {
    const content = JSON.stringify(record, null, 2);
    fs.writeFileSync(HISTORY_FILE, content, 'utf8');
    return true;
  } catch (err) {
    if (err instanceof Error) {
      const errnoErr = err as NodeJS.ErrnoException;
      if (errnoErr.code === 'EROFS') {
        console.warn('Warning: Read-only filesystem. Cannot save history data.');
        return false;
      }
    }
    console.error('Error saving history.json:', err);
    return false;
  }
}

export async function runBenchmark(): Promise<BenchmarkRecord> {
  const parser = new Parser({
    headers: {
      'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
    },
    timeout: 5000,
  });

  const feeds = [
    { name: 'wirecutter', url: 'https://www.nytimes.com/wirecutter/feed/' },
    { name: 'rtings', url: 'https://www.rtings.com/rss/reviews.xml' }
  ];

  const existingTasks = await loadTasks();
  const existingUrls = new Set(existingTasks.map(t => t.sourceUrl));
  const newTasks: Task[] = [...existingTasks];
  let successCount = 0;
  let hasErrors = false;
  let lastErrorMsg = '';

  for (const feed of feeds) {
    try {
      console.log(`Fetching feed from ${feed.name}: ${feed.url}`);
      const parsedFeed = await parser.parseURL(feed.url);
      successCount++;

      for (const item of parsedFeed.items) {
        if (!item.link || !item.title) continue;

        // Skip if already tracked
        if (existingUrls.has(item.link)) continue;

        // Determine category / type
        const isReview = item.title.toLowerCase().includes('review') || feed.name === 'rtings';
        const typePrefix = isReview ? 'Review' : 'Guide';
        const cleanTitle = item.title.replace(/^(Review:|Guide:)\s*/i, '');

        const now = new Date().toISOString();
        const newTask: Task = {
          id: crypto.randomUUID(),
          title: `${typePrefix}: ${cleanTitle}`,
          description: `Analyze competitor article: "${item.title}". Source URL: ${item.link}`,
          sourceUrl: item.link,
          competitor: feed.name,
          status: 'pending',
          createdAt: now,
          updatedAt: now
        };

        newTasks.push(newTask);
        existingUrls.add(item.link);
      }
    } catch (err) {
      console.warn(`Error parsing RSS feed from ${feed.name}:`, err);
      if (feed.name === 'wirecutter') {
        hasErrors = true;
        lastErrorMsg = err instanceof Error ? err.message : String(err);
      } else {
        // RTINGS is allowed to fail/be bypassed
        console.log(`Bypassing RTINGS feed error.`);
      }
    }
  }

  const record: BenchmarkRecord = {
    lastRun: new Date().toISOString(),
    status: hasErrors ? 'failure' : 'success',
    ...(lastErrorMsg ? { error: lastErrorMsg } : {})
  };

  if (!hasErrors || successCount > 0) {
    // If we fetched successfully, save the updated tasks
    await saveData(newTasks);
  }

  await saveHistory(record);
  return record;
}
