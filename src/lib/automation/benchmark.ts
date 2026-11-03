import Parser from 'rss-parser';
import * as crypto from 'crypto';
import * as fs from 'fs';
import * as path from 'path';
import { BenchmarkTask } from '@/types';
import { guides, reviews, comparisons, newsPosts } from '@/lib/mockData';

const parser = new Parser({
  headers: {
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
    'Accept': 'application/rss+xml, application/xml, text/xml, */*'
  },
  timeout: 8000
});

const TASKS_FILE_PATH = path.join(process.cwd(), 'data', 'tasks.json');

const COMPETITOR_FEEDS = [
  {
    name: 'Wirecutter',
    url: 'https://www.nytimes.com/wirecutter/feed/',
    defaultCategory: 'Electronics & Home'
  },
  {
    name: 'RTINGS',
    url: 'https://www.rtings.com/rss/reviews.xml',
    defaultCategory: 'Audio & Tech'
  }
];

// Fallback competitor topics used when RSS feeds are unreachable or blocked by anti-bot protections
const FALLBACK_COMPETITOR_ITEMS = [
  {
    title: 'The Best Cordless Stick Vacuums for 2025',
    link: 'https://www.nytimes.com/wirecutter/reviews/best-cordless-stick-vacuum/',
    snippet: 'Comprehensive testing of lightweight battery-powered vacuum cleaners comparing suction power and battery life.',
    competitor: 'Wirecutter',
    targetCategory: 'Home Appliances',
    contentType: 'guide' as const,
    priority: 'high' as const
  },
  {
    title: 'Sony WH-1000XM5 vs Bose QuietComfort Ultra: Which Is Better?',
    link: 'https://www.nytimes.com/wirecutter/reviews/best-noise-cancelling-headphones/',
    snippet: 'Head-to-head comparison evaluating active noise cancellation performance, comfort, and microphone clarity.',
    competitor: 'Wirecutter',
    targetCategory: 'Electronics',
    contentType: 'comparison' as const,
    priority: 'high' as const
  },
  {
    title: 'Samsung S90D OLED TV Full Hands-on Review',
    link: 'https://www.rtings.com/tv/reviews/samsung/s90d-oled',
    snippet: 'Deep laboratory measurement on peak HDR brightness, color gamut, and gaming input lag on the newest OLED display.',
    competitor: 'RTINGS',
    targetCategory: 'Tech & TV',
    contentType: 'review' as const,
    priority: 'medium' as const
  },
  {
    title: 'The Best Air Purifiers for Allergies and Wildfire Smoke',
    link: 'https://www.nytimes.com/wirecutter/reviews/best-air-purifier/',
    snippet: 'Testing CADR airflow rates and true HEPA filtration to choose the best air purifier for US living spaces.',
    competitor: 'Wirecutter',
    targetCategory: 'Home Appliances',
    contentType: 'guide' as const,
    priority: 'medium' as const
  }
];

export function loadTasks(): BenchmarkTask[] {
  try {
    if (fs.existsSync(TASKS_FILE_PATH)) {
      const content = fs.readFileSync(TASKS_FILE_PATH, 'utf-8');
      const parsed = JSON.parse(content);
      if (Array.isArray(parsed)) {
        return parsed as BenchmarkTask[];
      }
    }
  } catch (err: unknown) {
    if (err instanceof Error) {
      const errorWithCode = err as NodeJS.ErrnoException;
      if (errorWithCode.code === 'EROFS') {
        console.warn('Read-only filesystem detected, running with in-memory task state.');
      } else {
        console.error('Error loading tasks file:', err.message);
      }
    }
  }
  return [];
}

export function saveTasks(tasks: unknown): void {
  try {
    const dir = path.dirname(TASKS_FILE_PATH);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    fs.writeFileSync(TASKS_FILE_PATH, JSON.stringify(tasks, null, 2), 'utf-8');
  } catch (err: unknown) {
    if (err instanceof Error) {
      const errorWithCode = err as NodeJS.ErrnoException;
      if (errorWithCode.code === 'EROFS') {
        console.warn('Cannot persist tasks: Read-only filesystem.');
      } else {
        console.error('Failed to save tasks:', err.message);
      }
    }
  }
}

/**
 * Checks whether an article title is already covered by existing content on reviewguid.com.
 */
