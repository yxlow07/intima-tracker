import { redirect } from "next/navigation";
// import { cookies } from "next/headers";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Intima Tracker - Admin Dashboard",
  description: "Manage activities and user access.",
};

export default async function AdminDashboard() {
  // Middleware handles authentication
  redirect("/admin/activities");
}