import fs from 'fs';
import path from 'path';
import crypto from 'crypto';
import Parser from 'rss-parser';

export type TaskStatus = 'pending' | 'in_progress' | 'published' | 'ignored';
export type TaskPriority = 'high' | 'medium' | 'low';

export interface BenchmarkTask {
  id: string;
  competitor: string;
  sourceUrl: string;
  originalTitle: string;
  title: string;
  suggestedType: 'guide' | 'review' | 'comparison' | 'news';
  category: string;
  description: string;
  priority: TaskPriority;
  status: TaskStatus;
  detectedAt: string;
  updatedAt: string;
}

export interface BenchmarkResult {
  timestamp: string;
  newTasksCount: number;
  totalTasksCount: number;
  sourcesChecked: string[];
  tasks: BenchmarkTask[];
}

const DATA_DIR = path.join(process.cwd(), 'data');
const TASKS_FILE = path.join(DATA_DIR, 'tasks.json');

const parser = new Parser({
  timeout: 8000,
  headers: {
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
    'Accept': 'application/rss+xml, application/xml, text/xml, */*'
  }
});

const COMPETITOR_FEEDS = [
  {
    name: 'Wirecutter',
    url: 'https://www.nytimes.com/wirecutter/feed/',
  },
  {
    name: 'RTINGS',
    url: 'https://www.rtings.com/rss/reviews.xml',
  }
];

// Fallback competitor reviews if feeds fail due to bot protection / 404
const FALLBACK_BENCHMARK_ITEMS = [
  {
    competitor: 'Wirecutter',
    title: 'The Best Air Purifier for Allergies and Smoke in 2025',
    link: 'https://www.nytimes.com/wirecutter/reviews/best-air-purifier/',
    category: 'Home & Appliances',
    type: 'guide' as const,
    priority: 'high' as const,
  },
  {
    competitor: 'RTINGS',
    title: 'Sony WH-1000XM5 vs Bose QuietComfort Ultra Headphones Comparison',
    link: 'https://www.rtings.com/headphones/tools/compare',
    category: 'Electronics',
    type: 'comparison' as const,
    priority: 'high' as const,
  },
  {
    competitor: 'Wirecutter',
    title: 'The Best Wireless Gaming Mouse for Competitive Gamers',
    link: 'https://www.nytimes.com/wirecutter/reviews/best-gaming-mouse/',
    category: 'Electronics',
    type: 'review' as const,
    priority: 'medium' as const,
  },
  {
    competitor: 'Wirecutter',
    title: 'The Best Espresso Machines for Your Countertop',
    link: 'https://www.nytimes.com/wirecutter/reviews/best-espresso-machine/',
    category: 'Kitchen',
    type: 'guide' as const,
    priority: 'medium' as const,
  }
];

function ensureDataDir(): void {
  try {
    if (!fs.existsSync(DATA_DIR)) {
      fs.mkdirSync(DATA_DIR, { recursive: true });
    }
  } catch (err: unknown) {
    if (err instanceof Error) {
      const errnoErr = err as NodeJS.ErrnoException;
      if (errnoErr.code === 'EROFS') {
        console.warn('Filesystem is read-only. Tasks will only stay in-memory if not writable.');
      }
    }
  }
}

export function loadTasks(): BenchmarkTask[] {
  ensureDataDir();
  try {
    if (fs.existsSync(TASKS_FILE)) {
      const content = fs.readFileSync(TASKS_FILE, 'utf-8');
      const parsed = JSON.parse(content) as unknown;
      if (Array.isArray(parsed)) {
        return parsed as BenchmarkTask[];
      }
    }
  } catch (err: unknown) {
    console.error('Error reading tasks file:', err);
  }
  return [];
}

export function saveTasks(tasks: BenchmarkTask[]): boolean {
  ensureDataDir();
  try {
    fs.writeFileSync(TASKS_FILE, JSON.stringify(tasks, null, 2), 'utf-8');
    return true;
  } catch (err: unknown) {
    if (err instanceof Error) {
      const errnoErr = err as NodeJS.ErrnoException;
      if (errnoErr.code === 'EROFS') {
        console.warn('Cannot write tasks file: Filesystem is read-only (EROFS)');
        return false;
      }
    }
    console.error('Error saving tasks file:', err);
    return false;
  }
}

function determineCategory(title: string, contentSnippet?: string): string {
  const text = `${title} ${contentSnippet || ''}`.toLowerCase();
  if (text.includes('headphone') || text.includes('laptop') || text.includes('mouse') || text.includes('tv') || text.includes('keyboard')) {
    return 'Electronics';
  }
  if (text.includes('coffee') || text.includes('espresso') || text.includes('cook') || text.includes('kitchen') || text.includes('blender')) {
    return 'Kitchen';
  }
  if (text.includes('purifier') || text.includes('vacuum') || text.includes('mattress') || text.includes('home')) {
    return 'Home & Appliances';
  }
  if (text.includes('fitness') || text.includes('shoe') || text.includes('bike') || text.includes('running')) {
    return 'Fitness & Outdoor';
  }
  return 'General Buyer Guide';
}

