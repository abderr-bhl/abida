import fs from 'fs/promises';
import path from 'path';
import crypto from 'crypto';
import Parser from 'rss-parser';
import { BenchmarkTask, CompetitorSource, CompetitorArticle } from '@/types';
import { guides, reviews, comparisons } from '@/lib/mockData';

const parser = new Parser({
  headers: {
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36 ReviewGuidBot/1.0',
    'Accept': 'application/rss+xml, application/xml, text/xml;q=0.9, */*;q=0.8',
  },
  timeout: 8000,
});

export const COMPETITOR_SOURCES: CompetitorSource[] = [
  {
    id: 'wirecutter',
    name: 'Wirecutter (NYTimes)',
    url: 'https://www.nytimes.com/wirecutter/',
    feedUrl: 'https://www.nytimes.com/wirecutter/feed/',
    category: 'Electronics & Home',
  },
  {
    id: 'rtings',
    name: 'RTINGS',
    url: 'https://www.rtings.com/',
    feedUrl: 'https://www.rtings.com/rss/reviews.xml',
    category: 'Tech & Audio/Visual',
  },
];

// Fallback topics when competitor RSS feeds are unreachable or blocked by anti-bot/captchas
const FALLBACK_COMPETITOR_ARTICLES: CompetitorArticle[] = [
  {
    title: 'The Best Wireless Noise-Cancelling Headphones of 2026',
    link: 'https://www.nytimes.com/wirecutter/reviews/best-wireless-headphones/',
    pubDate: new Date().toISOString(),
    contentSnippet: 'After 40 hours of new testing against top competitors, here are the top noise-canceling picks.',
    competitor: 'Wirecutter (NYTimes)',
  },
  {
    title: 'LG C4 OLED vs Samsung S90D: Which Premium 4K TV Wins?',
    link: 'https://www.rtings.com/tv/reviews/lg/c4-oled-vs-samsung-s90d',
    pubDate: new Date().toISOString(),
    contentSnippet: 'Comprehensive side-by-side bench measurements and lab score comparison for US buyers.',
    competitor: 'RTINGS',
  },
  {
    title: 'The Best Ergonomic Office Chairs for Working From Home',
    link: 'https://www.nytimes.com/wirecutter/reviews/best-office-chair/',
    pubDate: new Date().toISOString(),
    contentSnippet: 'We spent months testing ergonomic chairs to find the best lumbar support and value.',
    competitor: 'Wirecutter (NYTimes)',
  },
  {
    title: 'Sony WH-1000XM5 Full Audio and ANC Lab Review',
    link: 'https://www.rtings.com/headphones/reviews/sony/wh-1000xm5-wireless',
    pubDate: new Date().toISOString(),
    contentSnippet: 'In-depth frequency response, microphone isolation, and comfort assessment.',
    competitor: 'RTINGS',
  },
  {
    title: 'The Best Robot Vacuums for Pet Hair and Hardwood Floors',
    link: 'https://www.nytimes.com/wirecutter/reviews/best-robot-vacuum/',
    pubDate: new Date().toISOString(),
    contentSnippet: 'Tested over 30 vacuums on carpet and hardwood against dog hair and debris.',
    competitor: 'Wirecutter (NYTimes)',
  },
];

const DATA_DIR = path.join(process.cwd(), 'data');
const TASKS_FILE = path.join(DATA_DIR, 'tasks.json');

// Helper to save data with EROFS protection
async function saveData(filePath: string, data: unknown): Promise<boolean> {
  try {
    await fs.mkdir(DATA_DIR, { recursive: true });
    await fs.writeFile(filePath, JSON.stringify(data, null, 2), 'utf8');
    return true;
  } catch (err: unknown) {
    if (err instanceof Error && (err as NodeJS.ErrnoException).code === 'EROFS') {
      console.warn('Warning: Read-only filesystem detected, data persistence skipped.');
      return false;
    }
    console.error('Error saving data:', err);
    return false;
  }
}

export async function getStoredTasks(): Promise<BenchmarkTask[]> {
  try {
    const content = await fs.readFile(TASKS_FILE, 'utf8');
    const tasks = JSON.parse(content) as BenchmarkTask[];
    return Array.isArray(tasks) ? tasks : [];
  } catch {
    return [];
  }
}

export async function saveStoredTasks(tasks: BenchmarkTask[]): Promise<boolean> {
  return saveData(TASKS_FILE, tasks);
}

/**
 * Fetches recent articles from a competitor RSS feed.
 * Falls back safely to mock competitor articles on network or parse failure.
 */
export async function fetchCompetitorArticles(source: CompetitorSource): Promise<CompetitorArticle[]> {
  try {
    const feed = await parser.parseURL(source.feedUrl);
    if (feed.items && feed.items.length > 0) {
      return feed.items.slice(0, 10).map((item) => ({
        title: item.title || 'Untitled Competitor Article',
        link: item.link || source.url,
        pubDate: item.pubDate || new Date().toISOString(),
        contentSnippet: item.contentSnippet || item.content || '',
        competitor: source.name,
      }));
    }
  } catch (error) {
    console.warn(`Competitor RSS feed unavailable for ${source.name}: ${(error as Error).message}. Using curated fallback.`);
  }

  // Fallback items matching this competitor
  return FALLBACK_COMPETITOR_ARTICLES.filter((item) => item.competitor === source.name);
}

/**
 * Determines task type and category based on competitor article title and content.
 */
