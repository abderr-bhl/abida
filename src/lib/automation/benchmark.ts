import fs from 'fs';
import path from 'path';
import crypto from 'crypto';
import Parser from 'rss-parser';

export interface CompetitorItem {
  id: string;
  source: string;
  title: string;
  link: string;
  pubDate: string;
  category?: string;
  summary?: string;
}

export type TaskStatus = 'pending' | 'in_progress' | 'completed' | 'ignored';
export type TaskPriority = 'high' | 'medium' | 'low';
export type ContentType = 'review' | 'guide' | 'comparison';

export interface AutomatedTask {
  id: string;
  title: string;
  contentType: ContentType;
  category: string;
  targetKeyword: string;
  priority: TaskPriority;
  status: TaskStatus;
  competitorSource: string;
  competitorUrl: string;
  competitorTitle: string;
  description: string;
  createdAt: string;
  updatedAt: string;
}

const TASKS_FILE_PATH = path.join(process.cwd(), 'data', 'tasks.json');

const FALLBACK_COMPETITOR_TOPICS = [
  {
    title: 'The Best Wireless Noise-Canceling Headphones of 2025',
    link: 'https://www.nytimes.com/wirecutter/reviews/best-wireless-noise-canceling-headphones/',
    source: 'Wirecutter',
    pubDate: new Date().toISOString(),
    category: 'Electronics',
    summary: 'Testing over 30 noise-canceling headphones including Sony, Bose, and Apple.',
  },
  {
    title: 'The Best OLED and 4K TVs for Movies and Gaming',
    link: 'https://www.rtings.com/tv/reviews/best/by-usage/gaming',
    source: 'RTINGS',
    pubDate: new Date().toISOString(),
    category: 'Home Theater',
    summary: 'Lab testing 4K and 8K displays for HDR brightness, contrast, and response time.',
  },
  {
    title: 'The Best Air Fryers Tested and Reviewed',
    link: 'https://www.nytimes.com/wirecutter/reviews/best-air-fryer/',
    source: 'Wirecutter',
    pubDate: new Date().toISOString(),
    category: 'Kitchen',
    summary: 'Evaluating air fryer baskets, temperature consistency, and ease of cleaning.',
  },
  {
    title: 'The Best Ergonomic Office Chairs for Working from Home',
    link: 'https://www.nytimes.com/wirecutter/reviews/best-office-chair/',
    source: 'Wirecutter',
    pubDate: new Date().toISOString(),
    category: 'Home & Office',
    summary: 'Ergonomic tests for lumbar support, adjustments, and breathable mesh durability.',
  },
  {
    title: 'The Best Robot Vacuums with Mop Combinations',
    link: 'https://www.rtings.com/robot-vacuum/reviews/best/robot-vacuum-mop-combo',
    source: 'RTINGS',
    pubDate: new Date().toISOString(),
    category: 'Smart Home',
    summary: 'Testing obstacle avoidance, carpet suction, and self-emptying base performance.',
  },
];

function ensureDataDirectory(): void {
  const dataDir = path.join(process.cwd(), 'data');
  try {
    if (!fs.existsSync(dataDir)) {
      fs.mkdirSync(dataDir, { recursive: true });
    }
  } catch (err: unknown) {
    if (err instanceof Error) {
      const nodeErr = err as NodeJS.ErrnoException;
      if (nodeErr.code === 'EROFS') {
        console.warn('Filesystem is read-only. Cannot create directory:', dataDir);
      }
    }
  }
}

function loadData<T>(filePath: string, defaultValue: T): T {
  try {
    if (fs.existsSync(filePath)) {
      const content = fs.readFileSync(filePath, 'utf-8');
      return JSON.parse(content) as T;
    }
  } catch (err: unknown) {
    console.warn(`Could not read ${filePath}:`, err);
  }
  return defaultValue;
}

function saveData<T>(filePath: string, data: T): boolean {
  try {
    ensureDataDirectory();
    fs.writeFileSync(filePath, JSON.stringify(data, null, 2), 'utf-8');
    return true;
  } catch (err: unknown) {
    if (err instanceof Error) {
      const nodeErr = err as NodeJS.ErrnoException;
      if (nodeErr.code === 'EROFS') {
        console.warn('Read-only filesystem: unable to persist to', filePath);
        return false;
      }
    }
    console.error('Error saving data to', filePath, err);
    return false;
  }
}

export function getAllTasks(): AutomatedTask[] {
  return loadData<AutomatedTask[]>(TASKS_FILE_PATH, []);
}

export function saveAllTasks(tasks: AutomatedTask[]): boolean {
  return saveData<AutomatedTask[]>(TASKS_FILE_PATH, tasks);
}

export function updateTaskStatus(taskId: string, status: TaskStatus): AutomatedTask | null {
  const tasks = getAllTasks();
  const taskIndex = tasks.findIndex(t => t.id === taskId);
  if (taskIndex === -1) return null;

  tasks[taskIndex].status = status;
  tasks[taskIndex].updatedAt = new Date().toISOString();
  saveAllTasks(tasks);
  return tasks[taskIndex];
}

