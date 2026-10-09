import { NextRequest, NextResponse } from "next/server";
import { runBenchmark } from "@/lib/automation/benchmark";

export async function GET(request: NextRequest) {
  const authHeader = request.headers.get("authorization");
  const tokenFromHeader = authHeader?.replace("Bearer ", "");
  const searchParams = request.nextUrl.searchParams;
  const tokenFromQuery = searchParams.get("token");

  const providedToken = tokenFromHeader || tokenFromQuery;
  const cronSecretEnv = process.env.CRON_SECRET || "cron-secret-key";

  if (!providedToken || providedToken !== cronSecretEnv) {
    return NextResponse.json(
      { error: "Unauthorized: Invalid or missing secret token." },
      { status: 401 }
    );
  }

  try {
    const result = await runBenchmark();
    return NextResponse.json({
      success: true,
      message: "Daily competitive benchmark task executed successfully.",
      addedCount: result.addedCount,
      totalCount: result.totalCount,
    });
  } catch (error) {
    console.error("Cron benchmark execution failed:", error);
    return NextResponse.json(
      { error: "Failed to run benchmark execution." },
      { status: 500 }
    );
  }
}
