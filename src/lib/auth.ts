import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { NextRequest } from "next/server";

const ADMIN_TOKEN = process.env.ADMIN_TOKEN || "dev-secret";

export async function getAdminToken() {
  const cookieStore = await cookies();
  return cookieStore.get("admin-token")?.value;
}

export async function checkAuth(request?: NextRequest) {
  if (request) {
    const authHeader = request.headers.get("Authorization");
    if (authHeader === `Bearer ${process.env.CRON_SECRET || "dev-secret"}`) {
      return true;
    }
    const token = request.nextUrl.searchParams.get("token");
    if (token === (process.env.CRON_SECRET || "dev-secret")) {
      return true;
    }
  }

  const token = await getAdminToken();
  return token === ADMIN_TOKEN;
}

export async function requireAuth() {
  const isAuthenticated = await checkAuth();
  if (!isAuthenticated) {
    redirect("/admin/login");
  }
}