function isAlreadyCovered(title: string): boolean {
  const normalizedTitle = title.toLowerCase();
  const existingTitles = [
    ...guides.map(g => g.title.toLowerCase()),
    ...reviews.map(r => r.title.toLowerCase()),
    ...comparisons.map(c => c.title.toLowerCase()),
    ...newsPosts.map(n => n.title.toLowerCase())
  ];

  return existingTitles.some(t => {
    // Check overlap of key words
    const words = normalizedTitle.split(/\s+/).filter(w => w.length > 4);
    const matches = words.filter(w => t.includes(w));
    return matches.length >= 3 || t === normalizedTitle;
  });
}

function determineContentType(title: string): 'guide' | 'review' | 'comparison' | 'news' {
  const lower = title.toLowerCase();
  if (lower.includes(' vs ') || lower.includes('versus') || lower.includes('compared')) {
    return 'comparison';
  }
  if (lower.startsWith('the best') || lower.startsWith('best ') || lower.includes('buying guide') || lower.includes('guide')) {
    return 'guide';
  }
  if (lower.includes('review') || lower.includes('tested')) {
    return 'review';
  }
  return 'news';
}

/**
 * Executes competitor benchmarking:
 * 1. Queries competitor feeds (with fallback).
 * 2. Compares against existing content to find content gaps.
 * 3. Generates actionable content creation tasks.
 */
export async function runBenchmark(): Promise<{
  newTasksCount: number;
  totalTasksCount: number;
  tasks: BenchmarkTask[];
}> {
  const currentTasks = loadTasks();
  const existingLinks = new Set(currentTasks.map(t => t.competitorUrl));
  const newTasks: BenchmarkTask[] = [];

  for (const feed of COMPETITOR_FEEDS) {
    try {
      const parsedFeed = await parser.parseURL(feed.url);
      if (parsedFeed && parsedFeed.items) {
        for (const item of parsedFeed.items.slice(0, 10)) {
          if (!item.title || !item.link) continue;
          if (existingLinks.has(item.link)) continue;
          if (isAlreadyCovered(item.title)) continue;

          const contentType = determineContentType(item.title);
          const task: BenchmarkTask = {
            id: crypto.randomUUID(),
            title: `Review: ${item.title.trim()}`,
            description: `Competitor ${feed.name} published an article "${item.title.trim()}". Analyze their recommendations, identify top US market Amazon products, and produce an optimized ${contentType} for reviewguid.com.`,
            competitor: feed.name,
            competitorUrl: item.link,
            contentType,
            targetCategory: feed.defaultCategory,
            priority: contentType === 'guide' ? 'high' : 'medium',
            status: 'pending',
            detectedAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
          };

          newTasks.push(task);
          existingLinks.add(item.link);
        }
      }
    } catch {
      // Competitor feed may be protected, offline, or returning 404/captcha
      // Fallback is used automatically below
    }
  }

  // If no new tasks were retrieved from live RSS (e.g. rate-limiting, captchas, or no connection),
  // inject fallback competitor content gap opportunities
  if (newTasks.length === 0 && currentTasks.length === 0) {
    for (const item of FALLBACK_COMPETITOR_ITEMS) {
      if (!existingLinks.has(item.link) && !isAlreadyCovered(item.title)) {
        const task: BenchmarkTask = {
          id: crypto.randomUUID(),
          title: `Review: ${item.title}`,
          description: `Competitor ${item.competitor} ranked high for "${item.title}". Snippet: ${item.snippet}. Create an in-depth US buyer guide targeting top Amazon affiliate picks.`,
          competitor: item.competitor,
          competitorUrl: item.link,
          contentType: item.contentType,
          targetCategory: item.targetCategory,
          priority: item.priority,
          status: 'pending',
          detectedAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        };
        newTasks.push(task);
        existingLinks.add(item.link);
      }
    }
  }

  const updatedTasks = [...newTasks, ...currentTasks];
  saveTasks(updatedTasks);

  return {
    newTasksCount: newTasks.length,
    totalTasksCount: updatedTasks.length,
    tasks: updatedTasks
  };
}

export function updateTaskStatus(
  taskId: string,
  newStatus: BenchmarkTask['status']
): BenchmarkTask | null {
  const tasks = loadTasks();
  const taskIndex = tasks.findIndex(t => t.id === taskId);
  if (taskIndex === -1) return null;

  tasks[taskIndex].status = newStatus;
  tasks[taskIndex].updatedAt = new Date().toISOString();
  saveTasks(tasks);
  return tasks[taskIndex];
}
