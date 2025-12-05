import type { Metadata } from "next";
import AdminShell from "./components/AdminShell";

export const metadata: Metadata = {
  title: "Intima Tracker - Admin",
  description: "Admin panel for managing activities.",
};

import { cookies } from "next/headers";
import { verifySession } from "@/lib/auth";

export default async function AdminLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const cookieStore = await cookies();
  const token = cookieStore.get("admin-auth")?.value;
  const session = token ? await verifySession(token) : null;
  const isAuthenticated = !!session;

  return <AdminShell isAuthenticated={isAuthenticated}>{children}</AdminShell>;
}
