import Parser from 'rss-parser';
import fs from 'fs';
import path from 'path';
import { randomUUID } from 'crypto';

export type TaskStatus = 'pending' | 'in_progress' | 'completed' | 'dismissed';
export type TaskPriority = 'low' | 'medium' | 'high';

export interface Task {
  id: string;
  title: string;
  description: string;
  source: string;
  sourceUrl: string;
  status: TaskStatus;
  createdAt: string;
  category: string;
  priority: TaskPriority;
}

const DATA_DIR = path.join(process.cwd(), 'data');
const TASKS_FILE = path.join(DATA_DIR, 'tasks.json');

// In-memory task cache as fallback for read-only filesystems (e.g., Vercel)
let inMemoryTasks: Task[] | null = null;

const FALLBACK_TOPICS = [
  {
    title: 'Review: Top Noise-Canceling Headphones for US Travelers (2025)',
    description: 'Competitive analysis of premium wireless active noise-canceling headphones comparing Sony, Bose, and Apple.',
    source: 'Wirecutter',
    sourceUrl: 'https://www.nytimes.com/wirecutter/reviews/best-wireless-headphones/',
    category: 'Audio',
    priority: 'high' as TaskPriority,
  },
  {
    title: 'Guide: Best Ergonomic Office Chairs for Remote Work',
    description: 'Comprehensive buying guide testing lumbar support, adjustability, and durability for home office setups.',
    source: 'Wirecutter',
    sourceUrl: 'https://www.nytimes.com/wirecutter/reviews/best-office-chair/',
    category: 'Home Office',
    priority: 'high' as TaskPriority,
  },
  {
    title: 'Comparison: OLED vs QLED 4K TVs in 2025',
    description: 'Detailed technical comparison evaluating peak brightness, contrast ratios, and gaming features.',
    source: 'RTINGS',
    sourceUrl: 'https://www.rtings.com/tv/reviews/best/by-type/oled',
    category: 'Electronics',
    priority: 'medium' as TaskPriority,
  },
  {
    title: 'Review: Premium Robot Vacuums for Pet Hair and Hardwood',
    description: 'In-depth testing of self-emptying robot vacuums with advanced obstacle detection.',
    source: 'Wirecutter',
    sourceUrl: 'https://www.nytimes.com/wirecutter/reviews/best-robot-vacuum-cleaners/',
    category: 'Home & Kitchen',
    priority: 'medium' as TaskPriority,
  },
  {
    title: 'Guide: Essential Smart Home Security Systems for US Homes',
    description: 'Evaluating wireless DIY security systems on monitoring costs, sensor reliability, and app integrations.',
    source: 'RTINGS',
    sourceUrl: 'https://www.rtings.com/',
    category: 'Smart Home',
    priority: 'high' as TaskPriority,
  },
];

const INITIAL_DEMO_TASKS: Task[] = [
  {
    id: 'demo-task-1',
    title: 'Review: Best Wireless Earbuds for iPhone and Android Users',
    description: 'Competitor Wirecutter recently published an updated guide on ANC earbuds. Benchmark features and prices.',
    source: 'Wirecutter',
    sourceUrl: 'https://www.nytimes.com/wirecutter/reviews/best-wireless-earbuds/',
    status: 'pending',
    createdAt: new Date().toISOString(),
    category: 'Audio',
    priority: 'high',
  },
  {
    id: 'demo-task-2',
    title: 'Guide: Best Laptops for College Students in 2025',
    description: 'Competitor RTINGS updated their student laptop recommendations. Compare battery life tests and value picks.',
    source: 'RTINGS',
    sourceUrl: 'https://www.rtings.com/laptop/reviews/best/by-usage/students',
    status: 'in_progress',
    createdAt: new Date(Date.now() - 86400000).toISOString(),
    category: 'Computers',
    priority: 'medium',
  },
];

function safeJsonParse(content: string): unknown {
  try {
    return JSON.parse(content);
  } catch {
    return null;
  }
}

export async function getTasks(): Promise<Task[]> {
  if (inMemoryTasks !== null) {
    return inMemoryTasks;
  }

  try {
    if (fs.existsSync(TASKS_FILE)) {
      const data = fs.readFileSync(TASKS_FILE, 'utf-8');
      const parsed = safeJsonParse(data);
      if (Array.isArray(parsed)) {
        inMemoryTasks = parsed as Task[];
        return inMemoryTasks;
      }
    }
  } catch (err: unknown) {
    console.warn('Unable to read tasks file from filesystem:', err);
  }

  inMemoryTasks = [...INITIAL_DEMO_TASKS];
  saveTasks(inMemoryTasks);
  return inMemoryTasks;
}

