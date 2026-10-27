import Parser from 'rss-parser';
import fs from 'fs';
import path from 'path';
import crypto from 'crypto';

export interface Task {
  id: string;
  title: string;
  description: string;
  source: string;
  sourceUrl?: string;
  createdAt: string;
  status: 'pending' | 'in-progress' | 'completed' | 'dismissed';
}

const DATA_DIR = path.join(process.cwd(), 'data');
const TASKS_FILE = path.join(DATA_DIR, 'tasks.json');

const FEEDS = [
  { name: 'Wirecutter', url: 'https://www.nytimes.com/wirecutter/feed/' },
  { name: 'RTINGS', url: 'https://www.rtings.com/rss/reviews.xml' },
];

const FALLBACK_TOPICS = [
  {
    title: 'Review: Best Noise-Canceling Headphones of 2025',
    description: 'Wirecutter recently updated their top noise-canceling headphone picks. Evaluate sound quality, ANC effectiveness, and battery life against competitor rankings.',
    source: 'Wirecutter (Fallback)',
    sourceUrl: 'https://www.nytimes.com/wirecutter/reviews/best-noise-canceling-headphones/',
  },
  {
    title: 'Review: Best OLED TVs for Gaming and Movies',
    description: 'RTINGS released updated laboratory testing scores for LG and Sony OLED lineups. Compare contrast, peak brightness, and input lag metrics.',
    source: 'RTINGS (Fallback)',
    sourceUrl: 'https://www.rtings.com/tv/reviews/best/by-features/oled',
  },
  {
    title: 'Review: Best Robot Vacuums for Pet Hair',
    description: 'Competitor content analysis shows high search volume for self-emptying robot vacuums. Benchmark navigation and suction power benchmarks.',
    source: 'Wirecutter (Fallback)',
    sourceUrl: 'https://www.nytimes.com/wirecutter/reviews/best-robot-vacuum/',
  },
];

export async function getStoredTasks(): Promise<Task[]> {
  try {
    if (!fs.existsSync(TASKS_FILE)) {
      return [];
    }
    const raw = fs.readFileSync(TASKS_FILE, 'utf-8');
    return JSON.parse(raw) as Task[];
  } catch (error) {
    console.warn('Error reading tasks file:', error);
    return [];
  }
}

export async function saveTasks(tasks: Task[]): Promise<void> {
  try {
    if (!fs.existsSync(DATA_DIR)) {
      fs.mkdirSync(DATA_DIR, { recursive: true });
    }
    fs.writeFileSync(TASKS_FILE, JSON.stringify(tasks, null, 2), 'utf-8');
  } catch (error: unknown) {
    if (error instanceof Error && (error as NodeJS.ErrnoException).code === 'EROFS') {
      console.warn('Read-only filesystem encountered (EROFS), skipping task write.');
    } else {
      console.error('Failed to save tasks:', error);
    }
  }
}

export async function runBenchmarkEngine(): Promise<{ addedCount: number; totalCount: number }> {
  const existingTasks = await getStoredTasks();
  const parser = new Parser({
    headers: {
      'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
    },
    timeout: 5000,
  });

  const newTasks: Task[] = [];

  for (const feedConfig of FEEDS) {
    try {
      const feed = await parser.parseURL(feedConfig.url);
      const items = feed.items.slice(0, 5);

      for (const item of items) {
        if (!item.title) continue;

        const rawTitle = item.title.trim();
        const title = rawTitle.toLowerCase().startsWith('review:')
          ? rawTitle
          : `Review: ${rawTitle}`;

        const duplicate = existingTasks.some(
          t => t.title.toLowerCase() === title.toLowerCase() || (t.sourceUrl && t.sourceUrl === item.link)
        ) || newTasks.some(
          t => t.title.toLowerCase() === title.toLowerCase() || (t.sourceUrl && t.sourceUrl === item.link)
        );

        if (!duplicate) {
          newTasks.push({
            id: crypto.randomUUID(),
            title,
            description: item.contentSnippet || item.content || `Competitor review published on ${feedConfig.name}. Analyze and update content strategy.`,
            source: feedConfig.name,
            sourceUrl: item.link,
            createdAt: new Date().toISOString(),
            status: 'pending',
          });
        }
      }
    } catch (err) {
      console.warn(`Failed to fetch RSS feed from ${feedConfig.name}:`, err);
    }
  }

  // If no new tasks were fetched from live feeds due to network/captcha issues, load fallback topics
  if (newTasks.length === 0) {
    for (const fallback of FALLBACK_TOPICS) {
      const duplicate = existingTasks.some(t => t.title.toLowerCase() === fallback.title.toLowerCase());
      if (!duplicate) {
        newTasks.push({
          id: crypto.randomUUID(),
          title: fallback.title,
          description: fallback.description,
          source: fallback.source,
          sourceUrl: fallback.sourceUrl,
          createdAt: new Date().toISOString(),
          status: 'pending',
        });
      }
    }
  }

  const updatedTasks = [...newTasks, ...existingTasks];
  await saveTasks(updatedTasks);

  return {
    addedCount: newTasks.length,
    totalCount: updatedTasks.length,
  };
}

export async function updateTaskStatusInStore(taskId: string, status: Task['status']): Promise<Task[]> {
  const tasks = await getStoredTasks();
  const updated = tasks.map(task => (task.id === taskId ? { ...task, status } : task));
  await saveTasks(updated);
  return updated;
}
