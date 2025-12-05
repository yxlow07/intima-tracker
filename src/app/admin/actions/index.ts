"use server";

import { cookies } from "next/headers";
import { deleteActivity } from "@/lib/activity";
import { revalidatePath } from "next/cache";

import { redirect } from "next/navigation";

export async function logout() {
  (await cookies()).delete("admin-auth");
  redirect("/admin/login");
}

export async function deleteActivityAction(formData: FormData) {
  const id = formData.get("id") as string;
  await deleteActivity(id);
  revalidatePath("/admin/activities");
}
