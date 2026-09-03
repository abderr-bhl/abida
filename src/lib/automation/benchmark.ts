import Parser from 'rss-parser';
import fs from 'fs/promises';
import path from 'path';

export interface Task {
  id: string;
  competitor: string;
  title: string;
  description: string;
  targetUrl: string;
  status: 'PENDING' | 'IN_PROGRESS' | 'COMPLETED';
  createdAt: string;
}

const DATA_DIR = path.join(process.cwd(), 'data');
const TASKS_FILE = path.join(DATA_DIR, 'tasks.json');

const parser = new Parser({
  headers: {
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
  },
  timeout: 10000,
});

const COMPETITOR_FEEDS = [
  {
    name: 'Wirecutter',
    url: 'https://www.nytimes.com/wirecutter/feed/',
  },
  {
    name: 'RTINGS',
    url: 'https://www.rtings.com/rss/reviews.xml',
  },
];

export async function loadTasks(): Promise<Task[]> {
  try {
    const data = await fs.readFile(TASKS_FILE, 'utf-8');
    return JSON.parse(data) as Task[];
  } catch {
    return [];
  }
}

export async function saveData(tasks: Task[]): Promise<void> {
  try {
    await fs.mkdir(DATA_DIR, { recursive: true });
    await fs.writeFile(TASKS_FILE, JSON.stringify(tasks, null, 2), 'utf-8');
  } catch (err: unknown) {
    const error = err as NodeJS.ErrnoException;
    if (error.code === 'EROFS') {
      console.warn('ReadOnlyFileSystem: Unable to save task to local disk data file.');
      return;
    }
    throw err;
  }
}

export async function runBenchmarkJob(): Promise<{ success: boolean; newTasksCount: number; message: string }> {
  const existingTasks = await loadTasks();
  const existingUrls = new Set(existingTasks.map((t) => t.targetUrl));
  const newTasks: Task[] = [];

  for (const feed of COMPETITOR_FEEDS) {
    try {
      const parsedFeed = await parser.parseURL(feed.url);
      const items = parsedFeed.items || [];

      for (const item of items.slice(0, 5)) {
        const itemLink = item.link || item.guid || '';
        if (!itemLink || existingUrls.has(itemLink)) {
          continue;
        }

        const title = item.title || 'Untitled Article';
        const taskTitle = `Review: ${title}`;
        const taskDesc = `Benchmark task created based on competitor article: "${title}". Perform gap analysis and update US content guidelines accordingly.`;

        const newTask: Task = {
          id: crypto.randomUUID(),
          competitor: feed.name,
          title: taskTitle,
          description: taskDesc,
          targetUrl: itemLink,
          status: 'PENDING',
          createdAt: new Date().toISOString(),
        };

        newTasks.push(newTask);
        existingUrls.add(itemLink);
      }
    } catch (feedError) {
      console.warn(`Failed to fetch RSS feed for ${feed.name}:`, feedError);
      // Fallback behavior if RTINGS feed returns 404 or fails
      if (feed.name === 'RTINGS') {
        const fallbackUrl = 'https://www.rtings.com/tv/reviews/best';
        if (!existingUrls.has(fallbackUrl)) {
          newTasks.push({
            id: crypto.randomUUID(),
            competitor: feed.name,
            title: 'Review: RTINGS TV Benchmarking Gap Analysis',
            description: 'Benchmark task created based on RTINGS TV category benchmarking.',
            targetUrl: fallbackUrl,
            status: 'PENDING',
            createdAt: new Date().toISOString(),
          });
          existingUrls.add(fallbackUrl);
        }
      }
    }
  }

  const updatedTasks = [...newTasks, ...existingTasks];
  await saveData(updatedTasks);

  return {
    success: true,
    newTasksCount: newTasks.length,
    message: `Benchmarking completed. ${newTasks.length} new tasks created.`,
  };
}
