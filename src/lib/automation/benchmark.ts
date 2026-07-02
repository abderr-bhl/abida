import Parser from 'rss-parser';
import fs from 'fs/promises';
import path from 'path';
import { Task } from '@/types';
import crypto from 'crypto';

const parser = new Parser();

const FEEDS = [
  { name: 'Wirecutter', url: 'https://www.nytimes.com/wirecutter/feed/' },
  { name: 'RTINGS', url: 'https://www.rtings.com/rss/reviews.xml' }
];

const DATA_FILE = path.join(process.cwd(), 'data', 'tasks.json');

async function loadTasks(): Promise<Task[]> {
  try {
    const data = await fs.readFile(DATA_FILE, 'utf-8');
    return JSON.parse(data);
  } catch {
    return [];
  }
}

async function saveTasks(tasks: Task[]): Promise<void> {
  try {
    await fs.writeFile(DATA_FILE, JSON.stringify(tasks, null, 2));
  } catch (error: unknown) {
    const err = error as NodeJS.ErrnoException;
    if (err.code === 'EROFS') {
      console.warn('Warning: Filesystem is read-only. Data not persisted to disk.');
    } else {
      console.error('Error saving tasks:', error);
    }
  }
}

export async function runBenchmark() {
  const existingTasks = await loadTasks();
  const existingUrls = new Set(existingTasks.map(t => t.sourceUrl));
  const newTasks: Task[] = [];

  for (const feed of FEEDS) {
    try {
      console.log(`Fetching feed from ${feed.name}...`);
      const feedData = await parser.parseURL(feed.url);

      for (const item of feedData.items) {
        if (item.link && !existingUrls.has(item.link)) {
          const newTask: Task = {
            id: crypto.randomUUID(),
            title: `Analyser : ${item.title || 'Nouveau produit'}`,
            description: `Benchmark de la concurrence (${feed.name}) : ${item.contentSnippet || 'Pas de description'}`,
            status: 'todo',
            sourceUrl: item.link,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
          };
          newTasks.push(newTask);
          existingUrls.add(item.link);
        }
      }
    } catch (error) {
      console.error(`Error fetching ${feed.name}:`, error);
    }
  }

  if (newTasks.length > 0) {
    await saveTasks([...newTasks, ...existingTasks]);
  }

  return {
    processedFeeds: FEEDS.length,
    newTasksCount: newTasks.length,
  };
}
