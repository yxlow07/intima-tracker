"use client";

import { useState } from "react";

type BookingOption = {
  id: string;
  title: string;
  iconColor: string;
  bgColor: string;
};

type BookingConfirmationProps = {
  option: BookingOption;
  selectedDate: string;
  selectedSlot: { start: string; end: string };
  selectedSubType: string;
  resourceIds: string[];
  category: string;
  onBack: () => void;
  onComplete: (data: { resourceId: string; date: string; startTime: string; endTime: string }) => void;
};

export default function BookingConfirmation({
  option,
  selectedDate,
  selectedSlot,
  selectedSubType,
  resourceIds,
  category,
  onBack,
  onComplete,
}: BookingConfirmationProps) {
  const [userName, setUserName] = useState("");
  const [userEmail, setUserEmail] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!userName.trim() || !userEmail.trim()) {
      setError("Please fill in all fields");
      return;
    }

    // Basic email validation
    if (!userEmail.includes("@")) {
      setError("Please enter a valid email address");
      return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      const res = await fetch("/api/booking", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userName: userName.trim(),
          userEmail: userEmail.trim(),
          category,
          subType: selectedSubType,
          date: selectedDate,
          startTime: selectedSlot.start,
          endTime: selectedSlot.end,
          resourceIds, // Send all possible resource IDs, server will pick available one
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Failed to create booking");
      }

      onComplete({
        resourceId: data.resourceId,
        date: selectedDate,
        startTime: selectedSlot.start,
        endTime: selectedSlot.end,
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to create booking");
    } finally {
      setIsSubmitting(false);
    }
  };

  const formattedDate = new Date(selectedDate).toLocaleDateString("en-US", {
    weekday: "long",
    month: "long",
    day: "numeric",
  });

  return (
    <div>
      <button
        onClick={onBack}
        className="mb-4 flex items-center gap-1 text-sm text-slate-500 hover:text-slate-700 transition-colors"
      >
        <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" />
        </svg>
        Back to slots
      </button>

      {/* Booking Summary */}
      <div className={`rounded-lg ${option.bgColor} p-4 mb-6`}>
        <h3 className="font-medium text-slate-900 mb-2">Booking Summary</h3>
        <div className="space-y-1 text-sm text-slate-700">
          <p><span className="text-slate-500">Facility:</span> {option.title}</p>
          {selectedSubType !== "DEFAULT" && (
            <p><span className="text-slate-500">Type:</span> {selectedSubType}</p>
          )}
          <p><span className="text-slate-500">Date:</span> {formattedDate}</p>
          <p><span className="text-slate-500">Time:</span> {selectedSlot.start} - {selectedSlot.end}</p>
        </div>
      </div>

      {/* User Details Form */}
      <form onSubmit={handleSubmit}>
        {error && (
          <div className="mb-4 rounded-lg bg-red-50 p-3 text-sm text-red-600">
            {error}
          </div>
        )}

        <div className="space-y-4">
          <div>
            <label htmlFor="userName" className="block text-sm font-medium text-slate-700 mb-1">
              Your Name
            </label>
            <input
              type="text"
              id="userName"
              value={userName}
              onChange={(e) => setUserName(e.target.value)}
              placeholder="Enter your name"
              className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 focus:outline-none"
              required
            />
          </div>

          <div>
            <label htmlFor="userEmail" className="block text-sm font-medium text-slate-700 mb-1">
              Student/Staff Email
            </label>
            <input
              type="email"
              id="userEmail"
              value={userEmail}
              onChange={(e) => setUserEmail(e.target.value)}
              placeholder="p10000000@student.newinti.edu.my"
              className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 focus:outline-none"
              required
            />
          </div>
        </div>

        <button
          type="submit"
          disabled={isSubmitting}
          className={`mt-6 w-full rounded-lg ${option.bgColor} ${option.iconColor} px-4 py-3 font-medium transition-opacity hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2`}
        >
          {isSubmitting ? (
            <>
              <div className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
              Confirming...
            </>
          ) : (
            "Confirm Booking"
          )}
        </button>
      </form>
    </div>
  );
}
