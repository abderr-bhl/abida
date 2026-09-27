import Parser from 'rss-parser';
import * as fs from 'fs';
import * as path from 'path';
import { randomUUID } from 'crypto';
import { BenchmarkTask, TaskStatus } from '@/types/task';

const DATA_DIR = path.join(process.cwd(), 'data');
const TASKS_FILE = path.join(DATA_DIR, 'tasks.json');

const parser = new Parser({
  headers: {
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
    'Accept': 'application/rss+xml, application/xml, text/xml, */*'
  },
  timeout: 5000
});

// Fallback topics to guarantee task generation if RSS feeds fail, return 404, or hit captchas
const FALLBACK_BENCHMARKS = [
  {
    title: 'The Best Wireless Noise-Canceling Headphones of 2025',
    description: 'Wirecutter released an updated guide covering active noise cancellation, sound quality, and battery life.',
    competitor: 'Wirecutter',
    category: 'Audio',
    url: 'https://www.nytimes.com/wirecutter/reviews/best-wireless-noise-canceling-headphones/'
  },
  {
    title: 'The 5 Best Robot Vacuums - Spring 2025 Reviews',
    description: 'RTINGS published updated lab testing comparisons for mid-range and premium robot vacuum cleaners.',
    competitor: 'RTINGS',
    category: 'Home Appliances',
    url: 'https://www.rtings.com/robot-vacuum/reviews/best/by-feature/carpet'
  },
  {
    title: 'The Best Smart TV Key Features & OLED Performance',
    description: 'Wirecutter benchmarked the latest 4K OLED and QLED displays for gaming and streaming performance.',
    competitor: 'Wirecutter',
    category: 'Electronics',
    url: 'https://www.nytimes.com/wirecutter/reviews/best-tv/'
  },
  {
    title: 'Best Ergonomic Office Chairs for Home Workspace',
    description: 'RTINGS tested lumbar support, adjustability, and durability for top ergonomic office seating.',
    competitor: 'RTINGS',
    category: 'Office',
    url: 'https://www.rtings.com/office-chair/reviews/best/by-use/ergonomic'
  }
];

export function getTasks(): BenchmarkTask[] {
  try {
    if (!fs.existsSync(TASKS_FILE)) {
      return getInitialDefaultTasks();
    }
    const data = fs.readFileSync(TASKS_FILE, 'utf8');
    const parsed = JSON.parse(data);
    return Array.isArray(parsed) ? parsed : getInitialDefaultTasks();
  } catch (error) {
    if (error instanceof Error) {
      const errnoErr = error as NodeJS.ErrnoException;
      if (errnoErr.code === 'EROFS') {
        console.warn('Read-only filesystem detected, unable to read tasks file.');
      }
    }
    return getInitialDefaultTasks();
  }
}

export function saveTasks(tasks: unknown): boolean {
  try {
    if (!fs.existsSync(DATA_DIR)) {
      fs.mkdirSync(DATA_DIR, { recursive: true });
    }
    fs.writeFileSync(TASKS_FILE, JSON.stringify(tasks, null, 2), 'utf8');
    return true;
  } catch (error) {
    if (error instanceof Error) {
      const errnoErr = error as NodeJS.ErrnoException;
      if (errnoErr.code === 'EROFS') {
        console.warn('Read-only filesystem detected (e.g. Vercel deployment), tasks not saved to disk.');
      }
    }
    return false;
  }
}

function getInitialDefaultTasks(): BenchmarkTask[] {
  return [
    {
      id: 'task-1',
      title: 'Review: Wirecutter Noise-Canceling Headphones Benchmark',
      description: 'Benchmark recent updates from Wirecutter regarding wireless noise-canceling headphones to identify content gaps.',
      competitor: 'Wirecutter',
      category: 'Audio',
      status: 'pending',
      createdAt: new Date().toISOString(),
      url: 'https://www.nytimes.com/wirecutter/reviews/best-wireless-noise-canceling-headphones/'
    },
    {
      id: 'task-2',
      title: 'Review: RTINGS Robot Vacuum Test Data Comparison',
      description: 'Analyze latest RTINGS lab score benchmarks for robot vacuum suction and navigation.',
      competitor: 'RTINGS',
      category: 'Home Appliances',
      status: 'in_progress',
      createdAt: new Date().toISOString(),
      url: 'https://www.rtings.com/robot-vacuum/reviews/best/by-feature/carpet'
    }
  ];
}

export async function runBenchmark(): Promise<{ success: boolean; tasksAdded: number; totalTasks: number }> {
  const existingTasks = getTasks();
  const existingTitles = new Set(existingTasks.map(t => t.title.toLowerCase()));
  const newTasks: BenchmarkTask[] = [];

  const sources = [
    { name: 'Wirecutter', url: 'https://www.nytimes.com/wirecutter/feed/', category: 'Electronics' },
    { name: 'RTINGS', url: 'https://www.rtings.com/rss/reviews.xml', category: 'Tech & Appliances' }
  ];

  for (const source of sources) {
    try {
      const feed = await parser.parseURL(source.url);
      if (feed && feed.items && feed.items.length > 0) {
        for (const item of feed.items.slice(0, 3)) {
          if (!item.title) continue;
          const taskTitle = `Review: ${item.title.trim()}`;
          if (!existingTitles.has(taskTitle.toLowerCase())) {
            existingTitles.add(taskTitle.toLowerCase());
            newTasks.push({
              id: randomUUID(),
              title: taskTitle,
              description: item.contentSnippet || item.summary || `Automated content gap benchmark from ${source.name}.`,
              competitor: source.name,
              category: source.category,
              status: 'pending',
              createdAt: new Date().toISOString(),
              url: item.link || undefined
            });
          }
        }
      }
    } catch {
      // Feed error (404/captcha/network) -> handled gracefully by proceeding to fallbacks
    }
  }

  // If no feed items were parsed, utilize fallback benchmarks
  if (newTasks.length === 0) {
    for (const fallback of FALLBACK_BENCHMARKS) {
      const taskTitle = fallback.title.startsWith('Review:') ? fallback.title : `Review: ${fallback.title}`;
      if (!existingTitles.has(taskTitle.toLowerCase())) {
        existingTitles.add(taskTitle.toLowerCase());
        newTasks.push({
          id: randomUUID(),
          title: taskTitle,
          description: fallback.description,
          competitor: fallback.competitor,
          category: fallback.category,
          status: 'pending',
          createdAt: new Date().toISOString(),
          url: fallback.url
        });
      }
    }
  }

  const updatedTasks = [...newTasks, ...existingTasks];
  saveTasks(updatedTasks);

  return {
    success: true,
    tasksAdded: newTasks.length,
    totalTasks: updatedTasks.length
  };
}

export function updateTaskStatusInStore(taskId: string, status: TaskStatus): boolean {
  const tasks = getTasks();
  const index = tasks.findIndex(t => t.id === taskId);
  if (index === -1) return false;
  tasks[index].status = status;
  saveTasks(tasks);
  return true;
}
