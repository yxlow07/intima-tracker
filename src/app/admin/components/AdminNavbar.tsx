"use client";

import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";

type AdminNavbarProps = {
  isAuthenticated: boolean;
};

export default function AdminNavbar({ isAuthenticated }: AdminNavbarProps) {
  const [isOpen, setIsOpen] = useState(false);
  const pathname = usePathname();
  const navRef = useRef<HTMLDivElement>(null);
  const [indicatorStyle, setIndicatorStyle] = useState({ left: 0, width: 0 });

  const isActivitiesPage = pathname.startsWith("/admin/activities");
  const isIdeasPage = pathname.startsWith("/admin/ideas");
  const isSchedulePage = pathname.startsWith("/admin/schedule");

  // Update indicator position when pathname changes
  useEffect(() => {
    const updateIndicator = () => {
      if (!navRef.current) return;
      
      const activeLink = navRef.current.querySelector('[data-active="true"]') as HTMLElement;
      if (activeLink) {
        setIndicatorStyle({
          left: activeLink.offsetLeft,
          width: activeLink.offsetWidth,
        });
      }
    };

    updateIndicator();
    // Small delay to ensure DOM is ready
    const timeout = setTimeout(updateIndicator, 50);
    return () => clearTimeout(timeout);
  }, [pathname]);

  const handleLogout = async () => {
    const { logout } = await import("@/app/admin/actions");
    await logout();
  };

  return (
    <header
      className={`relative mt-6 mx-auto w-[95%] sm:w-fit border border-slate-200/50 bg-white/70 shadow-lg backdrop-blur-xl transition-all duration-300 ease-in-out ${
        isOpen ? "rounded-3xl" : "rounded-3xl"
      }`}
    >
      <div className="flex h-16 items-center justify-between sm:justify-center gap-8 px-6">
        <Link href="/admin" className="flex items-center gap-2">
          <h1 className="text-xl font-bold tracking-tight text-slate-900">
            Admin Panel
          </h1>
        </Link>

        {/* Desktop Navigation */}
        <nav ref={navRef} className="hidden sm:flex items-center gap-1 rounded-full bg-slate-100/50 p-1 relative">
          {/* Sliding indicator */}
          <div
            className="absolute top-1 bottom-1 bg-white rounded-full shadow-sm transition-all duration-300 ease-out"
            style={{
              left: indicatorStyle.left,
              width: indicatorStyle.width,
              opacity: indicatorStyle.width > 0 ? 1 : 0,
            }}
          />
          <Link
            href="/admin/activities"
            data-active={isActivitiesPage}
            className={`relative z-10 rounded-full px-4 py-1.5 text-sm font-medium transition-colors duration-300 ${
              isActivitiesPage
                ? "text-indigo-600"
                : "text-slate-600 hover:text-indigo-600"
            }`}
          >
            Activities
          </Link>
          <Link
            href="/admin/ideas"
            data-active={isIdeasPage}
            className={`relative z-10 rounded-full px-4 py-1.5 text-sm font-medium transition-colors duration-300 ${
              isIdeasPage
                ? "text-indigo-600"
                : "text-slate-600 hover:text-indigo-600"
            }`}
          >
            Ideas
          </Link>
          <Link
            href="/admin/schedule"
            data-active={isSchedulePage}
            className={`relative z-10 rounded-full px-4 py-1.5 text-sm font-medium transition-colors duration-300 ${
              isSchedulePage
                ? "text-indigo-600"
                : "text-slate-600 hover:text-indigo-600"
            }`}
          >
            Schedule
          </Link>
        </nav>

        {/* Desktop Actions */}
        <div className="hidden sm:flex items-center gap-2">
          <Link
            href="/"
            className="rounded-full px-3 py-1.5 text-sm font-medium text-slate-600 hover:text-indigo-600 transition-all"
          >
            ← Home
          </Link>
          {isAuthenticated && (
            <button
              onClick={handleLogout}
              className="rounded-full px-4 py-1.5 text-sm font-medium bg-slate-900 text-white hover:bg-slate-800 transition-all"
            >
              Logout
            </button>
          )}
        </div>

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
                href="/admin/activities"
                className={`block rounded-xl px-3 py-2 text-base font-medium transition-colors ${
                  isActivitiesPage
                    ? "bg-indigo-50 text-indigo-600"
                    : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
                }`}
                onClick={() => setIsOpen(false)}
              >
                Activities
              </Link>
              <Link
                href="/admin/ideas"
                className={`block rounded-xl px-3 py-2 text-base font-medium transition-colors ${
                  isIdeasPage
                    ? "bg-indigo-50 text-indigo-600"
                    : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
                }`}
                onClick={() => setIsOpen(false)}
              >
                Ideas
              </Link>
              <Link
                href="/admin/schedule"
                className={`block rounded-xl px-3 py-2 text-base font-medium transition-colors ${
                  isSchedulePage
                    ? "bg-indigo-50 text-indigo-600"
                    : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
                }`}
                onClick={() => setIsOpen(false)}
              >
                Schedule
              </Link>
              <div className="border-t border-slate-200/50 mt-2 pt-2">
                <Link
                  href="/"
                  className="block rounded-xl px-3 py-2 text-base font-medium text-slate-600 hover:bg-slate-50 hover:text-slate-900 transition-colors"
                  onClick={() => setIsOpen(false)}
                >
                  ← Back to Home
                </Link>
                {isAuthenticated && (
                  <button
                    onClick={() => {
                      setIsOpen(false);
                      handleLogout();
                    }}
                    className="w-full text-left block rounded-xl px-3 py-2 text-base font-medium text-red-600 hover:bg-red-50 hover:text-red-700 transition-colors"
                  >
                    Logout
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
