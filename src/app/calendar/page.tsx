"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import Navbar from "@/components/Navbar";

type Activity = {
    id: string;
    activityName: string;
    description?: string;
    activityDate?: string;
    activityType?: string;
    affiliate?: string;
    status: string;
    publicViewCount: number;
    uniqueToken: string;
    formType: "SAP" | "ASF";
    sapActivityId?: string;
    createdAt: string;
    updatedAt: string;
};

type DayCell = {
    date: Date;
    isCurrentMonth: boolean;
    activities: Activity[];
};

export default function CalendarPage() {
    const [activities, setActivities] = useState<Activity[]>([]);
    const [currentDate, setCurrentDate] = useState(new Date());
    const [currentWeekStart, setCurrentWeekStart] = useState(() => {
        const now = new Date();
        const day = now.getDay(); // 0 is Sunday
        const diff = now.getDate() - day;
        return new Date(now.setDate(diff));
    });
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        // Fetch only SAP activities for calendar (to avoid duplicates)
        fetch("/api/activities?forCalendar=true")
            .then((res) => res.json())
            .then((data) => {
                setActivities(data);
                setLoading(false);
            })
            .catch((err) => {
                console.error("Failed to fetch activities:", err);
                setLoading(false);
            });
    }, []);

    const getActivitiesForDate = (date: Date): Activity[] => {
        return activities.filter((activity) => {
            if (!activity.activityDate) return false;
            const activityDate = new Date(activity.activityDate);
            return (
                activityDate.getDate() === date.getDate() &&
                activityDate.getMonth() === date.getMonth() &&
                activityDate.getFullYear() === date.getFullYear()
            );
        });
    };

    const getDaysInMonth = (date: Date): DayCell[] => {
        const year = date.getFullYear();
        const month = date.getMonth();

        const firstDay = new Date(year, month, 1);
        const lastDay = new Date(year, month + 1, 0);

        const daysInMonth = lastDay.getDate();
        const startingDayOfWeek = firstDay.getDay();

        const days: DayCell[] = [];

        // Add previous month's days
        const prevMonthLastDay = new Date(year, month, 0);
        for (let i = startingDayOfWeek - 1; i >= 0; i--) {
            const date = new Date(year, month - 1, prevMonthLastDay.getDate() - i);
            days.push({
                date,
                isCurrentMonth: false,
                activities: getActivitiesForDate(date),
            });
        }

        // Add current month's days
        for (let day = 1; day <= daysInMonth; day++) {
            const date = new Date(year, month, day);
            days.push({
                date,
                isCurrentMonth: true,
                activities: getActivitiesForDate(date),
            });
        }

        // Add next month's days to complete the grid
        const remainingDays = 42 - days.length; // 6 rows * 7 days
        for (let day = 1; day <= remainingDays; day++) {
            const date = new Date(year, month + 1, day);
            days.push({
                date,
                isCurrentMonth: false,
                activities: getActivitiesForDate(date),
            });
        }

        return days;
    };

    const getDaysInWeek = (startDate: Date): DayCell[] => {
        const days: DayCell[] = [];
        for (let i = 0; i < 7; i++) {
            const date = new Date(startDate);
            date.setDate(startDate.getDate() + i);
            days.push({
                date,
                isCurrentMonth: true,
                activities: getActivitiesForDate(date),
            });
        }
        return days;
    };

    const goToPreviousMonth = () => {
        setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1));
    };

    const goToNextMonth = () => {
        setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1));
    };

    const goToToday = () => {
        setCurrentDate(new Date());
    };

    const goToPreviousWeek = () => {
        const newDate = new Date(currentWeekStart);
        newDate.setDate(currentWeekStart.getDate() - 7);
        setCurrentWeekStart(newDate);
    };

    const goToNextWeek = () => {
        const newDate = new Date(currentWeekStart);
        newDate.setDate(currentWeekStart.getDate() + 7);
        setCurrentWeekStart(newDate);
    };

    const goToCurrentWeek = () => {
        const now = new Date();
        const day = now.getDay();
        const diff = now.getDate() - day;
        setCurrentWeekStart(new Date(now.setDate(diff)));
    };

    const formatMonthYear = (date: Date) => {
        return date.toLocaleDateString("en-US", { month: "long", year: "numeric" });
    };

    const formatWeekRange = (startDate: Date) => {
        const endDate = new Date(startDate);
        endDate.setDate(startDate.getDate() + 6);
        
        const startMonth = startDate.toLocaleDateString("en-US", { month: "short" });
        const endMonth = endDate.toLocaleDateString("en-US", { month: "short" });
        
        if (startMonth === endMonth) {
            return `${startMonth} ${startDate.getDate()} - ${endDate.getDate()}, ${startDate.getFullYear()}`;
        } else {
            return `${startMonth} ${startDate.getDate()} - ${endMonth} ${endDate.getDate()}, ${endDate.getFullYear()}`;
        }
    };

    const monthDays = getDaysInMonth(currentDate);
    const weekDays = getDaysInWeek(currentWeekStart);
    const dayNames = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

    return (
        <div className="min-h-screen bg-slate-50">
            <Navbar currentPage="calendar" />

            <main className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
                <div className="mb-8">
                    <h2 className="text-3xl font-extrabold tracking-tight text-slate-900 sm:text-4xl">
                        Activity Calendar
                    </h2>
                </div>

                {/* Desktop View */}
                <div className="hidden sm:block bg-white rounded-2xl shadow-sm ring-1 ring-slate-200 overflow-hidden">
                    {/* Calendar Header */}
                    <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 bg-slate-50">
                        <button
                            onClick={goToPreviousMonth}
                            className="inline-flex items-center rounded-lg px-3 py-2 text-sm font-medium text-slate-700 hover:bg-white hover:text-indigo-600 transition-all shadow-sm ring-1 ring-slate-200"
                        >
                            <svg
                                className="h-4 w-4 mr-1"
                                fill="none"
                                viewBox="0 0 24 24"
                                stroke="currentColor"
                            >
                                <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M15 19l-7-7 7-7"
                                />
                            </svg>
                            Previous
                        </button>

                        <div className="flex items-center gap-3">
                            <h3 className="text-xl font-bold text-slate-900">
                                {formatMonthYear(currentDate)}
                            </h3>
                            <button
                                onClick={goToToday}
                                className="text-sm font-medium text-indigo-600 hover:text-indigo-700 px-3 py-1 rounded-lg hover:bg-indigo-50 transition-all"
                            >
                                Today
                            </button>
                        </div>

                        <button
                            onClick={goToNextMonth}
                            className="inline-flex items-center rounded-lg px-3 py-2 text-sm font-medium text-slate-700 hover:bg-white hover:text-indigo-600 transition-all shadow-sm ring-1 ring-slate-200"
                        >
                            Next
                            <svg
                                className="h-4 w-4 ml-1"
                                fill="none"
                                viewBox="0 0 24 24"
                                stroke="currentColor"
                            >
                                <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M9 5l7 7-7 7"
                                />
                            </svg>
                        </button>
                    </div>

                    {/* Day Names Header */}
                    <div className="grid grid-cols-7 border-b border-slate-200 bg-slate-50">
                        {dayNames.map((day) => (
                            <div
                                key={day}
                                className="px-2 py-3 text-center text-sm font-semibold text-slate-700"
                            >
                                {day}
                            </div>
                        ))}
                    </div>

                    {/* Calendar Grid */}
                    {loading ? (
                        <div className="flex items-center justify-center py-20">
                            <div className="text-slate-500">Loading calendar...</div>
                        </div>
                    ) : (
                        <div className="grid grid-cols-7">
                            {monthDays.map((day, index) => {
                                const isToday =
                                    day.date.toDateString() === new Date().toDateString();
                                return (
                                    <div
                                        key={index}
                                        className={`min-h-[120px] border-b border-r border-slate-200 p-2 ${!day.isCurrentMonth ? "bg-slate-50" : "bg-white"
                                            } ${isToday ? "ring-2 ring-inset ring-indigo-500" : ""}`}
                                    >
                                        <div
                                            className={`text-sm font-medium mb-2 ${isToday
                                                    ? "inline-flex h-6 w-6 items-center justify-center rounded-full bg-indigo-600 text-white"
                                                    : day.isCurrentMonth
                                                        ? "text-slate-900"
                                                        : "text-slate-400"
                                                }`}
                                        >
                                            {day.date.getDate()}
                                        </div>
                                        <div className="space-y-1">
                                            {day.activities.slice(0, 3).map((activity) => (
                                                <Link
                                                    key={activity.id}
                                                    href={`/activity/${activity.id}`}
                                                    className="block truncate rounded px-2 py-1 text-xs font-medium bg-indigo-50 text-indigo-700 hover:bg-indigo-100 transition-colors"
                                                    title={activity.activityName}
                                                >
                                                    {activity.activityName}
                                                </Link>
                                            ))}
                                            {day.activities.length > 3 && (
                                                <div className="text-xs text-slate-500 px-2">
                                                    +{day.activities.length - 3} more
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </div>

                {/* Mobile View */}
                <div className="block sm:hidden bg-white rounded-2xl shadow-sm ring-1 ring-slate-200 overflow-hidden">
                    {/* Mobile Header */}
                    <div className="flex items-center justify-between px-4 py-4 border-b border-slate-200 bg-slate-50">
                        <button
                            onClick={goToPreviousWeek}
                            className="inline-flex items-center rounded-lg px-2 py-1.5 text-xs font-medium text-slate-700 hover:bg-white hover:text-indigo-600 transition-all shadow-sm ring-1 ring-slate-200"
                        >
                            <svg
                                className="h-3 w-3 mr-1"
                                fill="none"
                                viewBox="0 0 24 24"
                                stroke="currentColor"
                            >
                                <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M15 19l-7-7 7-7"
                                />
                            </svg>
                            Prev
                        </button>

                        <div className="flex flex-col items-center">
                            <h3 className="text-sm font-bold text-slate-900">
                                {formatWeekRange(currentWeekStart)}
                            </h3>
                            <button
                                onClick={goToCurrentWeek}
                                className="text-xs font-medium text-indigo-600 hover:text-indigo-700 mt-0.5"
                            >
                                Today
                            </button>
                        </div>

                        <button
                            onClick={goToNextWeek}
                            className="inline-flex items-center rounded-lg px-2 py-1.5 text-xs font-medium text-slate-700 hover:bg-white hover:text-indigo-600 transition-all shadow-sm ring-1 ring-slate-200"
                        >
                            Next
                            <svg
                                className="h-3 w-3 ml-1"
                                fill="none"
                                viewBox="0 0 24 24"
                                stroke="currentColor"
                            >
                                <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M9 5l7 7-7 7"
                                />
                            </svg>
                        </button>
                    </div>

                    {/* Mobile List */}
                    {loading ? (
                        <div className="flex items-center justify-center py-12">
                            <div className="text-slate-500 text-sm">Loading...</div>
                        </div>
                    ) : (
                        <div className="divide-y divide-slate-200">
                            {weekDays.map((day, index) => {
                                const isToday = day.date.toDateString() === new Date().toDateString();
                                return (
                                    <div 
                                        key={index} 
                                        className={`p-4 flex gap-3 ${isToday ? "bg-indigo-50/30" : ""}`}
                                    >
                                        <div className="shrink-0">
                                            <div className={`flex flex-col items-center justify-center w-10 h-10 rounded-lg border ${
                                                isToday 
                                                    ? "bg-indigo-600 border-indigo-600 text-white" 
                                                    : "bg-white border-slate-200 text-slate-700"
                                            }`}>
                                                <span className="text-[10px] font-medium uppercase leading-none mb-0.5">
                                                    {dayNames[day.date.getDay()]}
                                                </span>
                                                <span className="text-sm font-bold leading-none">
                                                    {day.date.getDate()}
                                                </span>
                                            </div>
                                        </div>
                                        
                                        <div className="grow space-y-2 min-w-0">
                                            {day.activities.length > 0 ? (
                                                day.activities.map((activity) => (
                                                    <Link
                                                        key={activity.id}
                                                        href={`/activity/${activity.id}`}
                                                        className="block p-3 rounded-lg bg-white border-2 border-indigo-200 shadow-md hover:shadow-lg hover:border-indigo-400 transition-all active:scale-[0.99]"
                                                    >
                                                        <div className="flex items-start justify-between gap-2">
                                                            <div className="font-medium text-slate-900 text-sm truncate">
                                                                {activity.activityName}
                                                            </div>
                                                        </div>
                                                        {activity.description && (
                                                            <div className="text-xs text-slate-500 mt-1 line-clamp-2">
                                                                {activity.affiliate}
                                                            </div>
                                                        )}
                                                    </Link>
                                                ))
                                            ) : (
                                                <div className="text-sm text-slate-400 italic py-2">
                                                    No activities
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </div>
            </main>
        </div>
    );
}
