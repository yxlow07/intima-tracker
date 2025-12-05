"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

const MAX_ATTEMPTS = 5;
const COOLDOWN_MS = 15 * 60 * 1000; // 15 minutes
const STORAGE_KEY = "tracking_attempts";

type AttemptData = {
  count: number;
  lastAttempt: number;
  cooldownUntil: number | null;
};

function getAttemptData(): AttemptData {
  if (typeof window === "undefined") {
    return { count: 0, lastAttempt: 0, cooldownUntil: null };
  }
  
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      return JSON.parse(stored);
    }
  } catch {
    // Ignore parse errors
  }
  return { count: 0, lastAttempt: 0, cooldownUntil: null };
}

function saveAttemptData(data: AttemptData) {
  if (typeof window !== "undefined") {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  }
}

export default function TrackingInput() {
  const router = useRouter();
  const [trackingId, setTrackingId] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [attemptsLeft, setAttemptsLeft] = useState(MAX_ATTEMPTS);
  const [cooldownRemaining, setCooldownRemaining] = useState(0);

  // Initialize and handle cooldown timer
  useEffect(() => {
    const checkCooldown = () => {
      const data = getAttemptData();
      const now = Date.now();
      
      if (data.cooldownUntil && data.cooldownUntil > now) {
        setCooldownRemaining(Math.ceil((data.cooldownUntil - now) / 1000));
        setAttemptsLeft(0);
      } else if (data.cooldownUntil && data.cooldownUntil <= now) {
        // Cooldown expired, reset
        saveAttemptData({ count: 0, lastAttempt: 0, cooldownUntil: null });
        setAttemptsLeft(MAX_ATTEMPTS);
        setCooldownRemaining(0);
      } else {
        setAttemptsLeft(MAX_ATTEMPTS - data.count);
      }
    };

    checkCooldown();
    const interval = setInterval(checkCooldown, 1000);
    return () => clearInterval(interval);
  }, []);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!trackingId.trim()) {
      setError("Please enter a tracking ID");
      return;
    }

    // Check cooldown
    const data = getAttemptData();
    const now = Date.now();
    
    if (data.cooldownUntil && data.cooldownUntil > now) {
      setError("Too many attempts. Please wait for the cooldown to expire.");
      return;
    }

    setIsLoading(true);
    setError("");

    try {
      const response = await fetch(`/api/validate-tracking?token=${encodeURIComponent(trackingId.trim())}`);
      const result = await response.json();

      if (result.valid) {
        // Reset attempts on success
        saveAttemptData({ count: 0, lastAttempt: 0, cooldownUntil: null });
        router.push(`/track/${trackingId.trim()}`);
      } else {
        // Increment failed attempts
        const newCount = data.count + 1;
        
        if (newCount >= MAX_ATTEMPTS) {
          // Start cooldown
          const cooldownUntil = now + COOLDOWN_MS;
          saveAttemptData({ count: newCount, lastAttempt: now, cooldownUntil });
          setCooldownRemaining(Math.ceil(COOLDOWN_MS / 1000));
          setAttemptsLeft(0);
          setError("Too many failed attempts. Please wait 15 minutes before trying again.");
        } else {
          saveAttemptData({ count: newCount, lastAttempt: now, cooldownUntil: null });
          setAttemptsLeft(MAX_ATTEMPTS - newCount);
          setError(`Invalid tracking ID. ${MAX_ATTEMPTS - newCount} attempts remaining.`);
        }
      }
    } catch {
      setError("An error occurred. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const isDisabled = cooldownRemaining > 0 || isLoading;

  return (
    <div className="w-full">
      <form onSubmit={handleSubmit} className="relative">
        <div className="relative flex items-center">
          <input
            type="text"
            value={trackingId}
            onChange={(e) => {
              setTrackingId(e.target.value);
              setError("");
            }}
            placeholder="Enter your tracking ID..."
            disabled={isDisabled}
            className={`w-full rounded-full border border-slate-300 py-3 pl-6 pr-48 text-lg shadow-lg transition-all placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent ${
              error
                ? "border-rose-300 bg-rose-50 focus:ring-rose-500"
                : "bg-white"
            } ${isDisabled ? "cursor-not-allowed opacity-60" : ""}`}
          />
          <div className="absolute right-0 top-0 bottom-0">
            <button
              type="submit"
              disabled={isDisabled}
              className={`h-full rounded-full bg-indigo-600 px-12 text-lg font-semibold text-white shadow-sm transition-all hover:bg-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 ${
                isDisabled ? "cursor-not-allowed opacity-60" : ""
              }`}
            >
              {isLoading ? (
                <svg className="h-5 w-5 animate-spin" viewBox="0 0 24 24">
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                    fill="none"
                  />
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                  />
                </svg>
              ) : (
                "Track"
              )}
            </button>
          </div>
        </div>
      </form>

      {/* Error/Status Messages */}
      {error && (
        <div className="mt-4 flex items-center justify-center gap-2 text-sm font-medium text-rose-600 animate-in fade-in slide-in-from-top-1">
          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
          {error}
        </div>
      )}

      {/* Cooldown Timer */}
      {cooldownRemaining > 0 && (
        <div className="mt-4 flex items-center justify-center gap-2 text-sm font-medium text-amber-600 animate-in fade-in slide-in-from-top-1">
          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
          Cooldown: {formatTime(cooldownRemaining)}
        </div>
      )}

      {/* Attempts remaining indicator */}
      {attemptsLeft > 0 && attemptsLeft < MAX_ATTEMPTS && !error && (
        <div className="mt-4 text-center text-xs font-medium text-slate-500">
          {attemptsLeft} attempts remaining
        </div>
      )}
    </div>
  );
}
