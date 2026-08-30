import fs from 'fs';
import path from 'path';
import crypto from 'crypto';
import Parser from 'rss-parser';

export interface BenchmarkTask {
  id: string;
  title: string;
  description: string;
  sourceUrl: string;
  competitor: string;
  status: 'pending' | 'in-progress' | 'completed' | 'ignored';
  createdAt: string;
}

const TASKS_FILE_PATH = path.join(process.cwd(), 'data', 'tasks.json');

const COMPETITOR_FEEDS = [
  { name: 'Wirecutter', url: 'https://www.nytimes.com/wirecutter/feed/' },
  { name: 'RTINGS', url: 'https://www.rtings.com/rss/reviews.xml' },
];

export function loadTasks(): BenchmarkTask[] {
  try {
    if (!fs.existsSync(TASKS_FILE_PATH)) {
      return [];
    }
    const data = fs.readFileSync(TASKS_FILE_PATH, 'utf-8');
    const parsed: unknown = JSON.parse(data);
    if (Array.isArray(parsed)) {
      return parsed as BenchmarkTask[];
    }
    return [];
  } catch (err) {
    if (err instanceof Error) {
      const nodeErr = err as NodeJS.ErrnoException;
      console.warn('Failed to load tasks from file:', nodeErr.message);
    }
    return [];
  }
}

export function saveTasks(tasks: BenchmarkTask[]): boolean {
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
        console.warn('Read-only filesystem encountered (EROFS). Skipping file write.');
      } else {
        console.warn('Error saving tasks to JSON:', nodeErr.message);
      }
    }
    return false;
  }
}

export async function runBenchmark(): Promise<{ tasksCreated: number; tasks: BenchmarkTask[] }> {
  const parser = new Parser();
  const existingTasks = loadTasks();
  const existingUrls = new Set(existingTasks.map(t => t.sourceUrl));
  const newTasks: BenchmarkTask[] = [];

  for (const feedConfig of COMPETITOR_FEEDS) {
    try {
      const feed = await parser.parseURL(feedConfig.url);
      if (!feed.items) continue;

      for (const item of feed.items) {
        const url = item.link || item.guid;
        if (!url || existingUrls.has(url)) continue;

        const rawTitle = item.title || 'Untitled Competitor Article';
        const taskTitle = rawTitle.startsWith('Review:') || rawTitle.startsWith('Guide:')
          ? rawTitle
          : `Review: ${rawTitle}`;

        const newTask: BenchmarkTask = {
          id: crypto.randomUUID(),
          title: taskTitle,
          description: `Actionable task generated from competitor article "${rawTitle}" published by ${feedConfig.name}. Review and create competing content for US market.`,
          sourceUrl: url,
          competitor: feedConfig.name,
          status: 'pending',
          createdAt: new Date().toISOString(),
        };

        newTasks.push(newTask);
        existingUrls.add(url);
      }
    } catch (err) {
      if (err instanceof Error) {
        console.warn(`Failed to fetch RSS feed for ${feedConfig.name}:`, err.message);
      }
    }
  }

  const updatedTasks = [...newTasks, ...existingTasks];
  saveTasks(updatedTasks);

  return {
    tasksCreated: newTasks.length,
    tasks: updatedTasks,
  };
}
