import fs from 'fs';
import path from 'path';
import crypto from 'crypto';
import Parser from 'rss-parser';

export interface Task {
  id: string;
  title: string;
  description: string;
  status: 'pending' | 'in_progress' | 'completed';
  createdAt: string;
  competitor: string;
  sourceUrl?: string;
}

const DATA_DIR = path.join(process.cwd(), 'data');
const TASKS_FILE = path.join(DATA_DIR, 'tasks.json');

const parser = new Parser({
  headers: {
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
  },
  timeout: 5000,
});

export function getTasks(): Task[] {
  try {
    if (!fs.existsSync(TASKS_FILE)) {
      return [];
    }
    const raw = fs.readFileSync(TASKS_FILE, 'utf-8');
    return JSON.parse(raw) as Task[];
  } catch (error) {
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
  } catch (error) {
    if (error instanceof Error && (error as NodeJS.ErrnoException).code === 'EROFS') {
      console.warn('Read-only filesystem encountered when saving tasks:', error);
    } else {
      console.error('Failed to save tasks:', error);
    }
  }
}

export async function runBenchmark(): Promise<Task[]> {
  const existingTasks = getTasks();
  const existingTitles = new Set(existingTasks.map(t => t.title.toLowerCase()));
  const newTasks: Task[] = [];

  const sources = [
    { name: 'Wirecutter', url: 'https://www.nytimes.com/wirecutter/feed/' },
    { name: 'RTINGS', url: 'https://www.rtings.com/rss/reviews.xml' },
  ];

  for (const source of sources) {
    try {
      const feed = await parser.parseURL(source.url);
      const items = feed.items || [];

      for (const item of items.slice(0, 5)) {
        if (!item.title) continue;

        const taskTitle = `Review: ${item.title.trim()}`;
        if (!existingTitles.has(taskTitle.toLowerCase())) {
          existingTitles.add(taskTitle.toLowerCase());
          newTasks.push({
            id: crypto.randomUUID(),
            title: taskTitle,
            description: item.contentSnippet || item.summary || `Competitive analysis task based on ${source.name} publication: ${item.title}`,
            status: 'pending',
            createdAt: new Date().toISOString(),
            competitor: source.name,
            sourceUrl: item.link,
          });
        }
      }
    } catch (error) {
      console.warn(`Failed to parse feed for ${source.name}:`, error);
    }
  }

  // Fallbacks if RSS feeds fail or return no new items
  if (newTasks.length === 0) {
    const fallbacks = [
      {
        title: 'Review: Best Wireless Noise-Canceling Headphones 2025',
        description: 'Analyze Wirecutter and RTINGS top recommendations for noise-canceling headphones to produce an updated US buyer guide.',
        competitor: 'Wirecutter Benchmark Fallback',
        sourceUrl: 'https://www.nytimes.com/wirecutter/reviews/best-wireless-noise-canceling-headphones/',
      },
      {
        title: 'Review: Best OLED TVs for Gaming and Home Theater',
        description: 'Benchmarking latest OLED TV tests against RTINGS specs to refine ReviewGuid product recommendations.',
        competitor: 'RTINGS Benchmark Fallback',
        sourceUrl: 'https://www.rtings.com/tv/reviews/best/by-type/oled',
      },
      {
        title: 'Review: Best Robot Vacuums for Hardwood Floors',
        description: 'Competitive review task derived from recent US tech blog feature matrix.',
        competitor: 'Wirecutter Benchmark Fallback',
        sourceUrl: 'https://www.nytimes.com/wirecutter/reviews/best-robot-vacuum/',
      },
    ];

    for (const fb of fallbacks) {
      if (!existingTitles.has(fb.title.toLowerCase())) {
        existingTitles.add(fb.title.toLowerCase());
        newTasks.push({
          id: crypto.randomUUID(),
          title: fb.title,
          description: fb.description,
          status: 'pending',
          createdAt: new Date().toISOString(),
          competitor: fb.competitor,
          sourceUrl: fb.sourceUrl,
        });
      }
    }
  }

  const updatedTasks = [...newTasks, ...existingTasks];
  saveTasks(updatedTasks);
  return updatedTasks;
}

export function updateTaskStatus(taskId: string, status: Task['status']): Task[] {
  const tasks = getTasks();
  const index = tasks.findIndex(t => t.id === taskId);
  if (index !== -1) {
    tasks[index].status = status;
    saveTasks(tasks);
  }
  return tasks;
}
