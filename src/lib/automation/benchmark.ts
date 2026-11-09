import fs from 'fs';
import path from 'path';
import crypto from 'crypto';
import Parser from 'rss-parser';
import { Task, CompetitorArticle } from '@/types';

const DATA_DIR = path.join(process.cwd(), 'data');
const TASKS_FILE = path.join(DATA_DIR, 'tasks.json');

const parser = new Parser({
  headers: {
    'User-Agent':
      'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
  },
  timeout: 10000,
});

const COMPETITOR_FEEDS = [
  {
    name: 'Wirecutter',
    url: 'https://www.nytimes.com/wirecutter/feed/',
    category: 'Electronics & Home',
  },
  {
    name: 'RTINGS',
    url: 'https://www.rtings.com/rss/reviews.xml',
    category: 'TVs & Tech',
  },
];

const FALLBACK_COMPETITOR_ARTICLES: CompetitorArticle[] = [
  {
    title: 'The Best Wireless Noise-Cancelling Headphones of 2026',
    link: 'https://www.nytimes.com/wirecutter/reviews/best-wireless-headphones/',
    competitor: 'Wirecutter',
    category: 'Audio',
  },
  {
    title: 'The Best Robot Vacuums for Pet Hair',
    link: 'https://www.nytimes.com/wirecutter/reviews/best-robot-vacuum-for-pet-hair/',
    competitor: 'Wirecutter',
    category: 'Home & Kitchen',
  },
  {
    title: 'Samsung S90D OLED vs LG C4 OLED TV Comparison',
    link: 'https://www.rtings.com/tv/tools/compare/samsung-s90d-oled-vs-lg-c4-oled/49703/49541',
    competitor: 'RTINGS',
    category: 'TVs & Monitors',
  },
  {
    title: 'The Best Espresso Machines for Beginners',
    link: 'https://www.nytimes.com/wirecutter/reviews/best-espresso-machine/',
    competitor: 'Wirecutter',
    category: 'Kitchen',
  },
  {
    title: 'The Best Ergonomic Office Chairs for Working From Home',
    link: 'https://www.nytimes.com/wirecutter/reviews/best-office-chair/',
    competitor: 'Wirecutter',
    category: 'Office',
  },
];

/**
 * Loads existing tasks from local storage
 */
export async function getStoredTasks(): Promise<Task[]> {
  try {
    if (!fs.existsSync(TASKS_FILE)) {
      return [];
    }
    const raw = fs.readFileSync(TASKS_FILE, 'utf-8');
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch (error) {
    console.error('Error reading tasks file:', error);
    return [];
  }
}

/**
 * Persists tasks safely to data/tasks.json (handles read-only filesystem gracefully)
 */
export async function saveStoredTasks(tasks: Task[]): Promise<boolean> {
  try {
    if (!fs.existsSync(DATA_DIR)) {
      fs.mkdirSync(DATA_DIR, { recursive: true });
    }
    fs.writeFileSync(TASKS_FILE, JSON.stringify(tasks, null, 2), 'utf-8');
    return true;
  } catch (err) {
    if (err instanceof Error) {
      const nodeErr = err as NodeJS.ErrnoException;
      if (nodeErr.code === 'EROFS') {
        console.warn('Filesystem is read-only. Tasks changes cannot be persisted to disk.');
        return false;
      }
    }
    console.error('Error saving tasks file:', err);
    return false;
  }
}

/**
 * Fetches latest articles from US competitors
 */
export async function fetchCompetitorArticles(): Promise<CompetitorArticle[]> {
  const articles: CompetitorArticle[] = [];

  for (const feed of COMPETITOR_FEEDS) {
    try {
      const parsedFeed = await parser.parseURL(feed.url);
      if (parsedFeed.items && parsedFeed.items.length > 0) {
        for (const item of parsedFeed.items.slice(0, 10)) {
          if (item.title) {
            articles.push({
              title: item.title.trim(),
              link: item.link || '',
              pubDate: item.pubDate,
              competitor: feed.name,
              category: feed.category,
            });
          }
        }
      }
    } catch (feedError) {
      console.warn(`Could not fetch RSS from ${feed.name}:`, feedError);
    }
  }

  // If competitor feeds were blocked, 404, or rate limited, use curated competitor benchmark list
  if (articles.length === 0) {
    return FALLBACK_COMPETITOR_ARTICLES;
  }

  return articles;
}

/**
 * Analyzes competitor articles and generates automated content tasks
 */
export async function runCompetitorBenchmark(): Promise<{
  createdTasksCount: number;
  totalTasksCount: number;
  newTasks: Task[];
}> {
  const existingTasks = await getStoredTasks();
  const existingTitles = new Set(existingTasks.map(t => t.title.toLowerCase()));
  const competitorArticles = await fetchCompetitorArticles();

  const newTasks: Task[] = [];

  for (const article of competitorArticles) {
    const taskTitle = `Review: ${article.title}`;
    if (!existingTitles.has(taskTitle.toLowerCase())) {
      const isComparison =
        article.title.toLowerCase().includes(' vs ') ||
        article.title.toLowerCase().includes('compared');

      const action = isComparison
        ? 'write_comparison'
        : article.title.toLowerCase().includes('best')
        ? 'write_guide'
        : 'write_review';

      const task: Task = {
        id: crypto.randomUUID(),
        title: taskTitle,
        description: `Automated competitor benchmark detected trending coverage from ${article.competitor}: "${article.title}". Research US market pricing on Amazon, evaluate specs, and draft our proprietary buyer's guide.`,
        sourceCompetitor: article.competitor,
        sourceUrl: article.link,
        targetCategory: article.category || 'Buyer Guides',
        suggestedAction: action,
        status: 'pending',
        priority: 'high',
        detectedAt: new Date().toISOString(),
      };

      newTasks.push(task);
      existingTitles.add(taskTitle.toLowerCase());
    }
  }

  const updatedTasks = [...newTasks, ...existingTasks];
  await saveStoredTasks(updatedTasks);

  return {
    createdTasksCount: newTasks.length,
    totalTasksCount: updatedTasks.length,
    newTasks,
  };
}
