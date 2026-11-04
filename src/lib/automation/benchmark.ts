import Parser from 'rss-parser';
import fs from 'fs';
import path from 'path';
import crypto from 'crypto';
import { Task, CompetitorSource } from '@/types';

const parser = new Parser({
  headers: {
    'User-Agent':
      'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36 ReviewGuidBot/1.0',
    Accept: 'application/rss+xml, application/xml, text/xml, */*',
  },
  timeout: 8000,
});

export const COMPETITOR_SOURCES: CompetitorSource[] = [
  {
    name: 'Wirecutter',
    url: 'https://www.nytimes.com/wirecutter/',
    feedUrl: 'https://www.nytimes.com/wirecutter/feed/',
  },
  {
    name: 'RTINGS',
    url: 'https://www.rtings.com/',
    feedUrl: 'https://www.rtings.com/rss/reviews.xml',
  },
];

// Fallback topics when RSS feeds are inaccessible, blocked by captchas, or return 404s
const FALLBACK_COMPETITOR_TOPICS = [
  {
    competitor: 'Wirecutter',
    title: 'The Best Wireless Noise-Cancelling Headphones of 2025',
    link: 'https://www.nytimes.com/wirecutter/reviews/best-noise-cancelling-headphones/',
    category: 'Audio',
  },
  {
    competitor: 'Wirecutter',
    title: 'The Best Espresso Machines for Every Kitchen',
    link: 'https://www.nytimes.com/wirecutter/reviews/best-espresso-machine/',
    category: 'Home & Kitchen',
  },
  {
    competitor: 'Wirecutter',
    title: 'The Best 4K OLED TVs for Gaming and Movies',
    link: 'https://www.nytimes.com/wirecutter/reviews/best-tv/',
    category: 'Electronics',
  },
  {
    competitor: 'RTINGS',
    title: 'The 5 Best Ergonomic Office Chairs - Spring 2025 Reviews',
    link: 'https://www.rtings.com/chair/reviews/best/office-chairs',
    category: 'Office',
  },
  {
    competitor: 'RTINGS',
    title: 'The 6 Best Robot Vacuums Tested and Ranked',
    link: 'https://www.rtings.com/vacuum/reviews/best/robot-vacuums',
    category: 'Home Appliances',
  },
  {
    competitor: 'Wirecutter',
    title: 'The Best Budget Laptops for Students and Remote Work',
    link: 'https://www.nytimes.com/wirecutter/reviews/best-laptops/',
    category: 'Computers',
  },
];

const DATA_DIR = path.join(process.cwd(), 'data');
const TASKS_FILE = path.join(DATA_DIR, 'tasks.json');

// In-memory cache fallback for read-only environments (e.g. Vercel / EROFS)
let inMemoryTasks: Task[] = [];

export function getTasks(): Task[] {
  try {
    if (fs.existsSync(TASKS_FILE)) {
      const data = fs.readFileSync(TASKS_FILE, 'utf-8');
      const parsed = JSON.parse(data);
      if (Array.isArray(parsed)) {
        inMemoryTasks = parsed;
        return parsed;
      }
    }
  } catch (err: unknown) {
    if (err instanceof Error) {
      const nodeErr = err as NodeJS.ErrnoException;
      console.warn(`[benchmark] Error reading tasks file: ${nodeErr.message}`);
    }
  }
  return inMemoryTasks;
}

export function saveTasks(tasks: unknown): boolean {
  if (!Array.isArray(tasks)) {
    return false;
  }
  inMemoryTasks = tasks as Task[];

  try {
    if (!fs.existsSync(DATA_DIR)) {
      fs.mkdirSync(DATA_DIR, { recursive: true });
    }
    fs.writeFileSync(TASKS_FILE, JSON.stringify(tasks, null, 2), 'utf-8');
    return true;
  } catch (err: unknown) {
    if (err instanceof Error) {
      const nodeErr = err as NodeJS.ErrnoException;
      console.warn(`[benchmark] EROFS or filesystem write error: ${nodeErr.message}. Stored in-memory.`);
    }
    return false;
  }
}

export function updateTaskStatus(taskId: string, status: Task['status']): Task | null {
  const currentTasks = getTasks();
  const taskIndex = currentTasks.findIndex((t) => t.id === taskId);
  if (taskIndex === -1) {
    return null;
  }

  const updatedTask: Task = {
    ...currentTasks[taskIndex],
    status,
    updatedAt: new Date().toISOString(),
  };

  currentTasks[taskIndex] = updatedTask;
  saveTasks(currentTasks);
  return updatedTask;
}

