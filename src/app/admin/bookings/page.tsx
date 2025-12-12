"use client";

import { useState, useEffect, useCallback } from "react";
import type { Booking } from "@/lib/booking";

type FilterState = {
  date: string;
  category: string;
  status: string;
  search: string;
};

const CATEGORY_LABELS: Record<string, string> = {
  DISCUSSION_ROOM: "Discussion Room",
  MUSIC_ROOM: "Music Room",
  POOL_TABLE: "Pool Table",
  PING_PONG: "Ping Pong",
};

const SUBTYPE_LABELS: Record<string, Record<string, string>> = {
  DISCUSSION_ROOM: {
    ROOM_1: "Room 1",
    ROOM_2: "Room 2",
    ROOM_3: "Room 3",
    ROOM_4: "Room 4",
    ROOM_5: "Room 5",
  },
  POOL_TABLE: {
    LARGE: "Large Table",
    SMALL: "Small Table",
  },
  PING_PONG: {
    DEFAULT: "Table",
  },
  MUSIC_ROOM: {
    DEFAULT: "Music Room",
  },
};

function formatDate(dateString: string): string {
  const date = new Date(dateString);
  return date.toLocaleDateString("en-US", {
    weekday: "short",
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

function formatTime(time: string): string {
  const [hours] = time.split(":");
  const hour = parseInt(hours);
  const ampm = hour >= 12 ? "PM" : "AM";
  const hour12 = hour % 12 || 12;
  return `${hour12}:00 ${ampm}`;
}

export default function AdminBookingsPage() {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [cancelling, setCancelling] = useState<string | null>(null);
  const [filters, setFilters] = useState<FilterState>({
    date: "",
    category: "",
    status: "CONFIRMED",
    search: "",
  });

  const fetchBookings = useCallback(async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (filters.date) params.set("date", filters.date);
      if (filters.category) params.set("category", filters.category);
      if (filters.status) params.set("status", filters.status);
      if (filters.search) params.set("userEmail", filters.search);

      const response = await fetch(`/api/admin/bookings?${params.toString()}`);
      if (response.ok) {
        const data = await response.json();
        setBookings(data);
      }
    } catch (error) {
      console.error("Failed to fetch bookings:", error);
    } finally {
      setLoading(false);
    }
  }, [filters]);

  useEffect(() => {
    fetchBookings();
  }, [fetchBookings]);

  const handleCancelBooking = async (bookingId: string) => {
    if (!confirm("Are you sure you want to cancel this booking?")) return;

    try {
      setCancelling(bookingId);
      const response = await fetch(`/api/admin/bookings?id=${bookingId}`, {
        method: "DELETE",
      });

      if (response.ok) {
        fetchBookings();
      } else {
        alert("Failed to cancel booking");
      }
    } catch (error) {
      console.error("Failed to cancel booking:", error);
      alert("Failed to cancel booking");
    } finally {
      setCancelling(null);
    }
  };

  const clearFilters = () => {
    setFilters({
      date: "",
      category: "",
      status: "CONFIRMED",
      search: "",
    });
  };

  const getSubTypeLabel = (category: string, subType: string): string => {
    return SUBTYPE_LABELS[category]?.[subType] || subType;
  };

  // Group bookings by date
  const groupedBookings = bookings.reduce(
    (acc, booking) => {
      const date = booking.date;
      if (!acc[date]) {
        acc[date] = [];
      }
      acc[date].push(booking);
      return acc;
    },
    {} as Record<string, Booking[]>
  );

  // Sort dates (most recent first)
  const sortedDates = Object.keys(groupedBookings).sort(
    (a, b) => new Date(b).getTime() - new Date(a).getTime()
  );

  return (
    <>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h2 className="text-2xl font-bold text-slate-900">Bookings</h2>
            <p className="mt-1 text-sm text-slate-600">
              Manage facility bookings and reservations
            </p>
          </div>
          <div className="flex items-center gap-2 text-sm text-slate-600">
            <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-100 px-3 py-1 text-emerald-700">
              <span className="h-2 w-2 rounded-full bg-emerald-500"></span>
              {bookings.filter((b) => b.status === "CONFIRMED").length} Active
            </span>
          </div>
        </div>

        {/* Stats Summary */}
        {!loading && bookings.length > 0 && (
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div className="bg-white rounded-xl border border-slate-200 p-4">
              <p className="text-sm text-slate-600">Total Bookings</p>
              <p className="text-2xl font-bold text-slate-900">{bookings.length}</p>
            </div>
            <div className="bg-white rounded-xl border border-slate-200 p-4">
              <p className="text-sm text-slate-600">Discussion Rooms</p>
              <p className="text-2xl font-bold text-indigo-600">
                {bookings.filter((b) => b.category === "DISCUSSION_ROOM" && b.status === "CONFIRMED").length}
              </p>
            </div>
            <div className="bg-white rounded-xl border border-slate-200 p-4">
              <p className="text-sm text-slate-600">Pool Tables</p>
              <p className="text-2xl font-bold text-amber-600">
                {bookings.filter((b) => b.category === "POOL_TABLE" && b.status === "CONFIRMED").length}
              </p>
            </div>
            <div className="bg-white rounded-xl border border-slate-200 p-4">
              <p className="text-sm text-slate-600">Ping Pong</p>
              <p className="text-2xl font-bold text-teal-600">
                {bookings.filter((b) => b.category === "PING_PONG" && b.status === "CONFIRMED").length}
              </p>
            </div>
          </div>
        )}

        {/* Filters */}
        <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-sm">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
            {/* Date Filter */}
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                Date
              </label>
              <input
                type="date"
                value={filters.date}
                onChange={(e) =>
                  setFilters((prev) => ({ ...prev, date: e.target.value }))
                }
                className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
              />
            </div>

            {/* Category Filter */}
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                Category
              </label>
              <select
                value={filters.category}
                onChange={(e) =>
                  setFilters((prev) => ({ ...prev, category: e.target.value }))
                }
                className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
              >
                <option value="">All Categories</option>
                <option value="DISCUSSION_ROOM">Discussion Rooms</option>
                <option value="MUSIC_ROOM">Music Room</option>
                <option value="POOL_TABLE">Pool Table</option>
                <option value="PING_PONG">Ping Pong</option>
              </select>
            </div>

            {/* Status Filter */}
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                Status
              </label>
              <select
                value={filters.status}
                onChange={(e) =>
                  setFilters((prev) => ({ ...prev, status: e.target.value }))
                }
                className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
              >
                <option value="">All Statuses</option>
                <option value="CONFIRMED">Confirmed</option>
                <option value="CANCELLED">Cancelled</option>
              </select>
            </div>

            {/* Search */}
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                Search Email
              </label>
              <input
                type="text"
                value={filters.search}
                onChange={(e) =>
                  setFilters((prev) => ({ ...prev, search: e.target.value }))
                }
                placeholder="Search by email..."
                className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
              />
            </div>

            {/* Clear Button */}
            <div className="flex items-end">
              <button
                onClick={clearFilters}
                className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50 transition-colors"
              >
                Clear Filters
              </button>
            </div>
          </div>
        </div>

        {/* Bookings List */}
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <div className="h-8 w-8 animate-spin rounded-full border-4 border-indigo-600 border-t-transparent"></div>
          </div>
        ) : bookings.length === 0 ? (
          <div className="text-center py-12 bg-white rounded-xl border border-slate-200 border-dashed">
            <svg
              className="mx-auto h-12 w-12 text-slate-400"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1.5}
                d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
              />
            </svg>
            <h3 className="mt-2 text-sm font-medium text-slate-900">
              No bookings found
            </h3>
            <p className="mt-1 text-sm text-slate-500">
              {filters.date || filters.category || filters.status || filters.search
                ? "Try adjusting your filters"
                : "No bookings have been made yet"}
            </p>
          </div>
        ) : (
          <div className="space-y-6">
            {sortedDates.map((date) => (
              <div key={date} className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
                {/* Date Header */}
                <div className="bg-slate-50 px-4 py-3 border-b border-slate-200">
                  <h3 className="font-semibold text-slate-900">
                    {formatDate(date)}
                  </h3>
                  <p className="text-sm text-slate-500">
                    {groupedBookings[date].filter((b) => b.status === "CONFIRMED").length} booking(s)
                  </p>
                </div>

                {/* Bookings Table */}
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-slate-200">
                    <thead className="bg-slate-50/50">
                      <tr>
                        <th className="px-4 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                          Time
                        </th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                          Facility
                        </th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                          User
                        </th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                          Status
                        </th>
                        <th className="px-4 py-3 text-right text-xs font-medium text-slate-500 uppercase tracking-wider">
                          Actions
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-200">
                      {groupedBookings[date]
                        .sort((a, b) => a.startTime.localeCompare(b.startTime))
                        .map((booking) => (
                          <tr
                            key={booking.id}
                            className={booking.status === "CANCELLED" ? "bg-slate-50" : ""}
                          >
                            <td className="px-4 py-3 whitespace-nowrap">
                              <div className="text-sm font-medium text-slate-900">
                                {formatTime(booking.startTime)} - {formatTime(booking.endTime)}
                              </div>
                            </td>
                            <td className="px-4 py-3 whitespace-nowrap">
                              <div className="text-sm font-medium text-slate-900">
                                {CATEGORY_LABELS[booking.category] || booking.category}
                              </div>
                              <div className="text-xs text-slate-500">
                                {getSubTypeLabel(booking.category, booking.subType)}
                              </div>
                            </td>
                            <td className="px-4 py-3">
                              <div className="text-sm font-medium text-slate-900">
                                {booking.userName}
                              </div>
                              <div className="text-xs text-slate-500">
                                {booking.userEmail}
                              </div>
                            </td>
                            <td className="px-4 py-3 whitespace-nowrap">
                              <span
                                className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${
                                  booking.status === "CONFIRMED"
                                    ? "bg-emerald-100 text-emerald-700"
                                    : "bg-rose-100 text-rose-700"
                                }`}
                              >
                                {booking.status === "CONFIRMED" ? "Confirmed" : "Cancelled"}
                              </span>
                            </td>
                            <td className="px-4 py-3 whitespace-nowrap text-right">
                              {booking.status === "CONFIRMED" && (
                                <button
                                  onClick={() => handleCancelBooking(booking.id)}
                                  disabled={cancelling === booking.id}
                                  className="text-rose-600 hover:text-rose-900 text-sm font-medium disabled:opacity-50"
                                >
                                  {cancelling === booking.id ? "Cancelling..." : "Cancel"}
                                </button>
                              )}
                            </td>
                          </tr>
                        ))}
                    </tbody>
                  </table>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </>
  );
}
