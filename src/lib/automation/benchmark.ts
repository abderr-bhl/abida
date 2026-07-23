import Parser from 'rss-parser';
import fs from 'fs';
import path from 'path';
import crypto from 'crypto';
import { Task, BenchmarkRecord } from '@/types';

const TASKS_FILE = path.join(process.cwd(), 'data', 'tasks.json');
const BENCHMARKS_FILE = path.join(process.cwd(), 'data', 'benchmarks.json');

// Ensure data folder exists or handle filesystem gracefully
function ensureDirectoryExistence(filePath: string): boolean {
  const dirname = path.dirname(filePath);
  if (fs.existsSync(dirname)) {
    return true;
  }
  try {
    fs.mkdirSync(dirname, { recursive: true });
    return true;
  } catch (err) {
    handleFsError(err, `Failed to create directory: ${dirname}`);
    return false;
  }
}

function handleFsError(err: unknown, message: string) {
  if (err instanceof Error) {
    const errnoErr = err as NodeJS.ErrnoException;
    if (errnoErr.code === 'EROFS') {
      console.warn(`[FileSystem Warning] Read-only filesystem detected. ${message}`);
      return;
    }
  }
  console.error(`[FileSystem Error] ${message}`, err);
}

// Serialization helper using unknown type for strict TypeScript linting rules
export function saveData(filepath: string, data: unknown): boolean {
  if (!ensureDirectoryExistence(filepath)) {
    return false;
  }
  try {
    fs.writeFileSync(filepath, JSON.stringify(data, null, 2), 'utf-8');
    return true;
  } catch (err) {
    handleFsError(err, `Failed to write file: ${filepath}`);
    return false;
  }
}

export function readData<T>(filepath: string, defaultValue: T): T {
  try {
    if (fs.existsSync(filepath)) {
      const content = fs.readFileSync(filepath, 'utf-8');
      return JSON.parse(content) as T;
    }
  } catch (err) {
    handleFsError(err, `Failed to read file: ${filepath}`);
  }
  return defaultValue;
}

export async function runBenchmarking(): Promise<{
  success: boolean;
  tasksCreatedCount: number;
  error?: string;
}> {
  const parser = new Parser({
    headers: {
      'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
    }
  });

  const feeds = [
    { name: 'Wirecutter', url: 'https://www.nytimes.com/wirecutter/feed/' },
    { name: 'RTINGS', url: 'https://www.rtings.com/rss/reviews.xml' }
  ];

  const existingTasks = readData<Task[]>(TASKS_FILE, []);
  const existingUrls = new Set(existingTasks.map(t => t.sourceUrl));
  const newTasks: Task[] = [];
  let errorMsg: string | undefined;

  for (const feed of feeds) {
    try {
      console.log(`Fetching feed for ${feed.name} from ${feed.url}...`);
      const parsedFeed = await parser.parseURL(feed.url);

      for (const item of parsedFeed.items) {
        if (!item.link) continue;

        // Check if we already have a task for this URL
        if (existingUrls.has(item.link)) continue;

        // Generate task
        const title = item.title ? `Review: ${item.title}` : `Review: New Competitor Post`;
        const description = `Competitor: ${feed.name}\nPublished At: ${item.pubDate || 'N/A'}\nDescription: ${item.contentSnippet || item.summary || 'No snippet available.'}`;

        const newTask: Task = {
          id: crypto.randomUUID(),
          title,
          description,
          status: 'pending',
          sourceUrl: item.link,
          competitor: feed.name,
          publishedAt: item.pubDate || new Date().toISOString(),
          createdAt: new Date().toISOString()
        };

        newTasks.push(newTask);
        existingUrls.add(item.link);
      }
    } catch (err) {
      console.warn(`Failed to fetch/parse feed for ${feed.name}:`, err);
      // For RTINGS or any feed that fails, we bypass the error and continue, but record it
      if (feed.name === 'RTINGS') {
        // RTINGS frequently returns 404, we expect this and bypass
        continue;
      }
      errorMsg = err instanceof Error ? err.message : String(err);
    }
  }

  const allTasks = [...newTasks, ...existingTasks];
  const writeSuccess = saveData(TASKS_FILE, allTasks);

  // Generate benchmark record
  const record: BenchmarkRecord = {
    id: crypto.randomUUID(),
    triggeredAt: new Date().toISOString(),
    status: writeSuccess ? 'success' : 'failed',
    tasksCreatedCount: newTasks.length,
    error: errorMsg
  };

  const records = readData<BenchmarkRecord[]>(BENCHMARKS_FILE, []);
  records.unshift(record); // put latest at top
  saveData(BENCHMARKS_FILE, records.slice(0, 50)); // keep last 50 runs

  return {
    success: writeSuccess,
    tasksCreatedCount: newTasks.length,
    error: errorMsg
  };
}
