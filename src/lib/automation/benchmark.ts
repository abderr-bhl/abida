import Parser from 'rss-parser';
import fs from 'fs';
import path from 'path';
import crypto from 'crypto';
import { guides, newsPosts, reviews, comparisons } from '@/lib/mockData';

export interface TaskItem {
  id: string;
  title: string;
  description: string;
  sourceUrl: string;
  competitor: string;
  status: 'pending' | 'in_progress' | 'completed';
  createdAt: string;
}

const DATA_DIR = path.join(process.cwd(), 'data');
const TASKS_FILE = path.join(DATA_DIR, 'tasks.json');

const COMPETITOR_FEEDS = [
  { name: 'Wirecutter', url: 'https://www.nytimes.com/wirecutter/feed/' },
  { name: 'RTINGS', url: 'https://www.rtings.com/rss/reviews.xml' }
];

export function loadTasks(): TaskItem[] {
  try {
    if (!fs.existsSync(TASKS_FILE)) {
      return [];
    }
    const data = fs.readFileSync(TASKS_FILE, 'utf-8');
    return JSON.parse(data) as TaskItem[];
  } catch (error) {
    console.error('Failed to load tasks:', error);
    return [];
  }
}

export function saveTasks(tasks: unknown): boolean {
  try {
    if (!fs.existsSync(DATA_DIR)) {
      fs.mkdirSync(DATA_DIR, { recursive: true });
    }
    fs.writeFileSync(TASKS_FILE, JSON.stringify(tasks, null, 2), 'utf-8');
    return true;
  } catch (error) {
    const err = error as NodeJS.ErrnoException;
    if (err.code === 'EROFS') {
      console.warn('Read-only filesystem: skipping tasks file save');
    } else {
      console.error('Failed to save tasks:', error);
    }
    return false;
  }
}

function existsInSite(title: string): boolean {
  const normalized = title.toLowerCase();
  const allTitles = [
    ...guides.map(g => g.title),
    ...newsPosts.map(n => n.title),
    ...reviews.map(r => r.title),
    ...comparisons.map(c => c.title)
  ];

  return allTitles.some(t => {
    const lower = t.toLowerCase();
    const words = normalized.split(/\s+/).filter(w => w.length > 3);
    const matches = words.filter(w => lower.includes(w));
    return matches.length >= 2;
  });
}

export async function runCompetitiveBenchmark(): Promise<{ addedCount: number; newTasks: TaskItem[] }> {
  const parser = new Parser();
  const existingTasks = loadTasks();
  const newTasks: TaskItem[] = [];

  for (const feedConfig of COMPETITOR_FEEDS) {
    try {
      const feed = await parser.parseURL(feedConfig.url);
      const items = feed.items || [];

      for (const item of items) {
        if (!item.title || !item.link) continue;

        const taskTitle = `Review: ${item.title}`;
        const taskDescription = `Auto-generated benchmark task for competitor article: ${item.title}`;

        // Check if task already exists or content already covered
        const alreadyInTasks = existingTasks.some(t => t.sourceUrl === item.link);
        const coveredInSite = existsInSite(item.title);

        if (!alreadyInTasks && !coveredInSite) {
          const newTask: TaskItem = {
            id: crypto.randomUUID(),
            title: taskTitle,
            description: taskDescription,
            sourceUrl: item.link,
            competitor: feedConfig.name,
            status: 'pending',
            createdAt: new Date().toISOString()
          };
          newTasks.push(newTask);
        }
      }
    } catch (err) {
      console.error(`Failed to fetch/parse RSS feed for ${feedConfig.name}:`, err);
    }
  }

  if (newTasks.length > 0) {
    const updatedTasks = [...newTasks, ...existingTasks];
    saveTasks(updatedTasks);
  }

  return {
    addedCount: newTasks.length,
    newTasks
  };
}
