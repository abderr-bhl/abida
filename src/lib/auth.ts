import { cookies } from "next/headers";
import { redirect } from "next/navigation";

export async function getAdminToken(): Promise<string | undefined> {
  const cookieStore = await cookies();
  return cookieStore.get("admin-token")?.value;
}

export async function isAuthenticated(): Promise<boolean> {
  const token = await getAdminToken();
  const adminTokenEnv = process.env.ADMIN_TOKEN || "admin-secret-token";
  return token === adminTokenEnv;
}

export async function requireAuth(): Promise<void> {
  const authed = await isAuthenticated();
  if (!authed) {
    redirect("/admin/login");
  }
}
