"use server";

import { revalidatePath } from "next/cache";
import { requireAuth } from "@/lib/auth";
import { runBenchmark, updateTaskStatus } from "@/lib/automation/benchmark";
import { TaskStatus } from "@/types";

export async function triggerBenchmark(): Promise<void> {
  await requireAuth();
  await runBenchmark();
  revalidatePath("/admin/tasks");
}

export async function updateTaskStatusAction(
  taskId: string,
  status: TaskStatus
): Promise<void> {
  await requireAuth();
  await updateTaskStatus(taskId, status);
  revalidatePath("/admin/tasks");
}
