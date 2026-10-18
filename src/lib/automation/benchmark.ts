import fs from 'fs';
import path from 'path';
import crypto from 'crypto';
import Parser from 'rss-parser';
import { Task, TaskStatus } from '@/types';

const DATA_PATH = path.join(process.cwd(), 'data', 'tasks.json');

const parser = new Parser({
  headers: {
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
    'Accept': 'application/rss+xml, application/xml, text/xml;q=0.9, */*;q=0.8',
  },
  timeout: 5000,
});

const COMPETITOR_FEEDS = [
  { name: 'Wirecutter', url: 'https://www.nytimes.com/wirecutter/feed/' },
  { name: 'RTINGS', url: 'https://www.rtings.com/rss/reviews.xml' },
];

const FALLBACK_TOPICS = [
  {
    title: 'Review: The Best Wireless Noise-Canceling Headphones of 2025',
    description: 'Competitive analysis identified high US buyer interest in updated noise-canceling headphones reviews.',
    source: 'Wirecutter Benchmark',
    competitorUrl: 'https://www.nytimes.com/wirecutter/reviews/best-wireless-noise-canceling-headphones/',
  },
  {
    title: 'Review: The Best OLED TVs for Gaming and Home Theater',
    description: 'US competitor RTINGS published updated OLED display benchmarks and calibration ratings.',
    source: 'RTINGS Benchmark',
    competitorUrl: 'https://www.rtings.com/tv/reviews/best/by-type/oled',
  },
  {
    title: 'Review: The Best Ergonomic Office Chairs for Home Offices',
    description: 'Benchmarked top US competitor buyer guides to cover trending ergonomic office seating options.',
    source: 'Wirecutter Benchmark',
    competitorUrl: 'https://www.nytimes.com/wirecutter/reviews/best-office-chair/',
  },
  {
    title: 'Review: The Best Robot Vacuums for Pet Hair',
    description: 'Identified content gap in smart home cleaning category compared to major US review sites.',
    source: 'US Competitor Analysis',
    competitorUrl: 'https://www.nytimes.com/wirecutter/reviews/best-robot-vacuum/',
  },
];

function saveData(filePath: string, data: unknown): void {
  try {
    const dir = path.dirname(filePath);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    fs.writeFileSync(filePath, JSON.stringify(data, null, 2), 'utf-8');
  } catch (err) {
    if (err instanceof Error) {
      const nodeErr = err as NodeJS.ErrnoException;
      if (nodeErr.code === 'EROFS') {
        console.warn('Read-only filesystem detected. Unable to write task data to file.');
        return;
      }
    }
    console.error('Error saving task data:', err);
  }
}

export function getTasks(): Task[] {
  try {
    if (fs.existsSync(DATA_PATH)) {
      const content = fs.readFileSync(DATA_PATH, 'utf-8');
      return JSON.parse(content) as Task[];
    }
  } catch (err) {
    console.error('Error reading tasks file:', err);
  }
  return [];
}

export function saveTasks(tasks: Task[]): void {
  saveData(DATA_PATH, tasks);
}

export function updateTaskStatusInFile(taskId: string, status: TaskStatus): Task | null {
  const tasks = getTasks();
  const taskIndex = tasks.findIndex(t => t.id === taskId);
  if (taskIndex === -1) return null;

  tasks[taskIndex].status = status;
  tasks[taskIndex].updatedAt = new Date().toISOString();
  saveTasks(tasks);
  return tasks[taskIndex];
}

export async function runBenchmark(): Promise<{ added: number; tasks: Task[] }> {
  const existingTasks = getTasks();
  const existingTitles = new Set(existingTasks.map(t => t.title.toLowerCase()));
  const newTasks: Task[] = [];
  const now = new Date().toISOString();

  for (const feedConfig of COMPETITOR_FEEDS) {
    try {
      const feed = await parser.parseURL(feedConfig.url);
      if (feed && feed.items && feed.items.length > 0) {
        for (const item of feed.items.slice(0, 3)) {
          if (!item.title) continue;
          const cleanTitle = item.title.replace(/^Review:\s*/i, '').trim();
          const taskTitle = `Review: ${cleanTitle}`;
          if (existingTitles.has(taskTitle.toLowerCase())) continue;

          existingTitles.add(taskTitle.toLowerCase());
          newTasks.push({
            id: crypto.randomUUID(),
            title: taskTitle,
            description: item.contentSnippet || item.summary || `Automated task generated from ${feedConfig.name} feed benchmarking.`,
            source: feedConfig.name,
            competitorUrl: item.link,
            status: 'pending',
            createdAt: now,
            updatedAt: now,
          });
        }
      }
    } catch (err) {
      console.warn(`Failed to fetch RSS feed for ${feedConfig.name}:`, err);
    }
  }

  // Fallback generation if no new tasks were parsed from RSS
  if (newTasks.length === 0) {
    for (const fallback of FALLBACK_TOPICS) {
      if (!existingTitles.has(fallback.title.toLowerCase())) {
        existingTitles.add(fallback.title.toLowerCase());
        newTasks.push({
          id: crypto.randomUUID(),
          title: fallback.title,
          description: fallback.description,
          source: fallback.source,
          competitorUrl: fallback.competitorUrl,
          status: 'pending',
          createdAt: now,
          updatedAt: now,
        });
      }
    }
  }

  const updatedTasks = [...newTasks, ...existingTasks];
  saveTasks(updatedTasks);

  return {
    added: newTasks.length,
    tasks: updatedTasks,
  };
}
