"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";

type NavbarProps = {
  currentPage?: "dashboard" | "calendar" | "tracking" | "ideas" | "booking";
};

export default function Navbar({ currentPage }: NavbarProps) {
  const [isOpen, setIsOpen] = useState(false);
  const pathname = usePathname();

  const isDashboard = currentPage === "dashboard" || pathname === "/";
  const isCalendar = currentPage === "calendar" || pathname.startsWith("/calendar");
  const isIdeas = currentPage === "ideas" || pathname.startsWith("/ideas");
  const isBooking = currentPage === "booking" || pathname.startsWith("/booking");

  const linkClass = (active: boolean) =>
    `rounded-full px-4 py-2 text-sm font-medium transition-colors ${
      active ? "bg-indigo-600 text-white" : "text-slate-700 hover:bg-slate-100"
    }`;

  return (
    <header className="sticky top-0 z-40 border-b border-slate-200 bg-white/90 backdrop-blur">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        <Link href="/" className="text-base font-bold tracking-tight text-slate-900 sm:text-lg">
          Intima Tracker
        </Link>

        <nav className="hidden items-center gap-2 sm:flex">
          <Link href="/" className={linkClass(isDashboard)}>Dashboard</Link>
          <Link href="/calendar" className={linkClass(isCalendar)}>Calendar</Link>
          <Link href="/ideas" className={linkClass(isIdeas)}>Ideas</Link>
          <Link href="/booking" className={linkClass(isBooking)}>Booking</Link>
          <Link href="/admin" className="rounded-full px-4 py-2 text-sm font-medium text-slate-700 transition-colors hover:bg-slate-100">Admin</Link>
        </nav>

        <button
          onClick={() => setIsOpen((value) => !value)}
          className="rounded-lg p-2 text-slate-700 hover:bg-slate-100 sm:hidden"
          aria-label="Toggle navigation"
        >
          <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={isOpen ? "M6 18L18 6M6 6l12 12" : "M4 6h16M4 12h16M4 18h16"} />
          </svg>
        </button>
      </div>

      {isOpen && (
        <nav className="border-t border-slate-200 px-4 py-3 sm:hidden">
          <div className="flex flex-col gap-2">
            <Link href="/" onClick={() => setIsOpen(false)} className={linkClass(isDashboard)}>Dashboard</Link>
            <Link href="/calendar" onClick={() => setIsOpen(false)} className={linkClass(isCalendar)}>Calendar</Link>
            <Link href="/ideas" onClick={() => setIsOpen(false)} className={linkClass(isIdeas)}>Ideas</Link>
            <Link href="/booking" onClick={() => setIsOpen(false)} className={linkClass(isBooking)}>Booking</Link>
            <Link href="/admin" onClick={() => setIsOpen(false)} className="rounded-full px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-100">Admin</Link>
          </div>
        </nav>
      )}
    </header>
  );
}
