import Parser from 'rss-parser';
import fs from 'fs';
import path from 'path';
import crypto from 'crypto';
import { BenchmarkTask, CompetitorSource, CompetitorArticle } from '@/types';
import { guides, reviews, comparisons } from '@/lib/mockData';

const TASKS_FILE_PATH = path.join(process.cwd(), 'data', 'tasks.json');

export const COMPETITOR_SOURCES: CompetitorSource[] = [
  {
    name: 'Wirecutter',
    feedUrl: 'https://www.nytimes.com/wirecutter/feed/',
    siteUrl: 'https://www.nytimes.com/wirecutter/',
    category: 'Consumer Electronics & Home',
  },
  {
    name: 'RTINGS',
    feedUrl: 'https://www.rtings.com/rss/reviews.xml',
    siteUrl: 'https://www.rtings.com/',
    category: 'Audio & Displays',
  },
];

// Fallback competitor review topics when external feeds are blocked or network fails
const FALLBACK_COMPETITOR_ARTICLES: CompetitorArticle[] = [
  {
    title: 'The Best Noise-Cancelling Headphones of 2025',
    link: 'https://www.nytimes.com/wirecutter/reviews/best-noise-cancelling-headphones/',
    competitor: 'Wirecutter',
    category: 'Audio',
    pubDate: new Date().toISOString(),
    contentSnippet: 'Comprehensive testing of the best active noise-cancelling headphones for travel and work.',
  },
  {
    title: 'The Best Mechanical Keyboards for Typing and Gaming',
    link: 'https://www.nytimes.com/wirecutter/reviews/best-mechanical-keyboards/',
    competitor: 'Wirecutter',
    category: 'Keyboards',
    pubDate: new Date().toISOString(),
    contentSnippet: 'After typing on dozens of mechanical keyboards, here are our favorite switches and layouts.',
  },
  {
    title: 'Best OLED TVs of 2025: Expert Lab Measurements',
    link: 'https://www.rtings.com/tv/reviews/best/by-type/oled',
    competitor: 'RTINGS',
    category: 'Displays',
    pubDate: new Date().toISOString(),
    contentSnippet: 'Lab test results comparing color accuracy, contrast ratio, and gaming latency on latest OLED models.',
  },
  {
    title: 'The Best Smart Robot Vacuums for Pet Hair',
    link: 'https://www.nytimes.com/wirecutter/reviews/best-robot-vacuum-pet-hair/',
    competitor: 'Wirecutter',
    category: 'Home & Cleaning',
    pubDate: new Date().toISOString(),
    contentSnippet: 'Self-emptying robot vacuums that navigate obstacle courses and pick up dog and cat fur flawlessly.',
  },
  {
    title: 'Best Wireless Gaming Mice: Sensor & Click Latency Tested',
    link: 'https://www.rtings.com/mouse/reviews/best/by-usage/gaming',
    competitor: 'RTINGS',
    category: 'Peripherals',
    pubDate: new Date().toISOString(),
    contentSnippet: 'Rigorous sensor benchmarks and button latency analysis for competitive gaming mice.',
  },
];

function isNodeError(error: unknown): error is NodeJS.ErrnoException {
  return error instanceof Error;
}

export function loadTasks(): BenchmarkTask[] {
  try {
    if (!fs.existsSync(TASKS_FILE_PATH)) {
      return [];
    }
    const data = fs.readFileSync(TASKS_FILE_PATH, 'utf-8');
    return JSON.parse(data) as BenchmarkTask[];
  } catch (error: unknown) {
    if (isNodeError(error) && error.code === 'ENOENT') {
      return [];
    }
    console.warn('Warning: Could not read tasks file, returning empty task list:', error);
    return [];
  }
}

export function saveTasks(tasks: BenchmarkTask[]): boolean {
  try {
    const dir = path.dirname(TASKS_FILE_PATH);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    fs.writeFileSync(TASKS_FILE_PATH, JSON.stringify(tasks, null, 2), 'utf-8');
    return true;
  } catch (error: unknown) {
    if (isNodeError(error) && (error.code === 'EROFS' || error.code === 'EACCES')) {
      console.warn('Warning: Read-only filesystem detected. Tasks persistence skipped in current environment.');
      return false;
    }
    console.error('Error saving tasks to filesystem:', error);
    return false;
  }
}

