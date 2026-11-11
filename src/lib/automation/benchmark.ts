import Parser from 'rss-parser';
import fs from 'fs';
import path from 'path';
import crypto from 'crypto';
import { BenchmarkTask } from '@/types';

const parser = new Parser({
  headers: {
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
    'Accept': 'application/rss+xml, application/xml, text/xml, */*'
  },
  timeout: 5000
});

const DATA_FILE = path.join(process.cwd(), 'data', 'tasks.json');

const COMPETITOR_FEEDS = [
  {
    name: 'Wirecutter',
    url: 'https://www.nytimes.com/wirecutter/feed/',
    category: 'Electronics & Home'
  },
  {
    name: 'RTINGS',
    url: 'https://www.rtings.com/rss/reviews.xml',
    category: 'Tech & Audio'
  }
];

const FALLBACK_TOPICS = [
  {
    title: 'Review: Best Air Fryers of 2026',
    description: 'Wirecutter published updated tests on air fryers. Benchmark their top picks and compare pricing with Amazon US offerings.',
    competitor: 'Wirecutter',
    sourceUrl: 'https://www.nytimes.com/wirecutter/reviews/best-air-fryer/',
    category: 'Kitchen & Home',
    priority: 'high' as const
  },
  {
    title: 'Review: Top Noise-Cancelling Headphones Tested',
    description: 'RTINGS updated headphone frequency response and ANC ratings. Create comparison against Sony WH-1000XM5 and Bose QuietComfort Ultra.',
    competitor: 'RTINGS',
    sourceUrl: 'https://www.rtings.com/headphones/reviews/best/by-feature/active-noise-cancelling',
    category: 'Tech & Audio',
    priority: 'high' as const
  },
  {
    title: 'Guide: Best Standing Desks for Home Office',
    description: 'Competitors are driving high traffic to ergonomic workstation reviews. Benchmark uplift desk recommendations for US shoppers.',
    competitor: 'Wirecutter',
    sourceUrl: 'https://www.nytimes.com/wirecutter/reviews/best-standing-desk/',
    category: 'Office & Work',
    priority: 'medium' as const
  }
];

export async function getBenchmarkTasks(): Promise<BenchmarkTask[]> {
  try {
    if (fs.existsSync(DATA_FILE)) {
      const data = fs.readFileSync(DATA_FILE, 'utf-8');
      return JSON.parse(data) as BenchmarkTask[];
    }
  } catch (error) {
    console.error('Error reading benchmark tasks file:', error);
  }
  return [];
}

export async function saveBenchmarkTasks(tasks: unknown): Promise<void> {
  try {
    const dir = path.dirname(DATA_FILE);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    fs.writeFileSync(DATA_FILE, JSON.stringify(tasks, null, 2), 'utf-8');
  } catch (err) {
    if (err instanceof Error) {
      const sysErr = err as NodeJS.ErrnoException;
      if (sysErr.code === 'EROFS') {
        console.warn('Filesystem is read-only. Skipping task persistence to disk.');
        return;
      }
    }
    console.error('Failed to save benchmark tasks:', err);
  }
}

export async function runCompetitorBenchmark(): Promise<{ tasksCreated: number; totalTasks: number; tasks: BenchmarkTask[] }> {
  const existingTasks = await getBenchmarkTasks();
  const existingTitles = new Set(existingTasks.map(t => t.title.toLowerCase()));
  const newTasks: BenchmarkTask[] = [];

  for (const feedConfig of COMPETITOR_FEEDS) {
    try {
      const feed = await parser.parseURL(feedConfig.url);
      const items = feed.items?.slice(0, 5) || [];

      for (const item of items) {
        if (!item.title) continue;
        const taskTitle = `Review: ${item.title.trim()}`;
        if (!existingTitles.has(taskTitle.toLowerCase())) {
          existingTitles.add(taskTitle.toLowerCase());
          const newTask: BenchmarkTask = {
            id: crypto.randomUUID(),
            title: taskTitle,
            description: item.contentSnippet || item.summary || `Automated task generated from ${feedConfig.name} article. Benchmark product lineup and add recommendations.`,
            competitor: feedConfig.name,
            sourceUrl: item.link || '',
            status: 'pending',
            category: feedConfig.category,
            createdAt: new Date().toISOString(),
            priority: 'medium'
          };
          newTasks.push(newTask);
        }
      }
    } catch (feedError) {
      console.warn(`Could not fetch live RSS feed for ${feedConfig.name}:`, (feedError as Error).message);
    }
  }

  // If no new tasks could be retrieved from live RSS feeds (e.g. offline, captcha, or already up to date),
  // inject fallback competitor review topics to ensure task generation works reliably.
  if (newTasks.length === 0 && existingTasks.length === 0) {
    for (const fallback of FALLBACK_TOPICS) {
      if (!existingTitles.has(fallback.title.toLowerCase())) {
        existingTitles.add(fallback.title.toLowerCase());
        newTasks.push({
          id: crypto.randomUUID(),
          title: fallback.title,
          description: fallback.description,
          competitor: fallback.competitor,
          sourceUrl: fallback.sourceUrl,
          status: 'pending',
          category: fallback.category,
          createdAt: new Date().toISOString(),
          priority: fallback.priority
        });
      }
    }
  }

  const updatedTasks = [...newTasks, ...existingTasks];
  await saveBenchmarkTasks(updatedTasks);

  return {
    tasksCreated: newTasks.length,
    totalTasks: updatedTasks.length,
    tasks: updatedTasks
  };
}

export async function updateTaskStatus(taskId: string, status: BenchmarkTask['status']): Promise<BenchmarkTask | null> {
  const tasks = await getBenchmarkTasks();
  const index = tasks.findIndex(t => t.id === taskId);
  if (index === -1) return null;

  tasks[index].status = status;
  await saveBenchmarkTasks(tasks);
  return tasks[index];
}
