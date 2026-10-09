import crypto from "crypto";
import fs from "fs";
import path from "path";
import Parser from "rss-parser";
import { BenchmarkTask } from "@/types";

const DATA_DIR = path.join(process.cwd(), "data");
const TASKS_FILE = path.join(DATA_DIR, "tasks.json");

const RSS_FEEDS = [
  {
    name: "Wirecutter",
    url: "https://www.nytimes.com/wirecutter/feed/",
  },
  {
    name: "RTINGS",
    url: "https://www.rtings.com/rss/reviews.xml",
  },
];

const FALLBACK_TOPICS = [
  {
    title: "Best Noise-Canceling Headphones of 2025",
    description: "Benchmark review: Evaluate top wireless ANC headphones including Sony WH-1000XM5 and Bose QuietComfort Ultra.",
    source: "Wirecutter Fallback",
    url: "https://www.nytimes.com/wirecutter/reviews/best-noise-cancelling-headphones/",
  },
  {
    title: "Best 4K OLED TVs for Gaming & Movies",
    description: "Benchmark review: Comprehensive comparison of LG C4, Samsung S90D, and Sony A80L OLED TVs.",
    source: "RTINGS Fallback",
    url: "https://www.rtings.com/tv/reviews/best/by-type/oled",
  },
  {
    title: "Best Ergonomic Office Chairs",
    description: "Benchmark review: Detailed analysis of Herman Miller Aeron, Steelcase Gesture, and budget alternatives.",
    source: "Wirecutter Fallback",
    url: "https://www.nytimes.com/wirecutter/reviews/best-office-chair/",
  },
  {
    title: "Best Robot Vacuums for Pet Hair",
    description: "Benchmark review: Performance benchmarking for Roborock S8 MaxV, iRobot Roomba j9+, and Dreame X40.",
    source: "Wirecutter Fallback",
    url: "https://www.nytimes.com/wirecutter/reviews/best-robot-vacuum/",
  },
];

export async function getTasks(): Promise<BenchmarkTask[]> {
  try {
    if (!fs.existsSync(TASKS_FILE)) {
      return [];
    }
    const fileContent = fs.readFileSync(TASKS_FILE, "utf-8");
    const data: unknown = JSON.parse(fileContent);
    if (Array.isArray(data)) {
      return data as BenchmarkTask[];
    }
    return [];
  } catch (error) {
    console.warn("Failed to read tasks file:", error);
    return [];
  }
}

export async function saveTasks(tasks: unknown): Promise<boolean> {
  try {
    if (!fs.existsSync(DATA_DIR)) {
      fs.mkdirSync(DATA_DIR, { recursive: true });
    }
    fs.writeFileSync(TASKS_FILE, JSON.stringify(tasks, null, 2), "utf-8");
    return true;
  } catch (error) {
    if (error instanceof Error) {
      const err = error as NodeJS.ErrnoException;
      if (err.code === "EROFS") {
        console.warn("Read-only filesystem encountered (EROFS). Cannot write tasks to disk.");
        return false;
      }
    }
    console.error("Failed to save tasks:", error);
    return false;
  }
}

export async function runBenchmark(): Promise<{ addedCount: number; totalCount: number }> {
  const existingTasks = await getTasks();
  const existingTitles = new Set(existingTasks.map((t) => t.title.toLowerCase()));

  const parser = new Parser({
    headers: {
      "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
    },
    timeout: 5000,
  });

  const newTasks: BenchmarkTask[] = [];

  for (const feed of RSS_FEEDS) {
    try {
      const feedData = await parser.parseURL(feed.url);
      if (feedData && feedData.items) {
        for (const item of feedData.items.slice(0, 5)) {
          if (!item.title) continue;

          const taskTitle = `Review: ${item.title.trim()}`;
          if (!existingTitles.has(taskTitle.toLowerCase())) {
            existingTitles.add(taskTitle.toLowerCase());
            newTasks.push({
              id: crypto.randomUUID(),
              title: taskTitle,
              description: item.contentSnippet || item.summary || `Automated benchmark task created from ${feed.name} competitor analysis.`,
              source: feed.name,
              url: item.link || feed.url,
              status: "pending",
              createdAt: new Date().toISOString(),
            });
          }
        }
      }
    } catch (feedError) {
      console.warn(`Failed to fetch RSS feed from ${feed.name}:`, feedError);
    }
  }

  // If no new tasks were fetched from live RSS (e.g. network failure, 404, or CAPTCHA), use fallback competitor topics
  if (newTasks.length === 0) {
    for (const fallback of FALLBACK_TOPICS) {
      if (!existingTitles.has(fallback.title.toLowerCase())) {
        existingTitles.add(fallback.title.toLowerCase());
        newTasks.push({
          id: crypto.randomUUID(),
          title: fallback.title,
          description: fallback.description,
          source: fallback.source,
          url: fallback.url,
          status: "pending",
          createdAt: new Date().toISOString(),
        });
      }
    }
  }

  const updatedTasks = [...newTasks, ...existingTasks];
  await saveTasks(updatedTasks);

  return {
    addedCount: newTasks.length,
    totalCount: updatedTasks.length,
  };
}

export async function updateTaskStatus(
  taskId: string,
  status: BenchmarkTask["status"]
): Promise<BenchmarkTask | null> {
  const tasks = await getTasks();
  const index = tasks.findIndex((t) => t.id === taskId);
  if (index === -1) return null;

  tasks[index].status = status;
  await saveTasks(tasks);
  return tasks[index];
}