function cleanTitle(rawTitle: string): string {
  return rawTitle.replace(/^(The\s+)?(Best\s+)?/i, '').trim();
}

function determineCategory(title: string): string {
  const lower = title.toLowerCase();
  if (lower.includes('headphone') || lower.includes('earbud') || lower.includes('audio') || lower.includes('speaker')) {
    return 'Audio';
  }
  if (lower.includes('chair') || lower.includes('desk') || lower.includes('monitor') || lower.includes('keyboard')) {
    return 'Office & Tech';
  }
  if (lower.includes('tv') || lower.includes('oled') || lower.includes('display')) {
    return 'Electronics';
  }
  if (lower.includes('kitchen') || lower.includes('espresso') || lower.includes('coffee') || lower.includes('cookware')) {
    return 'Home & Kitchen';
  }
  if (lower.includes('vacuum') || lower.includes('robot') || lower.includes('air purifier')) {
    return 'Home Appliances';
  }
  if (lower.includes('laptop') || lower.includes('pc') || lower.includes('computer') || lower.includes('tablet')) {
    return 'Computers';
  }
  return 'Buyer Guides';
}

export async function runCompetitorBenchmark(): Promise<{
  newTasksCount: number;
  totalTasksCount: number;
  sourcesScanned: number;
  tasks: Task[];
}> {
  const existingTasks = getTasks();
  const existingUrls = new Set(existingTasks.map((t) => t.competitorUrl));
  const newTasks: Task[] = [];
  let sourcesScanned = 0;

  for (const source of COMPETITOR_SOURCES) {
    sourcesScanned++;
    try {
      const feed = await parser.parseURL(source.feedUrl);
      if (feed && feed.items && feed.items.length > 0) {
        for (const item of feed.items.slice(0, 5)) {
          const itemUrl = item.link || item.guid || '';
          if (!itemUrl || existingUrls.has(itemUrl)) {
            continue;
          }

          const rawTitle = item.title || 'Untitled Competitor Article';
          const cleanSubject = cleanTitle(rawTitle);
          const category = determineCategory(rawTitle);

          const task: Task = {
            id: crypto.randomUUID(),
            title: `Review: ${cleanSubject}`,
            description: `Competitor ${source.name} published a new guide/review: "${rawTitle}". Research top Amazon US products, test criteria, and write a competitive buyer guide.`,
            type: rawTitle.toLowerCase().includes('vs') ? 'comparison' : 'guide',
            competitor: source.name,
            competitorUrl: itemUrl,
            competitorArticleTitle: rawTitle,
            status: 'pending',
            priority: 'high',
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
            targetCategory: category,
            suggestedAction: `Benchmark against ${source.name}'s coverage and add Amazon US affiliate recommendations.`,
          };

          newTasks.push(task);
          existingUrls.add(itemUrl);
        }
      }
    } catch (err: unknown) {
      if (err instanceof Error) {
        const nodeErr = err as NodeJS.ErrnoException;
        console.warn(`[benchmark] Error scanning feed ${source.feedUrl}: ${nodeErr.message}. Fallbacks will ensure task generation.`);
      }
    }
  }

  // If no new tasks were retrieved from RSS (e.g. rate limits or offline/captcha), use fallbacks
  if (newTasks.length === 0 && existingTasks.length < 5) {
    for (const fallback of FALLBACK_COMPETITOR_TOPICS) {
      if (!existingUrls.has(fallback.link)) {
        const cleanSubject = cleanTitle(fallback.title);
        const task: Task = {
          id: crypto.randomUUID(),
          title: `Review: ${cleanSubject}`,
          description: `Competitor ${fallback.competitor} ranked high for: "${fallback.title}". Analyze their top selections, test criteria, and publish a comprehensive review guide with Amazon US links.`,
          type: fallback.title.toLowerCase().includes('vs') ? 'comparison' : 'guide',
          competitor: fallback.competitor,
          competitorUrl: fallback.link,
          competitorArticleTitle: fallback.title,
          status: 'pending',
          priority: 'high',
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          targetCategory: fallback.category,
          suggestedAction: `Publish a dedicated buyer guide targeting the US market with top Amazon picks.`,
        };
        newTasks.push(task);
        existingUrls.add(fallback.link);
      }
    }
  }

  const allTasks = [...newTasks, ...existingTasks];
  saveTasks(allTasks);

  return {
    newTasksCount: newTasks.length,
    totalTasksCount: allTasks.length,
    sourcesScanned,
    tasks: allTasks,
  };
}