function determineTaskType(title: string): 'guide' | 'review' | 'comparison' | 'news' {
  const lower = title.toLowerCase();
  if (lower.includes(' vs ') || lower.includes('versus') || lower.includes('compare')) {
    return 'comparison';
  }
  if (lower.includes('review') || lower.includes('tested')) {
    return 'review';
  }
  if (lower.includes('best') || lower.includes('guide') || lower.includes('top picks')) {
    return 'guide';
  }
  return 'news';
}

function generateActionableTitle(originalTitle: string, type: 'guide' | 'review' | 'comparison' | 'news'): string {
  const cleanTitle = originalTitle.replace(/^the\s+/i, '').replace(/\|\s*wirecutter/i, '').trim();
  if (type === 'comparison') {
    return `Comparison: ${cleanTitle}`;
  }
  if (type === 'review') {
    return `Review: ${cleanTitle}`;
  }
  if (type === 'guide') {
    return `Buyer Guide: ${cleanTitle}`;
  }
  return `Market Trend: ${cleanTitle}`;
}

export async function runBenchmark(): Promise<BenchmarkResult> {
  const existingTasks = loadTasks();
  const existingUrls = new Set(existingTasks.map(t => t.sourceUrl));
  const newTasks: BenchmarkTask[] = [];
  const sourcesChecked: string[] = [];

  for (const feed of COMPETITOR_FEEDS) {
    sourcesChecked.push(feed.name);
    try {
      const feedData = await parser.parseURL(feed.url);
      const items = feedData.items || [];

      for (const item of items.slice(0, 10)) {
        const itemUrl = item.link?.trim() || '';
        const itemTitle = item.title?.trim() || '';

        if (!itemUrl || !itemTitle || existingUrls.has(itemUrl)) {
          continue;
        }

        const type = determineTaskType(itemTitle);
        const category = determineCategory(itemTitle, item.contentSnippet);
        const actionableTitle = generateActionableTitle(itemTitle, type);

        const task: BenchmarkTask = {
          id: crypto.randomUUID(),
          competitor: feed.name,
          sourceUrl: itemUrl,
          originalTitle: itemTitle,
          title: actionableTitle,
          suggestedType: type,
          category,
          description: `Identified top-ranking US competitor coverage on "${itemTitle}". Benchmark criteria, recommend tested products with Amazon affiliate monetization, and highlight our Top Pick.`,
          priority: type === 'guide' || type === 'comparison' ? 'high' : 'medium',
          status: 'pending',
          detectedAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        };

        newTasks.push(task);
        existingUrls.add(itemUrl);
      }
    } catch (feedErr) {
      console.warn(`Could not fetch RSS feed from ${feed.name}:`, (feedErr as Error).message);
    }
  }

  // If no new tasks were obtained (e.g., RSS down or bot blocked) and tasks list is empty, inject curated competitor benchmarks
  if (existingTasks.length === 0 && newTasks.length === 0) {
    for (const fallback of FALLBACK_BENCHMARK_ITEMS) {
      if (!existingUrls.has(fallback.link)) {
        const actionableTitle = generateActionableTitle(fallback.title, fallback.type);
        const task: BenchmarkTask = {
          id: crypto.randomUUID(),
          competitor: fallback.competitor,
          sourceUrl: fallback.link,
          originalTitle: fallback.title,
          title: actionableTitle,
          suggestedType: fallback.type,
          category: fallback.category,
          description: `Benchmarked against US competitor ${fallback.competitor}. Create our high-converting US buyer's guide / review with Amazon Affiliate links and top recommendation badges.`,
          priority: fallback.priority,
          status: 'pending',
          detectedAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        };
        newTasks.push(task);
        existingUrls.add(fallback.link);
      }
    }
  }

  const allTasks = [...newTasks, ...existingTasks];
  saveTasks(allTasks);

  return {
    timestamp: new Date().toISOString(),
    newTasksCount: newTasks.length,
    totalTasksCount: allTasks.length,
    sourcesChecked,
    tasks: allTasks
  };
}

export function updateTaskStatus(taskId: string, newStatus: TaskStatus): BenchmarkTask | null {
  const tasks = loadTasks();
  const index = tasks.findIndex(t => t.id === taskId);
  if (index === -1) return null;

  tasks[index] = {
    ...tasks[index],
    status: newStatus,
    updatedAt: new Date().toISOString()
  };

  saveTasks(tasks);
  return tasks[index];
}

export function getTasks(): BenchmarkTask[] {
  return loadTasks();
}
