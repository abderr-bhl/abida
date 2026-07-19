import Parser from 'rss-parser';
import * as crypto from 'crypto';
import * as fs from 'fs';
import * as path from 'path';
import { Task, BenchmarkRecord } from '@/types';

const TASKS_FILE = path.join(process.cwd(), 'data', 'tasks.json');
const RECORDS_FILE = path.join(process.cwd(), 'data', 'records.json');

// Ensure the data directory exists
function ensureDataDir() {
  const dir = path.join(process.cwd(), 'data');
  if (!fs.existsSync(dir)) {
    try {
      fs.mkdirSync(dir, { recursive: true });
    } catch (e: unknown) {
      console.warn('Failed to create data directory (may be EROFS):', e);
    }
  }
}

// Save helpers with EROFS handling
export function saveTasks(tasks: Task[]): boolean {
  ensureDataDir();
  try {
    fs.writeFileSync(TASKS_FILE, JSON.stringify(tasks, null, 2), 'utf-8');
    return true;
  } catch (error: unknown) {
    const err = error as NodeJS.ErrnoException;
    if (err.code === 'EROFS') {
      console.warn('WARNING: Read-only filesystem. Tasks not saved locally.');
    } else {
      console.error('Error saving tasks:', error);
    }
    return false;
  }
}

export function saveRecords(records: BenchmarkRecord[]): boolean {
  ensureDataDir();
  try {
    fs.writeFileSync(RECORDS_FILE, JSON.stringify(records, null, 2), 'utf-8');
    return true;
  } catch (error: unknown) {
    const err = error as NodeJS.ErrnoException;
    if (err.code === 'EROFS') {
      console.warn('WARNING: Read-only filesystem. Records not saved locally.');
    } else {
      console.error('Error saving records:', error);
    }
    return false;
  }
}

// Load helpers
export function loadTasks(): Task[] {
  if (!fs.existsSync(TASKS_FILE)) return [];
  try {
    const content = fs.readFileSync(TASKS_FILE, 'utf-8');
    return JSON.parse(content) as Task[];
  } catch (e) {
    console.error('Error loading tasks:', e);
    return [];
  }
}

export function loadRecords(): BenchmarkRecord[] {
  if (!fs.existsSync(RECORDS_FILE)) return [];
  try {
    const content = fs.readFileSync(RECORDS_FILE, 'utf-8');
    return JSON.parse(content) as BenchmarkRecord[];
  } catch (e) {
    console.error('Error loading records:', e);
    return [];
  }
}

export async function runBenchmark(): Promise<BenchmarkRecord> {
  const parser = new Parser({
    headers: {
      'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/115.0.0.0 Safari/537.36',
    },
  });

  const runAt = new Date().toISOString();
  const recordId = crypto.randomUUID();
  let tasksCreatedCount = 0;
  let status: 'Success' | 'Warning' | 'Error' = 'Success';
  let message = 'Benchmark completed successfully.';

  const currentTasks = loadTasks();

  // 1. Fetch Wirecutter
  let wirecutterItems: Parser.Item[] = [];
  try {
    const feed = await parser.parseURL('https://www.nytimes.com/wirecutter/feed/');
    wirecutterItems = feed.items || [];
  } catch (error) {
    console.error('Wirecutter feed fetch error:', error);
    status = 'Warning';
    message = 'Warning: Wirecutter feed could not be fetched. ' + String(error);
  }

  // 2. Fetch RTINGS
  let rtingsItems: Parser.Item[] = [];
  try {
    const feed = await parser.parseURL('https://www.rtings.com/rss/reviews.xml');
    rtingsItems = feed.items || [];
  } catch (error) {
    // RTINGS feeds frequently return 404, we bypass this and log warning
    console.warn('RTINGS feed fetch failed (expected 404 bypass):', error);
    status = 'Warning';
    message = 'Warning: RTINGS feed bypassed due to 404/failure.';
  }

  const newTasks: Task[] = [];

  const processItems = (items: Parser.Item[], source: 'Wirecutter' | 'RTINGS') => {
    for (const item of items) {
      if (!item.link || !item.title) continue;

      // Avoid creating duplicates
      const exists = currentTasks.some(
        (t) => t.competitorUrl === item.link || t.title === `Review: ${item.title}`
      );
      if (exists) continue;

      const task: Task = {
        id: crypto.randomUUID(),
        title: `Review: ${item.title}`,
        description: `Create a comprehensive buyer's guide or review based on the new competitor article: "${item.title}". Check competitive strategies and monetization opportunities.`,
        competitorUrl: item.link,
        source,
        status: 'Pending',
        createdAt: new Date().toISOString(),
      };
      newTasks.push(task);
      tasksCreatedCount++;
    }
  };

  processItems(wirecutterItems, 'Wirecutter');
  processItems(rtingsItems, 'RTINGS');

  if (newTasks.length > 0) {
    const updatedTasks = [...newTasks, ...currentTasks];
    saveTasks(updatedTasks);
  }

  const newRecord: BenchmarkRecord = {
    id: recordId,
    runAt,
    status,
    message: `${message} Created ${tasksCreatedCount} new tasks.`,
    tasksCreatedCount,
  };

  const currentRecords = loadRecords();
  saveRecords([newRecord, ...currentRecords]);

  return newRecord;
}
