import Parser from 'rss-parser';
import crypto from 'crypto';
import fs from 'fs';
import path from 'path';
import { BenchmarkTask } from '@/types';

const TASKS_FILE_PATH = path.join(process.cwd(), 'data', 'tasks.json');

const FALLBACK_TOPICS: Array<{ title: string; source: 'Wirecutter' | 'RTINGS' | 'Fallback'; url: string; description: string }> = [
  {
    title: 'The Best Cordless Vacuums for 2025',
    source: 'Wirecutter',
    url: 'https://www.nytimes.com/wirecutter/reviews/best-cordless-vacuum/',
    description: 'Competitive review analysis for top market cordless stick vacuums in US home category.'
  },
  {
    title: 'Top 4K OLED TVs Tested for Gaming and Home Theater',
    source: 'RTINGS',
    url: 'https://www.rtings.com/tv/reviews/best/by-type/oled',
    description: 'Benchmarking display accuracy, response times, and price points against US TV market.'
  },
  {
    title: 'Best Noise-Canceling Wireless Earbuds of 2025',
    source: 'Wirecutter',
    url: 'https://www.nytimes.com/wirecutter/reviews/best-wireless-earbuds/',
    description: 'Comprehensive audio testing and active noise cancellation review tasks.'
  },
  {
    title: 'Best Air Purifiers for Allergies and Small Spaces',
    source: 'Wirecutter',
    url: 'https://www.nytimes.com/wirecutter/reviews/best-air-purifier/',
    description: 'US indoor air quality equipment performance benchmarking and affiliate link review.'
  }
];

export function loadTasks(): BenchmarkTask[] {
  try {
    if (!fs.existsSync(TASKS_FILE_PATH)) {
      return [];
    }
    const data = fs.readFileSync(TASKS_FILE_PATH, 'utf-8');
    return JSON.parse(data) as BenchmarkTask[];
  } catch (error) {
    console.warn('Failed to load tasks from filesystem:', error);
    return [];
  }
}

export function saveTasks(tasks: unknown): void {
  try {
    const dir = path.dirname(TASKS_FILE_PATH);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    fs.writeFileSync(TASKS_FILE_PATH, JSON.stringify(tasks, null, 2), 'utf-8');
  } catch (error) {
    const err = error as NodeJS.ErrnoException;
    if (err.code === 'EROFS') {
      console.warn('Read-only filesystem detected (EROFS). Task modifications skipped on filesystem.');
    } else {
      console.error('Error saving tasks:', error);
    }
  }
}

export async function runBenchmark(): Promise<BenchmarkTask[]> {
  const parser = new Parser({
    headers: {
      'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
    },
    timeout: 5000
  });

  const existingTasks = loadTasks();
  const existingTitles = new Set(existingTasks.map(t => t.title.toLowerCase()));
  const newTasks: BenchmarkTask[] = [];

  // Feeds to check
  const feeds = [
    { url: 'https://www.nytimes.com/wirecutter/feed/', source: 'Wirecutter' as const },
    { url: 'https://www.rtings.com/rss/reviews.xml', source: 'RTINGS' as const }
  ];

  for (const feed of feeds) {
    try {
      const feedData = await parser.parseURL(feed.url);
      if (feedData && feedData.items) {
        for (const item of feedData.items.slice(0, 5)) {
          if (!item.title) continue;

          const title = item.title.startsWith('Review:') ? item.title : `Review: ${item.title}`;
          if (existingTitles.has(title.toLowerCase())) continue;

          const task: BenchmarkTask = {
            id: crypto.randomUUID(),
            title,
            description: item.snippet || item.contentSnippet || `Competitive review task derived from ${feed.source}.`,
            source: feed.source,
            sourceUrl: item.link || undefined,
            status: 'pending',
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
          };

          newTasks.push(task);
          existingTitles.add(title.toLowerCase());
        }
      }
    } catch (feedError) {
      console.warn(`Failed to fetch or parse feed from ${feed.source}:`, feedError);
    }
  }

  // If no new tasks could be extracted from live feeds (e.g., feeds blocked, offline, or already parsed), apply fallback topics
  if (newTasks.length === 0) {
    for (const fb of FALLBACK_TOPICS) {
      const title = fb.title.startsWith('Review:') ? fb.title : `Review: ${fb.title}`;
      if (!existingTitles.has(title.toLowerCase())) {
        const task: BenchmarkTask = {
          id: crypto.randomUUID(),
          title,
          description: fb.description,
          source: fb.source,
          sourceUrl: fb.url,
          status: 'pending',
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        };
        newTasks.push(task);
        existingTitles.add(title.toLowerCase());
        if (newTasks.length >= 2) break;
      }
    }
  }

  const updatedTaskList = [...newTasks, ...existingTasks];
  saveTasks(updatedTaskList);

  return updatedTaskList;
}
