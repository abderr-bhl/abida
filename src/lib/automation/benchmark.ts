import fs from 'fs';
import path from 'path';
import crypto from 'crypto';
import Parser from 'rss-parser';

export interface Task {
  id: string;
  title: string;
  description: string;
  sourceUrl: string;
  competitor: string;
  status: 'pending' | 'in_progress' | 'completed' | 'cancelled';
  createdAt: string;
  updatedAt: string;
}

const DATA_DIR = path.join(process.cwd(), 'data');
const TASKS_FILE = path.join(DATA_DIR, 'tasks.json');

const parser = new Parser({
  headers: {
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
    'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8'
  },
  timeout: 8000
});

const RSS_FEEDS = [
  { competitor: 'Wirecutter', url: 'https://www.nytimes.com/wirecutter/feed/' },
  { competitor: 'RTINGS', url: 'https://www.rtings.com/rss/reviews.xml' },
];

const FALLBACK_TOPICS = [
  {
    competitor: 'Wirecutter',
    title: 'Review: The Best Noise-Canceling Headphones for 2025',
    description: 'Benchmarked from Wirecutter: Detailed evaluation of top wireless noise-canceling headphones including battery life, sound quality, and ANC capability.',
    sourceUrl: 'https://www.nytimes.com/wirecutter/reviews/best-noise-cancelling-headphones/'
  },
  {
    competitor: 'RTINGS',
    title: 'Review: Best 4K OLED TVs - Spring 2025 Benchmarks',
    description: 'Benchmarked from RTINGS: Comprehensive visual and latency testing across leading 55-inch and 65-inch 4K OLED televisions.',
    sourceUrl: 'https://www.rtings.com/tv/reviews/best/by-type/oled'
  },
  {
    competitor: 'Wirecutter',
    title: 'Review: Best Standing Desks and Ergonomic Office Chairs',
    description: 'Benchmarked from Wirecutter: Comparative testing for home office ergonomics, motor stability, and long-term durability.',
    sourceUrl: 'https://www.nytimes.com/wirecutter/reviews/best-standing-desk/'
  }
];

export async function loadTasks(): Promise<Task[]> {
  try {
    if (!fs.existsSync(TASKS_FILE)) {
      return [];
    }
    const content = fs.readFileSync(TASKS_FILE, 'utf-8');
    return JSON.parse(content) as Task[];
  } catch (error) {
    console.warn('Error reading tasks file:', error);
    return [];
  }
}

export async function saveData(tasks: unknown): Promise<boolean> {
  try {
    if (!fs.existsSync(DATA_DIR)) {
      fs.mkdirSync(DATA_DIR, { recursive: true });
    }
    fs.writeFileSync(TASKS_FILE, JSON.stringify(tasks, null, 2), 'utf-8');
    return true;
  } catch (error) {
    const err = error as NodeJS.ErrnoException;
    if (err.code === 'EROFS') {
      console.warn('ReadOnly filesystem warning (EROFS): Skipping file persistence.');
      return false;
    }
    console.error('Error saving tasks:', error);
    return false;
  }
}

export async function runBenchmark(useFallbacksOnFailure = true): Promise<{ addedCount: number; tasks: Task[] }> {
  const existingTasks = await loadTasks();
  const existingUrls = new Set(existingTasks.map(t => t.sourceUrl));
  const existingTitles = new Set(existingTasks.map(t => t.title.toLowerCase()));

  const newTasks: Task[] = [];

  for (const feedConfig of RSS_FEEDS) {
    try {
      const feed = await parser.parseURL(feedConfig.url);
      if (feed && feed.items) {
        for (const item of feed.items) {
          if (!item.link || !item.title) continue;

          if (!existingUrls.has(item.link) && !existingTitles.has(`review: ${item.title.toLowerCase()}`)) {
            const now = new Date().toISOString();
            const formattedTitle = item.title.toLowerCase().startsWith('review:')
              ? item.title
              : `Review: ${item.title}`;

            const task: Task = {
              id: crypto.randomUUID(),
              title: formattedTitle,
              description: item.contentSnippet || item.summary || `Benchmarked from ${feedConfig.competitor}: High-value content gap analysis.`,
              sourceUrl: item.link,
              competitor: feedConfig.competitor,
              status: 'pending',
              createdAt: now,
              updatedAt: now,
            };

            newTasks.push(task);
            existingUrls.add(item.link);
            existingTitles.add(formattedTitle.toLowerCase());
          }
        }
      }
    } catch (feedError) {
      console.warn(`Failed to fetch RSS feed for ${feedConfig.competitor}:`, feedError);
    }
  }

  // Fallbacks logic if no new tasks fetched or if requested
  if (newTasks.length === 0 && useFallbacksOnFailure) {
    const now = new Date().toISOString();
    for (const fallback of FALLBACK_TOPICS) {
      if (!existingUrls.has(fallback.sourceUrl) && !existingTitles.has(fallback.title.toLowerCase())) {
        const task: Task = {
          id: crypto.randomUUID(),
          title: fallback.title,
          description: fallback.description,
          sourceUrl: fallback.sourceUrl,
          competitor: fallback.competitor,
          status: 'pending',
          createdAt: now,
          updatedAt: now,
        };
        newTasks.push(task);
        existingUrls.add(fallback.sourceUrl);
        existingTitles.add(fallback.title.toLowerCase());
      }
    }
  }

  const updatedTasks = [...newTasks, ...existingTasks];
  if (newTasks.length > 0) {
    await saveData(updatedTasks);
  }

  return { addedCount: newTasks.length, tasks: updatedTasks };
}

export async function updateTaskStatus(taskId: string, status: Task['status']): Promise<Task[]> {
  const tasks = await loadTasks();
  const index = tasks.findIndex(t => t.id === taskId);
  if (index !== -1) {
    tasks[index].status = status;
    tasks[index].updatedAt = new Date().toISOString();
    await saveData(tasks);
  }
  return tasks;
}
