"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";

export default function AdminShell({ children, isAuthenticated }: { children: React.ReactNode, isAuthenticated: boolean }) {
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const pathname = usePathname();

    return (
        <div className="flex min-h-screen bg-slate-50">
            {/* Mobile sidebar backdrop */}
            {sidebarOpen && (
                <div
                    className="fixed inset-0 z-40 bg-slate-900/50 lg:hidden"
                    onClick={() => setSidebarOpen(false)}
                />
            )}

            {/* Sidebar */}
            <aside
                className={`fixed inset-y-0 left-0 z-50 w-64 transform bg-slate-900 text-white shadow-xl transition-transform duration-300 ease-in-out lg:static lg:translate-x-0 flex flex-col ${sidebarOpen ? "translate-x-0" : "-translate-x-full"
                    }`}
            >
                <div className="flex h-16 items-center justify-between px-6 border-b border-slate-800">
                    <span className="text-xl font-bold text-white">Admin Panel</span>
                    <button
                        className="lg:hidden text-slate-400 hover:text-white focus:outline-none"
                        onClick={() => setSidebarOpen(false)}
                    >
                        <span className="sr-only">Close sidebar</span>
                        <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                </div>
                <nav className="mt-6 px-3 space-y-1 flex-1">
                    <Link
                        href="/admin/activities"
                        className={`group flex items-center rounded-md px-3 py-2 text-sm font-medium transition-colors ${pathname.startsWith("/admin/activities")
                            ? "bg-slate-800 text-white"
                            : "text-slate-300 hover:bg-slate-800 hover:text-white"
                            }`}
                        onClick={() => setSidebarOpen(false)}
                    >
                        <svg
                            className={`mr-3 h-5 w-5 flex-shrink-0 transition-colors ${pathname.startsWith("/admin/activities")
                                ? "text-white"
                                : "text-slate-400 group-hover:text-white"
                                }`}
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                        >
                            <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01"
                            />
                        </svg>
                        Activities
                    </Link>
                    <Link
                        href="/admin/ideas"
                        className={`group flex items-center rounded-md px-3 py-2 text-sm font-medium transition-colors ${pathname.startsWith("/admin/ideas")
                            ? "bg-slate-800 text-white"
                            : "text-slate-300 hover:bg-slate-800 hover:text-white"
                            }`}
                        onClick={() => setSidebarOpen(false)}
                    >
                        <svg
                            className={`mr-3 h-5 w-5 flex-shrink-0 transition-colors ${pathname.startsWith("/admin/ideas")
                                ? "text-white"
                                : "text-slate-400 group-hover:text-white"
                                }`}
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                        >
                            <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z"
                            />
                        </svg>
                        Affiliate Ideas
                    </Link>
                </nav>
                <div className="px-3 pb-4 border-t border-slate-800 pt-3 space-y-1">
                    {isAuthenticated && (
                        <button
                            onClick={async () => {
                                const { logout } = await import("@/app/admin/actions");
                                await logout();
                            }}
                            className="w-full group flex items-center rounded-md px-3 py-2 text-sm font-medium text-slate-300 hover:bg-slate-800 hover:text-white transition-colors"
                        >
                            <svg
                                className="mr-3 h-5 w-5 flex-shrink-0 text-slate-400 group-hover:text-white transition-colors"
                                fill="none"
                                viewBox="0 0 24 24"
                                stroke="currentColor"
                            >
                                <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
                                />
                            </svg>
                            Logout
                        </button>
                    )}
                    <Link
                        href="/"
                        className="group flex items-center rounded-md px-3 py-2 text-sm font-medium text-slate-300 hover:bg-slate-800 hover:text-white transition-colors"
                        onClick={() => setSidebarOpen(false)}
                    >
                        <svg
                            className="mr-3 h-5 w-5 flex-shrink-0 text-slate-400 group-hover:text-white transition-colors"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                        >
                            <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M10 19l-7-7m0 0l7-7m-7 7h18"
                            />
                        </svg>
                        Back to Homepage
                    </Link>
                </div>
            </aside>

            {/* Main content wrapper */}
            <div className="flex flex-1 flex-col overflow-hidden">
                {/* Mobile header */}
                <header className="flex h-16 items-center border-b border-slate-200 bg-white px-4 shadow-sm lg:hidden">
                    <button
                        type="button"
                        className="text-slate-500 hover:text-slate-700 focus:outline-none"
                        onClick={() => setSidebarOpen(true)}
                    >
                        <span className="sr-only">Open sidebar</span>
                        <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                        </svg>
                    </button>
                    <span className="ml-4 text-lg font-semibold text-slate-900">Admin Panel</span>
                </header>

                {/* Page content */}
                <main className="flex-1 overflow-y-auto p-4 sm:p-8">
                    {children}
                </main>
            </div>
        </div>
    );
}
