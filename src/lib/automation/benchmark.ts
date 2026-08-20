import crypto from 'crypto';
import fs from 'fs';
import path from 'path';
import Parser from 'rss-parser';
import { Task } from '@/types';
import { guides, reviews, newsPosts, comparisons } from '@/lib/mockData';

const TASKS_FILE_PATH = path.join(process.cwd(), 'data', 'tasks.json');

const RSS_FEEDS = [
  { name: 'Wirecutter', url: 'https://www.nytimes.com/wirecutter/feed/' },
  { name: 'RTINGS', url: 'https://www.rtings.com/rss/reviews.xml' },
];

export async function loadTasks(): Promise<Task[]> {
  try {
    if (!fs.existsSync(TASKS_FILE_PATH)) {
      return [];
    }
    const fileContent = await fs.promises.readFile(TASKS_FILE_PATH, 'utf-8');
    const data = JSON.parse(fileContent);
    return Array.isArray(data) ? data : [];
  } catch (err) {
    if (err instanceof Error && (err as NodeJS.ErrnoException).code === 'EROFS') {
      console.warn('Read-only filesystem detected when reading tasks:', err.message);
      return [];
    }
    console.error('Error loading tasks:', err);
    return [];
  }
}

export async function saveData(filePath: string, data: unknown): Promise<void> {
  try {
    const dir = path.dirname(filePath);
    await fs.promises.mkdir(dir, { recursive: true });
    await fs.promises.writeFile(filePath, JSON.stringify(data, null, 2), 'utf-8');
  } catch (err) {
    if (err instanceof Error && (err as NodeJS.ErrnoException).code === 'EROFS') {
      console.warn('Read-only filesystem detected, skipping save:', err.message);
      return;
    }
    console.error('Error saving data:', err);
  }
}

export async function runBenchmark(): Promise<{ addedTasks: Task[]; totalTasks: number }> {
  const existingTasks = await loadTasks();
  const parser = new Parser({
    timeout: 10000,
    headers: {
      'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) ReviewGuidBot/1.0',
    },
  });

  const existingTitles = new Set<string>();

  // Collect existing titles from mock data to identify gaps
  guides.forEach(g => existingTitles.add(g.title.toLowerCase()));
  reviews.forEach(r => existingTitles.add(r.title.toLowerCase()));
  newsPosts.forEach(n => existingTitles.add(n.title.toLowerCase()));
  comparisons.forEach(c => existingTitles.add(c.title.toLowerCase()));

  // Also collect titles from existing tasks
  existingTasks.forEach(t => {
    existingTitles.add(t.title.toLowerCase());
    if (t.sourceUrl) {
      existingTitles.add(t.sourceUrl.toLowerCase());
    }
  });

  const newTasks: Task[] = [];

  for (const feedConfig of RSS_FEEDS) {
    try {
      const feed = await parser.parseURL(feedConfig.url);
      if (!feed || !feed.items) continue;

      for (const item of feed.items) {
        if (!item.title) continue;

        const itemTitle = item.title.trim();
        const itemUrl = item.link || '';

        // Check if we already have content or task for this
        const titleLower = itemTitle.toLowerCase();
        const isAlreadyTracked = Array.from(existingTitles).some(existing =>
          existing.includes(titleLower) || titleLower.includes(existing) || (itemUrl && existing === itemUrl.toLowerCase())
        );

        if (!isAlreadyTracked) {
          const taskTitle = `Review: ${itemTitle}`;
          const task: Task = {
            id: crypto.randomUUID(),
            title: taskTitle,
            description: `Automated gap analysis identified a new article from ${feedConfig.name}: "${itemTitle}". Evaluate and produce US-focused coverage for ReviewGuid.`,
            competitor: feedConfig.name,
            sourceUrl: itemUrl,
            status: 'pending',
            createdAt: new Date().toISOString(),
            priority: itemTitle.toLowerCase().includes('best') ? 'high' : 'medium',
            action: 'Generate Article',
          };

          newTasks.push(task);
          existingTitles.add(titleLower);
          if (itemUrl) existingTitles.add(itemUrl.toLowerCase());
        }
      }
    } catch (feedErr) {
      console.warn(`Failed to fetch RSS feed for ${feedConfig.name}:`, feedErr);
      // Fallback: If feed fails (e.g. 404 for RTINGS or network timeout), proceed with other feeds
    }
  }

  const updatedTasks = [...newTasks, ...existingTasks];
  await saveData(TASKS_FILE_PATH, updatedTasks);

  return {
    addedTasks: newTasks,
    totalTasks: updatedTasks.length,
  };
}

export async function updateTaskStatus(taskId: string, status: Task['status']): Promise<Task[]> {
  const tasks = await loadTasks();
  const taskIndex = tasks.findIndex(t => t.id === taskId);
  if (taskIndex !== -1) {
    tasks[taskIndex].status = status;
    await saveData(TASKS_FILE_PATH, tasks);
  }
  return tasks;
}
