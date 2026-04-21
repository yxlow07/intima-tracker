"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";

type AdminNavbarProps = {
  isAuthenticated: boolean;
};

export default function AdminNavbar({ isAuthenticated }: AdminNavbarProps) {
  const [isOpen, setIsOpen] = useState(false);
  const pathname = usePathname();

  const isActivitiesPage = pathname.startsWith("/admin/activities");
  const isIdeasPage = pathname.startsWith("/admin/ideas");
  const isSchedulePage = pathname.startsWith("/admin/schedule");
  const isBookingsPage = pathname.startsWith("/admin/bookings");
  const isLoginPage = pathname === "/admin/login";

  const linkClass = (active: boolean) =>
    `rounded-full px-4 py-2 text-sm font-medium transition-colors ${
      active ? "bg-slate-900 text-white" : "text-slate-700 hover:bg-slate-100"
    }`;

  const handleLogout = async () => {
    const { logout } = await import("@/app/admin/actions");
    await logout();
  };

  return (
    <header className="sticky top-0 z-50 border-b border-slate-200 bg-white/95 backdrop-blur">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4 sm:px-6 lg:px-8">
        <Link href="/admin" className="text-base font-bold tracking-tight text-slate-900 sm:text-lg">
          Admin Panel
        </Link>

        {!isLoginPage && (
          <>
            <nav className="hidden items-center gap-2 sm:flex">
              <Link href="/admin/activities" className={linkClass(isActivitiesPage)}>Activities</Link>
              <Link href="/admin/ideas" className={linkClass(isIdeasPage)}>Ideas</Link>
              <Link href="/admin/schedule" className={linkClass(isSchedulePage)}>Schedule</Link>
              <Link href="/admin/bookings" className={linkClass(isBookingsPage)}>Bookings</Link>
            </nav>

            <div className="hidden items-center gap-2 sm:flex">
              <Link href="/" className="rounded-full px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-100">Home</Link>
              {isAuthenticated && (
                <button
                  onClick={handleLogout}
                  className="rounded-full bg-slate-900 px-4 py-2 text-sm font-medium text-white hover:bg-slate-700"
                >
                  Logout
                </button>
              )}
            </div>

            <button
              onClick={() => setIsOpen((value) => !value)}
              className="rounded-lg p-2 text-slate-700 hover:bg-slate-100 sm:hidden"
              aria-label="Toggle admin navigation"
            >
              <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={isOpen ? "M6 18L18 6M6 6l12 12" : "M4 6h16M4 12h16M4 18h16"} />
              </svg>
            </button>
          </>
        )}
      </div>

      {!isLoginPage && isOpen && (
        <nav className="border-t border-slate-200 px-4 py-3 sm:hidden">
          <div className="flex flex-col gap-2">
            <Link href="/admin/activities" onClick={() => setIsOpen(false)} className={linkClass(isActivitiesPage)}>Activities</Link>
            <Link href="/admin/ideas" onClick={() => setIsOpen(false)} className={linkClass(isIdeasPage)}>Ideas</Link>
            <Link href="/admin/schedule" onClick={() => setIsOpen(false)} className={linkClass(isSchedulePage)}>Schedule</Link>
            <Link href="/admin/bookings" onClick={() => setIsOpen(false)} className={linkClass(isBookingsPage)}>Bookings</Link>
            <Link href="/" onClick={() => setIsOpen(false)} className="rounded-full px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-100">Home</Link>
            {isAuthenticated && (
              <button
                onClick={() => {
                  setIsOpen(false);
                  handleLogout();
                }}
                className="rounded-full bg-slate-900 px-4 py-2 text-left text-sm font-medium text-white hover:bg-slate-700"
              >
                Logout
              </button>
            )}
          </div>
        </nav>
      )}
    </header>
  );
}