function categorizeTitle(title: string): { category: string; contentType: ContentType; keyword: string } {
  const lower = title.toLowerCase();
  let contentType: ContentType = 'review';
  if (lower.includes('vs') || lower.includes('versus') || lower.includes('compared')) {
    contentType = 'comparison';
  } else if (lower.includes('guide') || lower.includes('how to') || lower.includes('what to know') || lower.includes('best')) {
    contentType = 'guide';
  }

  let category = 'General Tech';
  if (lower.includes('headphone') || lower.includes('earbud') || lower.includes('audio') || lower.includes('speaker')) {
    category = 'Audio';
  } else if (lower.includes('tv') || lower.includes('oled') || lower.includes('display') || lower.includes('projector')) {
    category = 'Home Theater';
  } else if (lower.includes('kitchen') || lower.includes('cook') || lower.includes('fryer') || lower.includes('blender') || lower.includes('coffee')) {
    category = 'Kitchen';
  } else if (lower.includes('chair') || lower.includes('desk') || lower.includes('office') || lower.includes('monitor')) {
    category = 'Home & Office';
  } else if (lower.includes('vacuum') || lower.includes('smart') || lower.includes('thermostat') || lower.includes('security')) {
    category = 'Smart Home';
  } else if (lower.includes('phone') || lower.includes('iphone') || lower.includes('android') || lower.includes('laptop')) {
    category = 'Electronics';
  }

  const cleanKeyword = title
    .replace(/^the best /i, '')
    .replace(/ of \d{4}/i, '')
    .replace(/ tested and reviewed/i, '')
    .trim();

  return { category, contentType, keyword: cleanKeyword };
}

export async function fetchCompetitorFeeds(): Promise<CompetitorItem[]> {
  const items: CompetitorItem[] = [];
  const parser = new Parser({
    headers: {
      'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36',
      'Accept': 'application/rss+xml, application/xml, text/xml, */*',
    },
    timeout: 8000,
  });

  try {
    const wirecutterFeed = await parser.parseURL('https://www.nytimes.com/wirecutter/feed/');
    if (wirecutterFeed && wirecutterFeed.items) {
      for (const item of wirecutterFeed.items) {
        if (item.title && item.link) {
          items.push({
            id: crypto.randomUUID(),
            source: 'Wirecutter',
            title: item.title.trim(),
            link: item.link.trim(),
            pubDate: item.pubDate || new Date().toISOString(),
            category: item.categories?.[0] || undefined,
            summary: item.contentSnippet || item.content || '',
          });
        }
      }
    }
  } catch (err: unknown) {
    console.warn('Wirecutter RSS fetch failed or blocked; using fallback competitor dataset.', err);
  }

  if (items.length === 0) {
    for (const fb of FALLBACK_COMPETITOR_TOPICS) {
      items.push({
        id: crypto.randomUUID(),
        ...fb,
      });
    }
  }

  return items;
}

export async function runCompetitorBenchmark(): Promise<{
  scannedCount: number;
  newTasksCount: number;
  tasks: AutomatedTask[];
}> {
  const competitorItems = await fetchCompetitorFeeds();
  const existingTasks = getAllTasks();
  const existingUrls = new Set(existingTasks.map(t => t.competitorUrl));
  const existingTitles = new Set(existingTasks.map(t => t.competitorTitle.toLowerCase()));

  const newTasks: AutomatedTask[] = [];

  for (const item of competitorItems) {
    if (existingUrls.has(item.link) || existingTitles.has(item.title.toLowerCase())) {
      continue;
    }

    const { category, contentType, keyword } = categorizeTitle(item.title);
    const prefix = contentType === 'review' ? 'Review:' : contentType === 'guide' ? 'Buyer\'s Guide:' : 'Comparison:';

    const taskTitle = `${prefix} ${keyword} for US Buyers`;

    const newTask: AutomatedTask = {
      id: crypto.randomUUID(),
      title: taskTitle,
      contentType,
      category: item.category || category,
      targetKeyword: keyword,
      priority: contentType === 'guide' ? 'high' : 'medium',
      status: 'pending',
      competitorSource: item.source,
      competitorUrl: item.link,
      competitorTitle: item.title,
      description: `Competitor ${item.source} published: "${item.title}". Research US market availability, Amazon top-sellers, and produce competitive content with affiliate monetization.`,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    newTasks.push(newTask);
    existingUrls.add(item.link);
    existingTitles.add(item.title.toLowerCase());
  }

  const updatedTasks = [...newTasks, ...existingTasks];
  saveAllTasks(updatedTasks);

  return {
    scannedCount: competitorItems.length,
    newTasksCount: newTasks.length,
    tasks: updatedTasks,
  };
}
