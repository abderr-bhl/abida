import Parser from 'rss-parser';
import fs from 'fs/promises';
import path from 'path';

export interface CompetitorTask {
  id: string;
  title: string;
  description: string;
  competitor: string;
  sourceUrl: string;
  status: 'pending' | 'in_progress' | 'completed' | 'dismissed';
  createdAt: string;
  updatedAt: string;
}

const TASKS_FILE = path.join(process.cwd(), 'data', 'tasks.json');

const FEEDS = [
  { name: 'Wirecutter', url: 'https://www.nytimes.com/wirecutter/feed/' },
  { name: 'RTINGS', url: 'https://www.rtings.com/rss/reviews.xml' },
];

export async function getTasks(): Promise<CompetitorTask[]> {
  try {
    const data = await fs.readFile(TASKS_FILE, 'utf-8');
    return JSON.parse(data) as CompetitorTask[];
  } catch (err: unknown) {
    const error = err as NodeJS.ErrnoException;
    if (error.code === 'ENOENT') {
      return [];
    }
    console.warn('Failed to read tasks file:', error.message);
    return [];
  }
}

export async function saveTasks(tasks: CompetitorTask[]): Promise<void> {
  try {
    const dir = path.dirname(TASKS_FILE);
    await fs.mkdir(dir, { recursive: true });
    await fs.writeFile(TASKS_FILE, JSON.stringify(tasks, null, 2), 'utf-8');
  } catch (err: unknown) {
    const error = err as NodeJS.ErrnoException;
    if (error.code === 'EROFS') {
      console.warn('Filesystem is read-only. Tasks could not be persisted to disk.');
    } else {
      console.error('Error saving tasks:', error);
    }
  }
}

export async function runBenchmark(): Promise<{ added: number; total: number }> {
  const parser = new Parser();
  const existingTasks = await getTasks();
  const existingUrls = new Set(existingTasks.map((t) => t.sourceUrl));
  const newTasks: CompetitorTask[] = [];

  for (const feed of FEEDS) {
    try {
      const parsedFeed = await parser.parseURL(feed.url);
      for (const item of parsedFeed.items || []) {
        if (!item.link || existingUrls.has(item.link)) continue;

        const taskTitle = `Review: ${item.title || 'Competitor Article'}`;
        const taskDescription = item.contentSnippet || item.content || `New article detected from ${feed.name}`;

        const newTask: CompetitorTask = {
          id: crypto.randomUUID(),
          title: taskTitle,
          description: taskDescription.slice(0, 300),
          competitor: feed.name,
          sourceUrl: item.link,
          status: 'pending',
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        };

        newTasks.push(newTask);
        existingUrls.add(item.link);
      }
    } catch (err: unknown) {
      const error = err as Error;
      console.warn(`Failed to fetch or parse feed from ${feed.name} (${feed.url}):`, error.message);
    }
  }

  const updatedTasks = [...newTasks, ...existingTasks];
  await saveTasks(updatedTasks);

  return {
    added: newTasks.length,
    total: updatedTasks.length,
  };
}
