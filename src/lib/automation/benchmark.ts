import Parser from 'rss-parser';
import fs from 'fs';
import path from 'path';
import crypto from 'crypto';

export interface Task {
  id: string;
  title: string;
  description: string;
  sourceUrl: string;
  competitor: string;
  contentType: 'review' | 'guide' | 'comparison' | 'news';
  status: 'pending' | 'in_progress' | 'completed' | 'dismissed';
  createdAt: string;
}

const DATA_DIR = path.join(process.cwd(), 'data');
const TASKS_FILE = path.join(DATA_DIR, 'tasks.json');

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

export function getTasks(): Task[] {
  try {
    if (!fs.existsSync(TASKS_FILE)) {
      return [];
    }
    const data = fs.readFileSync(TASKS_FILE, 'utf-8');
    return JSON.parse(data) as Task[];
  } catch (error: unknown) {
    console.error('Failed to read tasks file:', error);
    return [];
  }
}

export function saveTasks(tasks: Task[]): void {
  try {
    if (!fs.existsSync(DATA_DIR)) {
      fs.mkdirSync(DATA_DIR, { recursive: true });
    }
    fs.writeFileSync(TASKS_FILE, JSON.stringify(tasks, null, 2), 'utf-8');
  } catch (err: unknown) {
    if (err instanceof Error) {
      const nodeErr = err as NodeJS.ErrnoException;
      if (nodeErr.code === 'EROFS') {
        console.warn('Read-only filesystem: unable to persist tasks to file.');
        return;
      }
    }
    console.error('Failed to save tasks:', err);
  }
}

export async function runCompetitiveBenchmark(): Promise<{ added: number; errors: string[] }> {
  const parser = new Parser();
  const existingTasks = getTasks();
  const existingUrls = new Set(existingTasks.map(t => t.sourceUrl));

  let addedCount = 0;
  const errors: string[] = [];

  for (const feedConfig of COMPETITOR_FEEDS) {
    try {
      const feed = await parser.parseURL(feedConfig.url);

      for (const item of feed.items) {
        if (!item.link || existingUrls.has(item.link)) {
          continue;
        }

        const title = item.title?.trim() || 'Untitled Competitor Article';
        const lowerTitle = title.toLowerCase();

        let contentType: Task['contentType'] = 'news';
        if (lowerTitle.includes('best') || lowerTitle.includes('guide')) {
          contentType = 'guide';
        } else if (lowerTitle.includes('vs') || lowerTitle.includes('versus')) {
          contentType = 'comparison';
        } else if (lowerTitle.includes('review')) {
          contentType = 'review';
        }

        const taskTitle = `Review: ${title}`;
        const description = `Competitor ${feedConfig.name} published a new article: "${title}". Analyze content gap and adapt for US market.`;

        const newTask: Task = {
          id: crypto.randomUUID(),
          title: taskTitle,
          description,
          sourceUrl: item.link,
          competitor: feedConfig.name,
          contentType,
          status: 'pending',
          createdAt: new Date().toISOString(),
        };

        existingTasks.push(newTask);
        existingUrls.add(item.link);
        addedCount++;
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      console.warn(`Could not fetch RSS feed for ${feedConfig.name}: ${msg}`);
      errors.push(`${feedConfig.name}: ${msg}`);
    }
  }

  if (addedCount > 0) {
    saveTasks(existingTasks);
  }

  return { added: addedCount, errors };
}