function categorizeCompetitorArticle(title: string): { type: BenchmarkTask['type']; category: string } {
  const lower = title.toLowerCase();
  let type: BenchmarkTask['type'] = 'review';
  let category = 'Tech & Electronics';

  if (lower.includes(' vs ') || lower.includes('versus') || lower.includes('comparison')) {
    type = 'comparison';
  } else if (lower.includes('best ') || lower.includes('guide') || lower.includes('top ')) {
    type = 'guide';
  } else if (lower.includes('review') || lower.includes('tested')) {
    type = 'review';
  } else {
    type = 'update';
  }

  if (lower.includes('headphone') || lower.includes('earbud') || lower.includes('audio') || lower.includes('speaker')) {
    category = 'Audio';
  } else if (lower.includes('tv') || lower.includes('oled') || lower.includes('monitor') || lower.includes('display')) {
    category = 'Displays & TVs';
  } else if (lower.includes('vacuum') || lower.includes('chair') || lower.includes('home') || lower.includes('kitchen')) {
    category = 'Home & Office';
  } else if (lower.includes('laptop') || lower.includes('phone') || lower.includes('tech')) {
    category = 'Electronics';
  }

  return { type, category };
}

/**
 * Checks whether ReviewGuid already has a published article matching this competitor topic.
 */
function topicAlreadyCovered(title: string): boolean {
  const cleanTitle = title.toLowerCase().replace(/[^a-z0-9]/g, ' ');
  const keywords = cleanTitle.split(/\s+/).filter((word) => word.length > 4);

  const existingTitles = [
    ...guides.map((g) => g.title),
    ...reviews.map((r) => r.title),
    ...comparisons.map((c) => c.title),
  ].map((t) => t.toLowerCase());

  for (const existing of existingTitles) {
    const matchCount = keywords.filter((kw) => existing.includes(kw)).length;
    if (keywords.length > 0 && matchCount >= 2) {
      return true;
    }
  }
  return false;
}

/**
 * Core daily benchmark routine:
 * 1. Fetches competitor updates from US competitors (Wirecutter, RTINGS).
 * 2. Compares them with existing coverage on reviewguid.com.
 * 3. Automatically generates actionable English tasks for content writers / publishers.
 * 4. Merges with existing task backlog avoiding duplicates.
 */
export async function runCompetitorBenchmark(): Promise<{
  scannedCompetitors: number;
  articlesFound: number;
  newTasksGenerated: number;
  tasks: BenchmarkTask[];
}> {
  const existingTasks = await getStoredTasks();
  const existingTaskUrls = new Set(existingTasks.map((t) => t.competitorUrl));
  const newTasks: BenchmarkTask[] = [];

  let totalArticlesScanned = 0;

  for (const source of COMPETITOR_SOURCES) {
    const articles = await fetchCompetitorArticles(source);
    totalArticlesScanned += articles.length;

    for (const article of articles) {
      // Avoid creating duplicate tasks for the same competitor link
      if (existingTaskUrls.has(article.link)) {
        continue;
      }

      const covered = topicAlreadyCovered(article.title);
      const { type, category } = categorizeCompetitorArticle(article.title);

      const taskId = crypto.randomUUID();
      const now = new Date().toISOString();

      let taskTitle = `Review: ${article.title}`;
      let taskDescription = `Competitor ${article.competitor} published: "${article.title}". Benchmarked for our US audience.`;
      let priority: BenchmarkTask['priority'] = 'medium';

      if (type === 'guide') {
        taskTitle = `Guide: Best ${category} Guide (Inspired by ${article.competitor})`;
        taskDescription = `Competitor recently published or updated: "${article.title}". Create a comprehensive buying guide targeting Amazon US buyers.`;
        priority = covered ? 'medium' : 'high';
      } else if (type === 'comparison') {
        taskTitle = `Comparison: ${article.title}`;
        taskDescription = `Benchmark comparison published on ${article.competitor}. Create side-by-side comparison table and recommendations for ReviewGuid.`;
        priority = 'high';
      } else if (covered) {
        taskTitle = `Update: Refresh ${article.title} with 2026 picks`;
        taskDescription = `We already cover this topic, but ${article.competitor} recently published fresh findings. Review our recommendations and update Amazon affiliate links.`;
        priority = 'low';
      }

      const task: BenchmarkTask = {
        id: taskId,
        title: taskTitle,
        description: taskDescription,
        type,
        competitor: article.competitor,
        competitorUrl: article.link,
        competitorTitle: article.title,
        category,
        priority,
        status: 'pending',
        createdAt: now,
        updatedAt: now,
      };

      newTasks.push(task);
      existingTaskUrls.add(article.link);
    }
  }

  // Combine and sort by createdAt descending
  const combinedTasks = [...newTasks, ...existingTasks].sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  );

  await saveStoredTasks(combinedTasks);

  return {
    scannedCompetitors: COMPETITOR_SOURCES.length,
    articlesFound: totalArticlesScanned,
    newTasksGenerated: newTasks.length,
    tasks: combinedTasks,
  };
}

export async function updateBenchmarkTaskStatus(
  taskId: string,
  status: BenchmarkTask['status']
): Promise<BenchmarkTask | null> {
  const tasks = await getStoredTasks();
  const index = tasks.findIndex((t) => t.id === taskId);
  if (index === -1) {
    return null;
  }

  tasks[index] = {
    ...tasks[index],
    status,
    updatedAt: new Date().toISOString(),
  };

  await saveStoredTasks(tasks);
  return tasks[index];
}
