import Parser from 'rss-parser';
import crypto from 'crypto';
import fs from 'fs';
import path from 'path';

export interface Task {
  id: string;
  title: string;
  description: string;
  status: 'pending' | 'in_progress' | 'completed';
  sourceUrl?: string;
  competitor: string;
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

export function getTasks(): Task[] {
  try {
    if (fs.existsSync(TASKS_FILE)) {
      const data = fs.readFileSync(TASKS_FILE, 'utf-8');
      return JSON.parse(data) as Task[];
    }
  } catch (error) {
    if (error instanceof Error && (error as NodeJS.ErrnoException).code === 'EROFS') {
      console.warn('Read-only filesystem, returning empty tasks list or fallback.');
    } else {
      console.error('Error reading tasks file:', error);
    }
  }
  return [];
}

export function saveTasks(tasks: unknown): boolean {
  try {
    if (!fs.existsSync(DATA_DIR)) {
      fs.mkdirSync(DATA_DIR, { recursive: true });
    }
    fs.writeFileSync(TASKS_FILE, JSON.stringify(tasks, null, 2), 'utf-8');
    return true;
  } catch (error) {
    if (error instanceof Error && (error as NodeJS.ErrnoException).code === 'EROFS') {
      console.warn('Read-only filesystem: tasks cannot be written to disk.');
    } else {
      console.error('Error writing tasks file:', error);
    }
    return false;
  }
}

export async function runBenchmark(): Promise<{ addedTasksCount: number; totalTasksCount: number }> {
  const existingTasks = getTasks();
  const existingTitles = new Set(existingTasks.map(t => t.title.toLowerCase()));
  const newTasks: Task[] = [];

  const feeds = [
    { competitor: 'Wirecutter', url: 'https://www.nytimes.com/wirecutter/feed/' },
    { competitor: 'RTINGS', url: 'https://www.rtings.com/rss/reviews.xml' },
  ];

  for (const feedConfig of feeds) {
    try {
      const feed = await parser.parseURL(feedConfig.url);
      for (const item of feed.items || []) {
        if (!item.title) continue;

        const cleanTitle = item.title.trim();
        const taskTitle = cleanTitle.toLowerCase().includes('review') || cleanTitle.toLowerCase().includes('guide')
          ? cleanTitle
          : `Review: ${cleanTitle}`;

        if (!existingTitles.has(taskTitle.toLowerCase())) {
          existingTitles.add(taskTitle.toLowerCase());
          const task: Task = {
            id: crypto.randomUUID(),
            title: taskTitle,
            description: `Automated content task identified from ${feedConfig.competitor}. Content gap: "${cleanTitle}". Analyze competitor coverage and create matching US buyer guide or review.`,
            status: 'pending',
            sourceUrl: item.link,
            competitor: feedConfig.competitor,
            createdAt: new Date().toISOString(),
          };
          newTasks.push(task);
        }
      }
    } catch (error) {
      console.warn(`Could not fetch or parse RSS feed for ${feedConfig.competitor}:`, error instanceof Error ? error.message : error);
    }
  }

  // Fallback / mock content gap if RSS feeds fail or yield no new items on initial run
  if (existingTasks.length === 0 && newTasks.length === 0) {
    const fallbackItems = [
      {
        competitor: 'Wirecutter',
        title: 'Review: Best Noise-Canceling Headphones for Travel 2025',
        description: 'Automated content task identified from Wirecutter. Content gap: "Best Noise-Canceling Headphones". Analyze competitor coverage and create matching US buyer guide.',
        sourceUrl: 'https://www.nytimes.com/wirecutter/reviews/best-noise-canceling-headphones/',
      },
      {
        competitor: 'RTINGS',
        title: 'Review: The 5 Best 4K Gaming Monitors - Spring 2025',
        description: 'Automated content task identified from RTINGS. Content gap: "Best 4K Gaming Monitors". Benchmark competitor testing metrics and generate comparison page.',
        sourceUrl: 'https://www.rtings.com/monitor/reviews/best/by-usage/gaming',
      },
    ];

    for (const fb of fallbackItems) {
      newTasks.push({
        id: crypto.randomUUID(),
        title: fb.title,
        description: fb.description,
        status: 'pending',
        sourceUrl: fb.sourceUrl,
        competitor: fb.competitor,
        createdAt: new Date().toISOString(),
      });
    }
  }

  const updatedTasks = [...newTasks, ...existingTasks];
  saveTasks(updatedTasks);

  return {
    addedTasksCount: newTasks.length,
    totalTasksCount: updatedTasks.length,
  };
}

export function updateTaskStatusInStore(id: string, status: 'pending' | 'in_progress' | 'completed'): Task | null {
  const tasks = getTasks();
  const index = tasks.findIndex(t => t.id === id);
  if (index === -1) return null;

  tasks[index].status = status;
  saveTasks(tasks);
  return tasks[index];
}
