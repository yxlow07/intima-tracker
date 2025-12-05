"use client";

import { useState } from "react";
import Link from "next/link";

type NavbarProps = {
  currentPage?: "dashboard" | "calendar" | "tracking" | "ideas";
};

export default function Navbar({ currentPage }: NavbarProps) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <header
      className={`relative mt-6 mx-auto w-[95%] sm:w-fit border border-slate-200/50 bg-white/70 shadow-lg backdrop-blur-xl transition-all duration-300 ease-in-out ${
        isOpen ? "rounded-3xl" : "rounded-3xl"
      }`}
    >
      <div className="flex h-16 items-center justify-between sm:justify-center gap-8 px-6">
        <Link href="/" className="flex items-center gap-2">
          <h1 className="text-xl font-bold tracking-tight text-slate-900">
            Intima Tracker
          </h1>
        </Link>

        {/* Desktop Navigation */}
        <nav className="hidden sm:flex items-center gap-1 rounded-full bg-slate-100/50 p-1">
          <Link
            href="/"
            className={`rounded-full px-4 py-1.5 text-sm font-medium transition-all ${
              currentPage === "dashboard"
                ? "bg-white text-indigo-600 shadow-sm"
                : "text-slate-600 hover:text-indigo-600"
            }`}
          >
            Dashboard
          </Link>
          <Link
            href="/calendar"
            className={`rounded-full px-4 py-1.5 text-sm font-medium transition-all ${
              currentPage === "calendar"
                ? "bg-white text-indigo-600 shadow-sm"
                : "text-slate-600 hover:text-indigo-600"
            }`}
          >
            Calendar
          </Link>
          <Link
            href="/ideas"
            className={`rounded-full px-4 py-1.5 text-sm font-medium transition-all ${
              currentPage === "ideas"
                ? "bg-white text-indigo-600 shadow-sm"
                : "text-slate-600 hover:text-indigo-600"
            }`}
          >
            Ideas
          </Link>
        </nav>

        {/* Mobile Menu Button */}
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="rounded-full p-2 text-slate-600 hover:bg-slate-100 hover:text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500 sm:hidden"
        >
          <span className="sr-only">Open main menu</span>
          {isOpen ? (
            <svg
              className="h-6 w-6"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth="1.5"
              stroke="currentColor"
              aria-hidden="true"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          ) : (
            <svg
              className="h-6 w-6"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth="1.5"
              stroke="currentColor"
              aria-hidden="true"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5"
              />
            </svg>
          )}
        </button>
      </div>

      {/* Mobile Menu */}
      <div
        className={`grid transition-[grid-template-rows] duration-300 ease-in-out sm:hidden ${
          isOpen ? "grid-rows-[1fr]" : "grid-rows-[0fr]"
        }`}
      >
        <div className="overflow-hidden">
          <div className="border-t border-slate-200/50 px-4 pb-4 pt-2">
            <div className="space-y-1">
              <Link
                href="/"
                className={`block rounded-xl px-3 py-2 text-base font-medium transition-colors ${
                  currentPage === "dashboard"
                    ? "bg-indigo-50 text-indigo-600"
                    : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
                }`}
                onClick={() => setIsOpen(false)}
              >
                Dashboard
              </Link>
              <Link
                href="/calendar"
                className={`block rounded-xl px-3 py-2 text-base font-medium transition-colors ${
                  currentPage === "calendar"
                    ? "bg-indigo-50 text-indigo-600"
                    : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
                }`}
                onClick={() => setIsOpen(false)}
              >
                Calendar
              </Link>
              <Link
                href="/ideas"
                className={`block rounded-xl px-3 py-2 text-base font-medium transition-colors ${
                  currentPage === "ideas"
                    ? "bg-indigo-50 text-indigo-600"
                    : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
                }`}
                onClick={() => setIsOpen(false)}
              >
                Ideas
              </Link>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
