"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";

export async function loginAction(
  prevState: { error?: string } | null,
  formData: FormData
): Promise<{ error?: string }> {
  const token = formData.get("token") as string;
  const adminTokenEnv = process.env.ADMIN_TOKEN || "admin-secret-token";

  if (!token || token !== adminTokenEnv) {
    return { error: "Invalid admin token." };
  }

  const cookieStore = await cookies();
  cookieStore.set("admin-token", token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    maxAge: 86400, // 24 hours
    path: "/",
    sameSite: "lax",
  });

  redirect("/admin/tasks");
}

export async function logoutAction(): Promise<void> {
  const cookieStore = await cookies();
  cookieStore.delete("admin-token");
  redirect("/admin/login");
}