function saveTasks(tasks: Task[]): void {
  inMemoryTasks = tasks;
  try {
    if (!fs.existsSync(DATA_DIR)) {
      fs.mkdirSync(DATA_DIR, { recursive: true });
    }
    fs.writeFileSync(TASKS_FILE, JSON.stringify(tasks, null, 2), 'utf-8');
  } catch (err: unknown) {
    if (err instanceof Error && (err as NodeJS.ErrnoException).code === 'EROFS') {
      console.warn('Read-only filesystem encountered (EROFS). Operating with in-memory task state.');
    } else {
      console.warn('Failed to save tasks to file:', err);
    }
  }
}

export async function updateTaskStatus(id: string, status: TaskStatus): Promise<Task | null> {
  const tasks = await getTasks();
  const taskIndex = tasks.findIndex((t) => t.id === id);
  if (taskIndex === -1) {
    return null;
  }

  tasks[taskIndex] = {
    ...tasks[taskIndex],
    status,
  };

  saveTasks(tasks);
  return tasks[taskIndex];
}

interface FeedSource {
  name: string;
  url: string;
  category: string;
}

const FEED_SOURCES: FeedSource[] = [
  {
    name: 'Wirecutter',
    url: 'https://www.nytimes.com/wirecutter/feed/',
    category: 'Home & Tech',
  },
  {
    name: 'RTINGS',
    url: 'https://www.rtings.com/rss/reviews.xml',
    category: 'Electronics',
  },
];

export async function runBenchmark(): Promise<{
  success: boolean;
  newTasksCount: number;
  tasks: Task[];
}> {
  const currentTasks = await getTasks();
  const existingTitles = new Set(currentTasks.map((t) => t.title.toLowerCase()));

  const parser = new Parser({
    headers: {
      'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) ReviewGuidBot/1.0',
      Accept: 'application/rss+xml, application/xml, text/xml; q=0.1',
    },
    timeout: 5000,
  });

  const newTasks: Task[] = [];

  for (const source of FEED_SOURCES) {
    try {
      const feed = await parser.parseURL(source.url);
      if (feed && feed.items && feed.items.length > 0) {
        for (const item of feed.items.slice(0, 3)) {
          if (!item.title) continue;

          const rawTitle = item.title.trim();
          const taskTitle = rawTitle.startsWith('Review:') || rawTitle.startsWith('Guide:')
            ? rawTitle
            : `Review: ${rawTitle}`;

          if (!existingTitles.has(taskTitle.toLowerCase())) {
            const newTask: Task = {
              id: randomUUID(),
              title: taskTitle,
              description: item.contentSnippet || item.summary || `Automated task created from competitor feed ${source.name}.`,
              source: source.name,
              sourceUrl: item.link || source.url,
              status: 'pending',
              createdAt: new Date().toISOString(),
              category: source.category,
              priority: 'high',
            };
            newTasks.push(newTask);
            existingTitles.add(taskTitle.toLowerCase());
          }
        }
      }
    } catch (err: unknown) {
      console.warn(`Failed to fetch or parse RSS feed from ${source.name} (${source.url}):`, err);
    }
  }

  // If no new tasks were identified from live feeds (e.g., feed down, captcha, network error, or duplicates), use fallback competitor topics
  if (newTasks.length === 0) {
    for (const fallback of FALLBACK_TOPICS) {
      if (!existingTitles.has(fallback.title.toLowerCase())) {
        const newTask: Task = {
          id: randomUUID(),
          title: fallback.title,
          description: fallback.description,
          source: fallback.source,
          sourceUrl: fallback.sourceUrl,
          status: 'pending',
          createdAt: new Date().toISOString(),
          category: fallback.category,
          priority: fallback.priority,
        };
        newTasks.push(newTask);
        existingTitles.add(fallback.title.toLowerCase());
        break; // Add one fallback task per benchmark run if no live items added
      }
    }
  }

  const updatedTasks = [...newTasks, ...currentTasks];
  saveTasks(updatedTasks);

  return {
    success: true,
    newTasksCount: newTasks.length,
    tasks: updatedTasks,
  };
}
