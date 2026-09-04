import Parser from 'rss-parser';
import { randomUUID } from 'crypto';
import fs from 'fs';
import path from 'path';

export interface BenchmarkTask {
  id: string;
  title: string;
  description: string;
  status: 'pending' | 'in_progress' | 'completed';
  competitorUrl: string;
  createdAt: string;
  source: string;
}

const TASKS_FILE_PATH = path.join(process.cwd(), 'data', 'tasks.json');

const FEEDS = [
  {
    name: 'Wirecutter',
    url: 'https://www.nytimes.com/wirecutter/feed/',
  },
  {
    name: 'RTINGS',
    url: 'https://www.rtings.com/rss/reviews.xml',
  },
];

const DEFAULT_INITIAL_TASKS: BenchmarkTask[] = [
  {
    id: '1',
    title: 'Review: Best Wireless Noise-Canceling Headphones 2025',
    description: 'Benchmarked competitor coverage for wireless noise-canceling headphones. Analyze top choices and update guide.',
    status: 'pending',
    competitorUrl: 'https://www.nytimes.com/wirecutter/reviews/best-wireless-noise-canceling-headphones/',
    createdAt: new Date().toISOString(),
    source: 'Wirecutter',
  },
  {
    id: '2',
    title: 'Review: Best 4K OLED TVs Comparison',
    description: 'Competitor published updated test methodology for OLED displays. Review gap analysis.',
    status: 'in_progress',
    competitorUrl: 'https://www.rtings.com/tv/reviews/best/by-type/oled',
    createdAt: new Date().toISOString(),
    source: 'RTINGS',
  },
];

/**
 * Helper to safely save JSON data with unknown typing and EROFS handling.
 */
function saveData(data: unknown): boolean {
  try {
    const dir = path.dirname(TASKS_FILE_PATH);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    fs.writeFileSync(TASKS_FILE_PATH, JSON.stringify(data, null, 2), 'utf-8');
    return true;
  } catch (err) {
    if (err instanceof Error && (err as NodeJS.ErrnoException).code === 'EROFS') {
      console.warn('Read-only filesystem encountered (EROFS). Skipping file persistence.');
    } else {
      console.error('Failed to save benchmark tasks to file:', err);
    }
    return false;
  }
}

/**
 * Retrieves all benchmark tasks.
 */
export async function getTasks(): Promise<BenchmarkTask[]> {
  try {
    if (fs.existsSync(TASKS_FILE_PATH)) {
      const raw = fs.readFileSync(TASKS_FILE_PATH, 'utf-8');
      const parsed = JSON.parse(raw) as BenchmarkTask[];
      if (Array.isArray(parsed)) {
        return parsed;
      }
    }
  } catch (err) {
    console.error('Error reading tasks file:', err);
  }

  // Fallback / default initialization
  saveData(DEFAULT_INITIAL_TASKS);
  return DEFAULT_INITIAL_TASKS;
}

/**
 * Runs competitive benchmarking by fetching feeds and identifying content gaps.
 */
export async function runBenchmark(): Promise<{
  success: boolean;
  newTasksCount: number;
  totalTasksCount: number;
  tasks: BenchmarkTask[];
}> {
  const existingTasks = await getTasks();
  const existingUrls = new Set(existingTasks.map((t) => t.competitorUrl));
  const parser = new Parser({
    timeout: 8000,
  });

  const newTasks: BenchmarkTask[] = [];

  for (const feed of FEEDS) {
    try {
      const feedData = await parser.parseURL(feed.url);
      const items = feedData.items || [];

      for (const item of items.slice(0, 5)) {
        const itemUrl = item.link || item.guid || '';
        const rawTitle = item.title?.trim() || 'Untitled Content';

        if (itemUrl && !existingUrls.has(itemUrl)) {
          existingUrls.add(itemUrl);

          const formattedTitle = rawTitle.toLowerCase().startsWith('review')
            ? rawTitle
            : `Review: ${rawTitle}`;

          const task: BenchmarkTask = {
            id: randomUUID(),
            title: formattedTitle,
            description: item.contentSnippet
              ? `Competitor gap analysis: ${item.contentSnippet.slice(0, 180)}...`
              : `New content detected on ${feed.name}: "${rawTitle}". Review for content gap evaluation.`,
            status: 'pending',
            competitorUrl: itemUrl,
            createdAt: new Date().toISOString(),
            source: feed.name,
          };

          newTasks.push(task);
        }
      }
    } catch (err) {
      console.warn(`Failed or bypassed RSS feed for ${feed.name} (${feed.url}):`, err);
    }
  }

  const updatedTasks = [...newTasks, ...existingTasks];
  saveData(updatedTasks);

  return {
    success: true,
    newTasksCount: newTasks.length,
    totalTasksCount: updatedTasks.length,
    tasks: updatedTasks,
  };
}

/**
 * Updates status for a specific benchmark task.
 */
export async function updateTaskStatus(
  id: string,
  status: BenchmarkTask['status']
): Promise<BenchmarkTask | null> {
  const tasks = await getTasks();
  const task = tasks.find((t) => t.id === id);

  if (!task) {
    return null;
  }

  task.status = status;
  saveData(tasks);

  return task;
}
