import fs from 'fs/promises';
import path from 'path';
import crypto from 'crypto';
import Parser from 'rss-parser';
import { BenchmarkTask, CompetitorFeed } from '@/types/benchmark';

const DATA_DIR = path.join(process.cwd(), 'data');
const TASKS_FILE = path.join(DATA_DIR, 'tasks.json');

const COMPETITOR_FEEDS: CompetitorFeed[] = [
  {
    name: 'Wirecutter',
    url: 'https://www.nytimes.com/wirecutter/feed/',
    category: 'Consumer Electronics & Home',
  },
  {
    name: 'RTINGS',
    url: 'https://www.rtings.com/rss/reviews.xml',
    category: 'Audio & Displays',
  },
];

const FALLBACK_BENCHMARKS = [
  {
    title: 'Review: The Best Noise-Cancelling Headphones of 2026',
    description: 'Wirecutter updated their top pick for travel noise cancellation. Benchmark against Sony WH-1000XM5 and Bose QC Ultra.',
    competitor: 'Wirecutter',
    sourceUrl: 'https://www.nytimes.com/wirecutter/reviews/best-noise-cancelling-headphones/',
    category: 'Audio',
    priority: 'high' as const,
    suggestedAngle: 'Focus on long-haul flight comfort and Amazon pricing discounts.',
  },
  {
    title: 'Review: Best OLED TVs for Gaming and Movies in USA',
    description: 'RTINGS published extensive test bench lab results for latest OLED displays with 144Hz VRR.',
    competitor: 'RTINGS',
    sourceUrl: 'https://www.rtings.com/tv/reviews/best/by-usage/video-gaming',
    category: 'Displays',
    priority: 'high' as const,
    suggestedAngle: 'Highlight brightness in daylight US living rooms and Amazon Prime delivery.',
  },
  {
    title: 'Guide: Best Robot Vacuums for Pet Hair',
    description: 'Wirecutter updated pet hair vacuum recommendations with auto-emptying station comparisons.',
    competitor: 'Wirecutter',
    sourceUrl: 'https://www.nytimes.com/wirecutter/reviews/best-robot-vacuum/',
    category: 'Home Appliances',
    priority: 'medium' as const,
    suggestedAngle: 'Compare maintenance costs, replacement filter bundles on Amazon, and app navigation.',
  },
  {
    title: 'Review: Best Budget Ergonomic Office Chairs',
    description: 'Competitor benchmarking identified rising search volume in the US for sub-$300 ergonomic office chairs.',
    competitor: 'Wirecutter',
    sourceUrl: 'https://www.nytimes.com/wirecutter/reviews/best-office-chair/',
    category: 'Office',
    priority: 'medium' as const,
    suggestedAngle: 'Assemble tests, lumbar adjustability, and value comparison with Herman Miller.',
  },
];

async function ensureDataDir(): Promise<void> {
  try {
    await fs.mkdir(DATA_DIR, { recursive: true });
  } catch (err: unknown) {
    if (err instanceof Error) {
      const nodeErr = err as NodeJS.ErrnoException;
      if (nodeErr.code === 'EROFS') {
        console.warn('Filesystem is read-only. Skipping directory creation.');
      }
    }
  }
}

async function saveTasks(tasks: unknown): Promise<void> {
  try {
    await ensureDataDir();
    await fs.writeFile(TASKS_FILE, JSON.stringify(tasks, null, 2), 'utf-8');
  } catch (err: unknown) {
    if (err instanceof Error) {
      const nodeErr = err as NodeJS.ErrnoException;
      if (nodeErr.code === 'EROFS') {
        console.warn('Read-only filesystem detected. In-memory tasks used.');
      } else {
        console.error('Failed to write tasks file:', err);
      }
    }
  }
}

export async function getTasks(): Promise<BenchmarkTask[]> {
  try {
    const raw = await fs.readFile(TASKS_FILE, 'utf-8');
    const tasks: BenchmarkTask[] = JSON.parse(raw);
    return tasks;
  } catch {
    // If file doesn't exist, seed with initial competitor benchmark tasks
    const initialTasks: BenchmarkTask[] = FALLBACK_BENCHMARKS.map((item) => ({
      id: crypto.randomUUID(),
      title: item.title,
      description: item.description,
      competitor: item.competitor,
      sourceUrl: item.sourceUrl,
      category: item.category,
      priority: item.priority,
      status: 'pending',
      suggestedAngle: item.suggestedAngle,
      createdAt: new Date().toISOString(),
    }));

    await saveTasks(initialTasks);
    return initialTasks;
  }
}

export async function updateTaskStatus(
  taskId: string,
  status: BenchmarkTask['status']
): Promise<BenchmarkTask | null> {
  const tasks = await getTasks();
  const index = tasks.findIndex((t) => t.id === taskId);
  if (index === -1) {
    return null;
  }

  tasks[index].status = status;
  await saveTasks(tasks);
  return tasks[index];
}

export async function runCompetitiveBenchmark(): Promise<{
  scanned: number;
  newTasks: number;
  tasks: BenchmarkTask[];
}> {
  const existingTasks = await getTasks();
  const parser = new Parser({
    timeout: 5000,
    headers: {
      'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
    },
  });

  const generatedTasks: BenchmarkTask[] = [];
  let scannedCount = 0;

  for (const feed of COMPETITOR_FEEDS) {
    try {
      const feedData = await parser.parseURL(feed.url);
      const items = feedData.items || [];
      scannedCount += items.length;

      for (const item of items.slice(0, 5)) {
        if (!item.title) continue;

        const alreadyExists = existingTasks.some(
          (t) =>
            t.title.toLowerCase().includes(item.title!.toLowerCase().slice(0, 20)) ||
            (item.link && t.sourceUrl === item.link)
        );

        if (!alreadyExists) {
          const newTask: BenchmarkTask = {
            id: crypto.randomUUID(),
            title: `Review: ${item.title}`,
            description: item.contentSnippet || item.summary || `Automated gap analysis from ${feed.name}`,
            competitor: feed.name,
            sourceUrl: item.link || feed.url,
            category: feed.category,
            priority: 'high',
            status: 'pending',
            createdAt: new Date().toISOString(),
            suggestedAngle: `Benchmarked from ${feed.name}. Create an in-depth US buyer guide with Amazon top picks and price comparison.`,
          };
          generatedTasks.push(newTask);
        }
      }
    } catch (feedErr) {
      console.warn(`Competitor feed fetch failed for ${feed.name}:`, feedErr);
    }
  }

  // If live feeds didn't return any new tasks (e.g. offline sandbox or bot blockers),
  // inject any fallback items not yet tracked
  if (generatedTasks.length === 0) {
    for (const fallback of FALLBACK_BENCHMARKS) {
      const exists = existingTasks.some((t) => t.title === fallback.title);
      if (!exists) {
        generatedTasks.push({
          id: crypto.randomUUID(),
          title: fallback.title,
          description: fallback.description,
          competitor: fallback.competitor,
          sourceUrl: fallback.sourceUrl,
          category: fallback.category,
          priority: fallback.priority,
          status: 'pending',
          createdAt: new Date().toISOString(),
          suggestedAngle: fallback.suggestedAngle,
        });
      }
    }
  }

  const updatedTasks = [...generatedTasks, ...existingTasks];
  await saveTasks(updatedTasks);

  return {
    scanned: scannedCount,
    newTasks: generatedTasks.length,
    tasks: updatedTasks,
  };
}
