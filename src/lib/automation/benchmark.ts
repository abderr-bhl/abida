import crypto from 'crypto';
import fs from 'fs';
import path from 'path';
import Parser from 'rss-parser';
import { Task } from '@/types';

const DATA_DIR = path.join(process.cwd(), 'data');
const TASKS_FILE = path.join(DATA_DIR, 'tasks.json');

const FALLBACK_COMPETITOR_TOPICS = [
  {
    title: 'Review: The Best Noise-Canceling Headphones for 2025',
    description: 'Comprehensive review of top wireless ANC headphones competing with Wirecutter top picks.',
    category: 'Electronics',
    targetKeyword: 'best noise canceling headphones',
    sourceUrl: 'https://www.nytimes.com/wirecutter/reviews/best-noise-cancelling-headphones/',
    competitor: 'Wirecutter',
  },
  {
    title: 'Review: The Best OLED TVs for Gaming and Movies',
    description: 'Detailed analysis of latest 4K OLED panels based on RTINGS test methodology.',
    category: 'Home Entertainment',
    targetKeyword: 'best oled tv',
    sourceUrl: 'https://www.rtings.com/tv/reviews/best/by-type/oled',
    competitor: 'RTINGS',
  },
  {
    title: 'Review: The Best Ergonomic Office Chairs',
    description: 'In-depth evaluation of lumbar support and adjustability in premium office chairs.',
    category: 'Office',
    targetKeyword: 'best ergonomic office chair',
    sourceUrl: 'https://www.nytimes.com/wirecutter/reviews/best-office-chair/',
    competitor: 'Wirecutter',
  },
  {
    title: 'Review: The Best Robot Vacuums for Pet Hair',
    description: 'Performance benchmark for automated vacuum cleaners on carpet and hard floor.',
    category: 'Home Appliance',
    targetKeyword: 'best robot vacuum pet hair',
    sourceUrl: 'https://www.rtings.com/robot-vacuum/reviews/best/by-use/pet-hair',
    competitor: 'RTINGS',
  },
];

function serializeData(data: unknown): string {
  return JSON.stringify(data, null, 2);
}

export function loadTasks(): Task[] {
  try {
    if (!fs.existsSync(TASKS_FILE)) {
      return [];
    }
    const raw = fs.readFileSync(TASKS_FILE, 'utf-8');
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? (parsed as Task[]) : [];
  } catch (err) {
    if (err instanceof Error) {
      const nodeErr = err as NodeJS.ErrnoException;
      console.warn('Warning: Unable to read tasks file:', nodeErr.message);
    }
    return [];
  }
}

export function saveTasks(tasks: Task[]): boolean {
  try {
    if (!fs.existsSync(DATA_DIR)) {
      fs.mkdirSync(DATA_DIR, { recursive: true });
    }
    fs.writeFileSync(TASKS_FILE, serializeData(tasks), 'utf-8');
    return true;
  } catch (err) {
    if (err instanceof Error) {
      const nodeErr = err as NodeJS.ErrnoException;
      if (nodeErr.code === 'EROFS') {
        console.warn('Warning: Read-only filesystem. Tasks not saved to disk.');
      } else {
        console.error('Error writing tasks file:', nodeErr.message);
      }
    }
    return false;
  }
}

export interface BenchmarkResult {
  success: boolean;
  count: number;
  tasks: Task[];
  message: string;
}

export async function runBenchmark(): Promise<BenchmarkResult> {
  const existingTasks = loadTasks();
  const existingUrls = new Set(existingTasks.map((t) => t.sourceUrl).filter(Boolean));
  const existingTitles = new Set(existingTasks.map((t) => t.title.toLowerCase()));

  const newTasks: Task[] = [];
  const parser = new Parser({
    headers: {
      'User-Agent':
        'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
    },
    timeout: 5000,
  });

  // Wirecutter Feed
  try {
    const wirecutterFeed = await parser.parseURL('https://www.nytimes.com/wirecutter/feed/');
    if (wirecutterFeed.items) {
      for (const item of wirecutterFeed.items) {
        if (!item.title) continue;
        const formattedTitle = item.title.toLowerCase().startsWith('review:')
          ? item.title
          : `Review: ${item.title}`;
        if (existingUrls.has(item.link) || existingTitles.has(formattedTitle.toLowerCase())) {
          continue;
        }

        const newTask: Task = {
          id: crypto.randomUUID(),
          title: formattedTitle,
          description: item.contentSnippet || item.summary || 'Competitor review article benchmarked from Wirecutter.',
          category: 'Buying Guide',
          targetKeyword: item.title.toLowerCase().replace(/^review:\s*/i, ''),
          sourceUrl: item.link || '',
          competitor: 'Wirecutter',
          status: 'pending',
          createdAt: new Date().toISOString(),
        };

        newTasks.push(newTask);
        existingTitles.add(formattedTitle.toLowerCase());
        if (item.link) existingUrls.add(item.link);
      }
    }
  } catch (err) {
    console.warn('Wirecutter RSS feed fetch failed or blocked, proceeding with fallbacks if needed:', err);
  }

  // RTINGS Feed
  try {
    const rtingsFeed = await parser.parseURL('https://www.rtings.com/rss/reviews.xml');
    if (rtingsFeed.items) {
      for (const item of rtingsFeed.items) {
        if (!item.title) continue;
        const formattedTitle = item.title.toLowerCase().startsWith('review:')
          ? item.title
          : `Review: ${item.title}`;
        if (existingUrls.has(item.link) || existingTitles.has(formattedTitle.toLowerCase())) {
          continue;
        }

        const newTask: Task = {
          id: crypto.randomUUID(),
          title: formattedTitle,
          description: item.contentSnippet || item.summary || 'Competitor review article benchmarked from RTINGS.',
          category: 'Product Review',
          targetKeyword: item.title.toLowerCase().replace(/^review:\s*/i, ''),
          sourceUrl: item.link || '',
          competitor: 'RTINGS',
          status: 'pending',
          createdAt: new Date().toISOString(),
        };

        newTasks.push(newTask);
        existingTitles.add(formattedTitle.toLowerCase());
        if (item.link) existingUrls.add(item.link);
      }
    }
  } catch (err) {
    console.warn('RTINGS RSS feed fetch failed or blocked, proceeding with fallbacks if needed:', err);
  }

  // If no new tasks were fetched from live feeds, check fallbacks
  if (newTasks.length === 0) {
    for (const fallback of FALLBACK_COMPETITOR_TOPICS) {
      if (!existingTitles.has(fallback.title.toLowerCase())) {
        const newTask: Task = {
          id: crypto.randomUUID(),
          title: fallback.title,
          description: fallback.description,
          category: fallback.category,
          targetKeyword: fallback.targetKeyword,
          sourceUrl: fallback.sourceUrl,
          competitor: fallback.competitor,
          status: 'pending',
          createdAt: new Date().toISOString(),
        };
        newTasks.push(newTask);
        existingTitles.add(fallback.title.toLowerCase());
        existingUrls.add(fallback.sourceUrl);
      }
    }
  }

  const updatedTasks = [...newTasks, ...existingTasks];
  saveTasks(updatedTasks);

  return {
    success: true,
    count: newTasks.length,
    tasks: newTasks,
    message: newTasks.length > 0
      ? `Successfully generated ${newTasks.length} benchmark task(s).`
      : 'No new competitor topics found.',
  };
}
