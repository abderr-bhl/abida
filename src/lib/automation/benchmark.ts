import Parser from 'rss-parser';
import fs from 'fs';
import path from 'path';
import crypto from 'crypto';

export interface Task {
  id: string;
  title: string;
  description: string;
  type: 'review' | 'guide' | 'comparison' | 'news';
  status: 'pending' | 'in_progress' | 'completed';
  sourceUrl: string;
  competitor: string;
  createdAt: string;
}

const TASKS_FILE_PATH = path.join(process.cwd(), 'data', 'tasks.json');

const parser = new Parser({
  headers: {
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
  },
  timeout: 10000,
});

export function loadTasks(): Task[] {
  try {
    if (!fs.existsSync(TASKS_FILE_PATH)) {
      return [];
    }
    const rawData = fs.readFileSync(TASKS_FILE_PATH, 'utf-8');
    return JSON.parse(rawData) as Task[];
  } catch (err: unknown) {
    if (err instanceof Error && (err as NodeJS.ErrnoException).code === 'EROFS') {
      console.warn('Read-only filesystem encountered when reading tasks file.');
    } else {
      console.error('Error loading tasks:', err);
    }
    return [];
  }
}

export function saveTasks(tasks: unknown): void {
  try {
    const dirPath = path.dirname(TASKS_FILE_PATH);
    if (!fs.existsSync(dirPath)) {
      fs.mkdirSync(dirPath, { recursive: true });
    }
    fs.writeFileSync(TASKS_FILE_PATH, JSON.stringify(tasks, null, 2), 'utf-8');
  } catch (err: unknown) {
    if (err instanceof Error && (err as NodeJS.ErrnoException).code === 'EROFS') {
      console.warn('Read-only filesystem encountered when saving tasks file.');
    } else {
      console.error('Error saving tasks:', err);
    }
  }
}

interface FeedSource {
  name: string;
  url: string;
}

const SOURCES: FeedSource[] = [
  { name: 'Wirecutter', url: 'https://www.nytimes.com/wirecutter/feed/' },
  { name: 'RTINGS', url: 'https://www.rtings.com/rss/reviews.xml' },
];

export async function runBenchmark(): Promise<{ tasks: Task[]; newTasksCount: number }> {
  const existingTasks = loadTasks();
  const existingUrls = new Set(existingTasks.map(t => t.sourceUrl));
  const existingTitles = new Set(existingTasks.map(t => t.title.toLowerCase()));

  const newTasks: Task[] = [];

  for (const source of SOURCES) {
    try {
      const feed = await parser.parseURL(source.url);
      for (const item of feed.items || []) {
        if (!item.title || !item.link) continue;
        if (existingUrls.has(item.link)) continue;

        const cleanTitle = item.title.trim();
        const taskTitle = cleanTitle.toLowerCase().startsWith('review:') || cleanTitle.toLowerCase().startsWith('guide:')
          ? cleanTitle
          : `Review: ${cleanTitle}`;

        if (existingTitles.has(taskTitle.toLowerCase())) continue;

        let taskType: Task['type'] = 'review';
        const lowerTitle = cleanTitle.toLowerCase();
        if (lowerTitle.includes('guide') || lowerTitle.includes('best')) {
          taskType = 'guide';
        } else if (lowerTitle.includes('vs') || lowerTitle.includes('compare')) {
          taskType = 'comparison';
        } else if (lowerTitle.includes('news') || lowerTitle.includes('deal')) {
          taskType = 'news';
        }

        const newTask: Task = {
          id: crypto.randomUUID(),
          title: taskTitle,
          description: `Benchmark task generated from ${source.name} article: "${cleanTitle}". Analyze competitor coverage, product recommendations, and positioning.`,
          type: taskType,
          status: 'pending',
          sourceUrl: item.link,
          competitor: source.name,
          createdAt: item.isoDate || new Date().toISOString(),
        };

        newTasks.push(newTask);
        existingUrls.add(item.link);
        existingTitles.add(taskTitle.toLowerCase());
      }
    } catch (err: unknown) {
      console.warn(`Failed to fetch/parse feed for ${source.name} (${source.url}):`, err instanceof Error ? err.message : err);
    }
  }

  const allTasks = [...newTasks, ...existingTasks];
  if (newTasks.length > 0) {
    saveTasks(allTasks);
  }

  return {
    tasks: allTasks,
    newTasksCount: newTasks.length,
  };
}
