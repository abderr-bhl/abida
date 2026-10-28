import fs from 'fs';
import path from 'path';
import crypto from 'crypto';
import Parser from 'rss-parser';

export interface BenchmarkTask {
  id: string;
  title: string;
  description: string;
  competitor: string;
  sourceUrl: string;
  status: 'pending' | 'in_progress' | 'completed';
  createdAt: string;
}

const DATA_DIR = path.join(process.cwd(), 'data');
const TASKS_FILE = path.join(DATA_DIR, 'tasks.json');

const parser = new Parser({
  headers: {
    'User-Agent':
      'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
  },
  timeout: 5000,
});

const FALLBACK_TOPICS = [
  {
    title: 'Review: Best Wireless Noise-Canceling Headphones of 2025',
    description: 'Competitive analysis of top wireless headphones in the US market.',
    competitor: 'Wirecutter',
    sourceUrl: 'https://www.nytimes.com/wirecutter/reviews/best-wireless-headphones/',
  },
  {
    title: 'Review: Top 4K OLED TVs for Gaming & Home Theater',
    description: 'Benchmark evaluation of recent 4K OLED TV testing results.',
    competitor: 'RTINGS',
    sourceUrl: 'https://www.rtings.com/tv/reviews/best/by-features/oled',
  },
  {
    title: 'Guide: Best Robot Vacuum Cleaners for Pet Hair',
    description: 'Detailed competitive breakdown on robotic vacuum cleaners.',
    competitor: 'Wirecutter',
    sourceUrl: 'https://www.nytimes.com/wirecutter/reviews/best-robot-vacuum/',
  },
];

function ensureDataDir(): void {
  try {
    if (!fs.existsSync(DATA_DIR)) {
      fs.mkdirSync(DATA_DIR, { recursive: true });
    }
  } catch (error: unknown) {
    if (error instanceof Error && (error as NodeJS.ErrnoException).code === 'EROFS') {
      console.warn('Warning: Read-only filesystem encountered (EROFS). Skipping directory creation.');
    } else {
      console.warn('Warning creating data directory:', error);
    }
  }
}

export function getTasks(): BenchmarkTask[] {
  try {
    ensureDataDir();
    if (fs.existsSync(TASKS_FILE)) {
      const data = fs.readFileSync(TASKS_FILE, 'utf-8');
      return JSON.parse(data) as BenchmarkTask[];
    }
  } catch (error: unknown) {
    if (error instanceof Error && (error as NodeJS.ErrnoException).code === 'EROFS') {
      console.warn('Warning: Read-only filesystem encountered (EROFS). Returning empty task list.');
    } else {
      console.warn('Warning reading tasks:', error);
    }
  }
  return [];
}

export function saveTasks(tasks: BenchmarkTask[]): boolean {
  try {
    ensureDataDir();
    fs.writeFileSync(TASKS_FILE, JSON.stringify(tasks, null, 2), 'utf-8');
    return true;
  } catch (error: unknown) {
    if (error instanceof Error && (error as NodeJS.ErrnoException).code === 'EROFS') {
      console.warn('Warning: Read-only filesystem encountered (EROFS). Task changes not saved to disk.');
      return false;
    }
    console.warn('Warning saving tasks:', error);
    return false;
  }
}

export async function runBenchmark(): Promise<{ added: number; total: number }> {
  const existingTasks = getTasks();
  const existingUrls = new Set(existingTasks.map((t) => t.sourceUrl));
  const newTasks: BenchmarkTask[] = [];

  const feeds = [
    { name: 'Wirecutter', url: 'https://www.nytimes.com/wirecutter/feed/' },
    { name: 'RTINGS', url: 'https://www.rtings.com/rss/reviews.xml' },
  ];

  for (const feedConfig of feeds) {
    try {
      const feed = await parser.parseURL(feedConfig.url);
      if (feed && feed.items) {
        for (const item of feed.items) {
          const itemUrl = item.link || item.guid;
          if (itemUrl && !existingUrls.has(itemUrl)) {
            existingUrls.add(itemUrl);
            const title = item.title ? `Review: ${item.title}` : `Review: New content from ${feedConfig.name}`;
            newTasks.push({
              id: crypto.randomUUID(),
              title,
              description: item.contentSnippet || item.summary || `Automated benchmark task created from ${feedConfig.name}.`,
              competitor: feedConfig.name,
              sourceUrl: itemUrl,
              status: 'pending',
              createdAt: new Date().toISOString(),
            });
          }
        }
      }
    } catch (err) {
      console.warn(`Could not parse feed for ${feedConfig.name}:`, err);
    }
  }

  // Fallback if no tasks gathered from feeds or if feeds fail/return captcha
  if (newTasks.length === 0 && existingTasks.length === 0) {
    for (const fb of FALLBACK_TOPICS) {
      if (!existingUrls.has(fb.sourceUrl)) {
        existingUrls.add(fb.sourceUrl);
        newTasks.push({
          id: crypto.randomUUID(),
          title: fb.title,
          description: fb.description,
          competitor: fb.competitor,
          sourceUrl: fb.sourceUrl,
          status: 'pending',
          createdAt: new Date().toISOString(),
        });
      }
    }
  }

  const updatedTasks = [...newTasks, ...existingTasks];
  saveTasks(updatedTasks);

  return { added: newTasks.length, total: updatedTasks.length };
}
