import Parser from 'rss-parser';
import fs from 'fs';
import path from 'path';
import { Task } from '@/types';

const parser = new Parser();

const COMPETITORS = [
  {
    name: 'Wirecutter' as const,
    rss: 'https://www.nytimes.com/wirecutter/feed/',
  },
  {
    name: 'RTINGS' as const,
    rss: 'https://www.rtings.com/rss/reviews.xml',
  },
];

const DATA_FILE = path.join(process.cwd(), 'data/tasks.json');

export async function runBenchmarking() {
  console.log('Starting daily benchmarking...');

  const existingTasks = loadTasks();
  const newTasks: Task[] = [];

  for (const competitor of COMPETITORS) {
    try {
      console.log(`Fetching feed from ${competitor.name}...`);
      const feed = await parser.parseURL(competitor.rss);

      for (const item of feed.items) {
        if (!item.link || !item.title) continue;

        // Simple duplicate detection by URL
        const alreadyExists = existingTasks.some(t => t.sourceUrl === item.link);
        if (alreadyExists) continue;

        // Determine type based on title or URL
        let type: Task['type'] = 'news';
        const titleLower = item.title.toLowerCase();
        if (titleLower.includes('best') || titleLower.includes('guide')) {
          type = 'guide';
        } else if (titleLower.includes('vs') || titleLower.includes('comparison')) {
          type = 'comparison';
        } else if (titleLower.includes('review')) {
          type = 'review';
        }

        const newTask: Task = {
          id: crypto.randomUUID(),
          title: `Review: ${item.title}`,
          description: item.contentSnippet || item.content || 'No description available.',
          status: 'pending',
          sourceUrl: item.link,
          type,
          competitor: competitor.name,
          createdAt: new Date().toISOString(),
        };

        newTasks.push(newTask);
      }
    } catch (error) {
      console.error(`Failed to fetch ${competitor.name} feed:`, error);
    }
  }

  if (newTasks.length > 0) {
    saveTasks([...existingTasks, ...newTasks]);
  }

  console.log(`Benchmarking complete. Found ${newTasks.length} new tasks.`);
  return newTasks;
}

function loadTasks(): Task[] {
  if (!fs.existsSync(DATA_FILE)) {
    return [];
  }
  try {
    const data = fs.readFileSync(DATA_FILE, 'utf8');
    return JSON.parse(data);
  } catch (error) {
    console.error('Error loading tasks:', error);
    return [];
  }
}

function saveTasks(tasks: Task[]) {
  const dir = path.dirname(DATA_FILE);
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
  try {
    fs.writeFileSync(DATA_FILE, JSON.stringify(tasks, null, 2), 'utf8');
  } catch (error) {
    // In Vercel environment, filesystem might be read-only
    const err = error as NodeJS.ErrnoException;
    if (err.code === 'EROFS') {
        console.warn('Warning: Read-only filesystem. Task not saved to disk.');
    } else {
        console.error('Error saving tasks:', error);
    }
  }
}
