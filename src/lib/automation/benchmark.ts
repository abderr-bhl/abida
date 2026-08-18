import Parser from 'rss-parser';
import fs from 'fs';
import path from 'path';
import { randomUUID } from 'crypto';
import { Task } from '@/types';

const DATA_DIR = path.join(process.cwd(), 'data');
const TASKS_FILE = path.join(DATA_DIR, 'tasks.json');

const parser = new Parser({
  headers: {
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
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
    if (!fs.existsSync(TASKS_FILE)) {
      return [];
    }
    const raw = fs.readFileSync(TASKS_FILE, 'utf-8');
    const data = JSON.parse(raw);
    return Array.isArray(data) ? data : [];
  } catch (error) {
    console.error('Failed to load tasks:', error);
    return [];
  }
}

export async function saveData(data: unknown): Promise<void> {
  try {
    if (!fs.existsSync(DATA_DIR)) {
      fs.mkdirSync(DATA_DIR, { recursive: true });
    }
    fs.writeFileSync(TASKS_FILE, JSON.stringify(data, null, 2), 'utf-8');
  } catch (err: unknown) {
    if (err && typeof err === 'object' && 'code' in err) {
      const nodeErr = err as NodeJS.ErrnoException;
      if (nodeErr.code === 'EROFS') {
        console.warn('ReadOnlyFileSystem: Unable to save task file locally in Vercel environment.', nodeErr.message);
        return;
      }
    }
    console.error('Error writing to task store:', err);
  }
}

export async function runCompetitiveBenchmarking(): Promise<{ addedCount: number; tasks: Task[] }> {
  const existingTasks = await loadTasks();
  const existingUrls = new Set(existingTasks.map(t => t.sourceUrl));
  const newTasks: Task[] = [];

  for (const feedConfig of COMPETITOR_FEEDS) {
    try {
      const feed = await parser.parseURL(feedConfig.url);
      const items = feed.items || [];

      for (const item of items.slice(0, 10)) {
        if (!item.link || existingUrls.has(item.link)) {
          continue;
        }

        const title = item.title ? item.title.trim() : 'New Competitor Review';
        const taskTitle = `Review: ${title}`;
        const description = item.contentSnippet || item.summary || item.content || `Competitor published new article: ${title}`;

        const newTask: Task = {
          id: randomUUID(),
          title: taskTitle,
          description: description.substring(0, 300),
          source: feedConfig.name,
          sourceUrl: item.link,
          createdAt: new Date().toISOString(),
          status: 'pending',
          category: feedConfig.name,
        };

        newTasks.push(newTask);
        existingUrls.add(item.link);
      }
    } catch (feedError) {
      console.warn(`Failed to fetch RSS feed from ${feedConfig.name} (${feedConfig.url}):`, feedError);
    }
  }

  const updatedTasks = [...newTasks, ...existingTasks];
  await saveData(updatedTasks);

  return {
    addedCount: newTasks.length,
    tasks: updatedTasks,
  };
}