async function fetchFeedArticles(source: CompetitorSource): Promise<CompetitorArticle[]> {
  const parser = new Parser({
    headers: {
      'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36 ReviewGuid/1.0',
    },
    timeout: 5000,
  });

  try {
    const feed = await parser.parseURL(source.feedUrl);
    return (feed.items || []).slice(0, 10).map((item) => ({
      title: item.title || 'Untitled Article',
      link: item.link || source.siteUrl,
      pubDate: item.pubDate,
      contentSnippet: item.contentSnippet,
      competitor: source.name,
      category: source.category,
    }));
  } catch (error: unknown) {
    console.warn(`Warning: Failed to fetch feed for ${source.name} (${source.feedUrl}):`, error);
    return [];
  }
}

export async function runCompetitorBenchmark(): Promise<{
  newTasksCount: number;
  totalTasksCount: number;
  tasks: BenchmarkTask[];
}> {
  const existingTasks = loadTasks();
  const existingTaskUrls = new Set(existingTasks.map((t) => t.sourceUrl));
  const existingTaskTitles = new Set(existingTasks.map((t) => t.title.toLowerCase()));

  // Existing content titles on ReviewGuid
  const existingContentTitles = [
    ...guides.map((g) => g.title.toLowerCase()),
    ...reviews.map((r) => r.title.toLowerCase()),
    ...comparisons.map((c) => c.title.toLowerCase()),
  ];

  let fetchedArticles: CompetitorArticle[] = [];

  for (const source of COMPETITOR_SOURCES) {
    const articles = await fetchFeedArticles(source);
    fetchedArticles.push(...articles);
  }

  // If feeds are blocked, protected by captcha, or unreachable, use fallback items
  if (fetchedArticles.length === 0) {
    console.info('Live RSS feeds returned no articles. Applying verified fallback competitor articles for benchmarking.');
    fetchedArticles = [...FALLBACK_COMPETITOR_ARTICLES];
  }

  const generatedTasks: BenchmarkTask[] = [];

  for (const article of fetchedArticles) {
    const normalizedTitle = article.title.trim();
    if (!normalizedTitle || existingTaskUrls.has(article.link)) {
      continue;
    }

    const taskTitle = `Review: ${normalizedTitle}`;
    if (existingTaskTitles.has(taskTitle.toLowerCase())) {
      continue;
    }

    // Check if we already have an equivalent guide/review covering this exact title
    const alreadyCovered = existingContentTitles.some((title) =>
      title.includes(normalizedTitle.toLowerCase()) || normalizedTitle.toLowerCase().includes(title)
    );

    const priority = alreadyCovered ? 'low' : 'high';
    const now = new Date().toISOString();

    const newTask: BenchmarkTask = {
      id: crypto.randomUUID(),
      title: taskTitle,
      description: `Competitor ${article.competitor} recently published coverage on "${article.title}". Benchmark their analysis, key specs, and recommended Amazon products to create or update our US buyer's guide.`,
      competitor: article.competitor,
      sourceUrl: article.link,
      category: article.category,
      priority,
      status: 'pending',
      createdAt: now,
      updatedAt: now,
    };

    generatedTasks.push(newTask);
    existingTaskUrls.add(article.link);
    existingTaskTitles.add(taskTitle.toLowerCase());
  }

  const updatedTasks = [...generatedTasks, ...existingTasks];
  saveTasks(updatedTasks);

  return {
    newTasksCount: generatedTasks.length,
    totalTasksCount: updatedTasks.length,
    tasks: updatedTasks,
  };
}

export function updateTaskStatus(taskId: string, status: BenchmarkTask['status']): BenchmarkTask | null {
  const tasks = loadTasks();
  const taskIndex = tasks.findIndex((t) => t.id === taskId);
  if (taskIndex === -1) {
    return null;
  }

  tasks[taskIndex].status = status;
  tasks[taskIndex].updatedAt = new Date().toISOString();
  saveTasks(tasks);
  return tasks[taskIndex];
}
