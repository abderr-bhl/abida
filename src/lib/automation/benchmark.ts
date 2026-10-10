import crypto from 'crypto';
import fs from 'fs';
import path from 'path';
import Parser from 'rss-parser';

export interface Task {
  id: string;
  title: string;
  description: string;
  source: string;
  sourceUrl?: string;
  createdAt: string;
  status: 'pending' | 'in_progress' | 'completed';
}

const DATA_DIR = path.join(process.cwd(), 'data');
const TASKS_FILE = path.join(DATA_DIR, 'tasks.json');

const FALLBACK_BENCHMARKS = [
  {
    title: 'Review: The Best Noise-Canceling Headphones for 2025',
    description: 'Benchmark competitor review of top wireless ANC headphones including Sony WH-1000XM5 and Bose QuietComfort Ultra.',
    source: 'Wirecutter Fallback',
    sourceUrl: 'https://www.nytimes.com/wirecutter/reviews/best-noise-cancelling-headphones/',
  },
  {
    title: 'Review: Top 4K OLED Gaming Monitors Comparison',
    description: 'Benchmark competitor review analyzing 4K OLED high refresh rate gaming monitors.',
    source: 'RTINGS Fallback',
    sourceUrl: 'https://www.rtings.com/monitor/reviews/best/by-usage/gaming',
  },
  {
    title: 'Review: Best Budget Robot Vacuums',
    description: 'Benchmark competitor testing of smart budget robot vacuums for hardwood and carpet floors.',
    source: 'Wirecutter Fallback',
    sourceUrl: 'https://www.nytimes.com/wirecutter/reviews/best-robot-vacuum/',
  },
];

export async function getTasks(): Promise<Task[]> {
  try {
    if (!fs.existsSync(TASKS_FILE)) {
      return [];
    }
    const rawData = fs.readFileSync(TASKS_FILE, 'utf-8');
    const parsed: unknown = JSON.parse(rawData);
    if (Array.isArray(parsed)) {
      return parsed as Task[];
    }
    return [];
  } catch (error) {
    const err = error as NodeJS.ErrnoException;
    if (err.code === 'EROFS') {
      console.warn('Read-only filesystem encountered when reading tasks.');
    } else {
      console.error('Error reading tasks file:', error);
    }
    return [];
  }
}

export async function saveTasks(tasks: Task[]): Promise<boolean> {
  try {
    if (!fs.existsSync(DATA_DIR)) {
      fs.mkdirSync(DATA_DIR, { recursive: true });
    }
    fs.writeFileSync(TASKS_FILE, JSON.stringify(tasks, null, 2), 'utf-8');
    return true;
  } catch (error) {
    const err = error as NodeJS.ErrnoException;
    if (err.code === 'EROFS') {
      console.warn('Read-only filesystem encountered when saving tasks.');
    } else {
      console.error('Error saving tasks file:', error);
    }
    return false;
  }
}

export async function runBenchmark(): Promise<{ added: number; tasks: Task[] }> {
  const existingTasks = await getTasks();
  const existingTitles = new Set(existingTasks.map((t) => t.title.toLowerCase()));
  const newTasks: Task[] = [];

  const parser = new Parser({
    headers: {
      'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
    },
    timeout: 5000,
  });

  const feeds = [
    { name: 'Wirecutter', url: 'https://www.nytimes.com/wirecutter/feed/' },
    { name: 'RTINGS', url: 'https://www.rtings.com/rss/reviews.xml' },
  ];

  for (const feedConfig of feeds) {
    try {
      const feed = await parser.parseURL(feedConfig.url);
      if (feed.items && feed.items.length > 0) {
        for (const item of feed.items.slice(0, 5)) {
          const rawTitle = item.title?.trim() || 'Untitled Competitor Article';
          const taskTitle = rawTitle.toLowerCase().startsWith('review:')
            ? rawTitle
            : `Review: ${rawTitle}`;

          if (!existingTitles.has(taskTitle.toLowerCase())) {
            const task: Task = {
              id: crypto.randomUUID(),
              title: taskTitle,
              description: `Automated competitor benchmark task created from ${feedConfig.name}: "${item.snippet || item.contentSnippet || item.title || ''}"`,
              source: feedConfig.name,
              sourceUrl: item.link || item.guid,
              createdAt: new Date().toISOString(),
              status: 'pending',
            };
            newTasks.push(task);
            existingTitles.add(taskTitle.toLowerCase());
          }
        }
      }
    } catch (feedError) {
      console.warn(`Could not fetch RSS feed from ${feedConfig.name}:`, feedError);
    }
  }

  // If no new tasks were fetched from live RSS feeds, use fallbacks to ensure new tasks
  if (newTasks.length === 0) {
    for (const fallback of FALLBACK_BENCHMARKS) {
      if (!existingTitles.has(fallback.title.toLowerCase())) {
        const task: Task = {
          id: crypto.randomUUID(),
          title: fallback.title,
          description: fallback.description,
          source: fallback.source,
          sourceUrl: fallback.sourceUrl,
          createdAt: new Date().toISOString(),
          status: 'pending',
        };
        newTasks.push(task);
        existingTitles.add(fallback.title.toLowerCase());
      }
    }
  }

  const updatedTasks = [...newTasks, ...existingTasks];
  await saveTasks(updatedTasks);

  return {
    added: newTasks.length,
    tasks: updatedTasks,
  };
}

export async function updateTaskStatus(id: string, status: Task['status']): Promise<Task | null> {
  const tasks = await getTasks();
  const taskIndex = tasks.findIndex((t) => t.id === id);
  if (taskIndex === -1) {
    return null;
  }
  tasks[taskIndex].status = status;
  await saveTasks(tasks);
  return tasks[taskIndex];
}
