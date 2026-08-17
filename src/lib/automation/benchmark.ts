import Parser from 'rss-parser';
import * as fs from 'fs';
import * as path from 'path';
import { randomUUID } from 'crypto';
import { Task, TaskType } from '@/types';

const TASKS_FILE = path.join(process.cwd(), 'data', 'tasks.json');

const FEEDS = [
  { name: 'Wirecutter', url: 'https://www.nytimes.com/wirecutter/feed/' },
  { name: 'RTINGS', url: 'https://www.rtings.com/rss/reviews.xml' },
];

function determineTaskType(title: string): TaskType {
  const lower = title.toLowerCase();
  if (lower.includes('vs') || lower.includes('versus') || lower.includes('compared')) {
    return 'comparison';
  }
  if (lower.includes('review') || lower.includes('hands-on')) {
    return 'review';
  }
  if (lower.includes('deal') || lower.includes('news') || lower.includes('update')) {
    return 'news';
  }
  return 'guide';
}

function loadExistingTasks(): Task[] {
  try {
    if (fs.existsSync(TASKS_FILE)) {
      const data = fs.readFileSync(TASKS_FILE, 'utf-8');
      return JSON.parse(data) as Task[];
    }
  } catch (error) {
    const err = error as NodeJS.ErrnoException;
    if (err.code === 'EROFS') {
      console.warn('Read-only filesystem detected when reading tasks:', err.message);
    } else {
      console.error('Error reading tasks file:', error);
    }
  }
  return [];
}

function saveTasks(tasks: unknown): void {
  try {
    const dir = path.dirname(TASKS_FILE);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    fs.writeFileSync(TASKS_FILE, JSON.stringify(tasks, null, 2), 'utf-8');
  } catch (error) {
    const err = error as NodeJS.ErrnoException;
    if (err.code === 'EROFS') {
      console.warn('Read-only filesystem detected when saving tasks:', err.message);
    } else {
      console.error('Error writing tasks file:', error);
    }
  }
}

export async function runBenchmark(): Promise<{ success: boolean; newTasksCount: number; tasks: Task[] }> {
  const parser = new Parser({
    headers: {
      'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
    },
    timeout: 10000,
  });

  const existingTasks = loadExistingTasks();
  const existingUrls = new Set(existingTasks.map((t) => t.sourceUrl));
  const newTasks: Task[] = [];

  for (const feedConfig of FEEDS) {
    try {
      const feed = await parser.parseURL(feedConfig.url);
      for (const item of feed.items || []) {
        if (!item.link || existingUrls.has(item.link)) {
          continue;
        }

        const rawTitle = item.title?.trim() || 'Untitled Competitor Article';
        const type = determineTaskType(rawTitle);

        let prefix = 'Review';
        if (type === 'guide') prefix = 'Guide';
        else if (type === 'comparison') prefix = 'Comparison';
        else if (type === 'news') prefix = 'News';

        const title = `${prefix}: ${rawTitle}`;
        const description = item.contentSnippet || item.summary || `Automated benchmark task created from ${feedConfig.name} article: "${rawTitle}".`;

        const task: Task = {
          id: randomUUID(),
          title,
          description,
          sourceUrl: item.link,
          competitor: feedConfig.name,
          type,
          status: 'pending',
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        };

        newTasks.push(task);
        existingUrls.add(item.link);
      }
    } catch (error) {
      console.error(`Failed to parse feed for ${feedConfig.name} (${feedConfig.url}):`, error);
    }
  }

  const allTasks = [...newTasks, ...existingTasks];
  saveTasks(allTasks);

  return {
    success: true,
    newTasksCount: newTasks.length,
    tasks: allTasks,
  };
}

export function getTasks(): Task[] {
  return loadExistingTasks();
}

export function updateTaskStatus(taskId: string, status: Task['status']): Task | null {
  const tasks = loadExistingTasks();
  const index = tasks.findIndex((t) => t.id === taskId);
  if (index === -1) return null;

  tasks[index] = {
    ...tasks[index],
    status,
    updatedAt: new Date().toISOString(),
  };

  saveTasks(tasks);
  return tasks[index];
}
