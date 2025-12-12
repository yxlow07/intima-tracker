"use client";

import { useState, useEffect } from "react";
import AvailabilityGrid from "./AvailabilityGrid";
import BookingConfirmation from "./BookingConfirmation";

type BookingCategory = "discussion" | "music" | "pool" | "pingpong";

type BookingOption = {
  id: BookingCategory;
  title: string;
  desc: string;
  hours: string;
  iconColor: string;
  bgColor: string;
  hoverBorder: string;
  icon: React.ReactNode;
  subTypes?: { id: string; label: string }[];
};

type BookingModalProps = {
  option: BookingOption;
  onClose: () => void;
};

type BookingStep = "select" | "confirm" | "success";

const RESOURCE_CONFIG: Record<BookingCategory, {
  category: string;
  operatingHours: { start: number; end: number };
  resources: Record<string, string[]>;
}> = {
  discussion: {
    category: "DISCUSSION_ROOM",
    operatingHours: { start: 8, end: 18 },
    resources: {
      ROOM_1: ["disc_room_1"],
      ROOM_2: ["disc_room_2"],
      ROOM_3: ["disc_room_3"],
      ROOM_4: ["disc_room_4"],
      ROOM_5: ["disc_room_5"],
    },
  },
  music: {
    category: "MUSIC_ROOM",
    operatingHours: { start: 8, end: 17 },
    resources: {
      DEFAULT: ["music_room_1"],
    },
  },
  pool: {
    category: "POOL_TABLE",
    operatingHours: { start: 8, end: 17 },
    resources: {
      LARGE: ["pool_large_1"],
      SMALL: ["pool_small_1"],
    },
  },
  pingpong: {
    category: "PING_PONG",
    operatingHours: { start: 8, end: 17 },
    resources: {
      DEFAULT: ["pingpong_1", "pingpong_2"],
    },
  },
};

// Helper function to convert resource ID to user-friendly name
function formatResourceName(resourceId: string): string {
  const resourceMap: Record<string, string> = {
    // Discussion Rooms
    disc_room_1: "Discussion Room 1",
    disc_room_2: "Discussion Room 2",
    disc_room_3: "Discussion Room 3",
    disc_room_4: "Discussion Room 4",
    disc_room_5: "Discussion Room 5",
    // Music Room
    music_room_1: "Music Room",
    // Pool Tables
    pool_large_1: "Large Pool Table",
    pool_small_1: "Small Pool Table",
    // Ping Pong
    pingpong_1: "Ping Pong Table 1",
    pingpong_2: "Ping Pong Table 2",
  };

  return resourceMap[resourceId] || resourceId;
}

export default function BookingModal({ option, onClose }: BookingModalProps) {
  const [step, setStep] = useState<BookingStep>("select");
  const [selectedDate, setSelectedDate] = useState<string>(() => {
    const today = new Date();
    return today.toISOString().split("T")[0];
  });
  const [selectedSubType, setSelectedSubType] = useState<string>(
    option.subTypes?.[0]?.id || "DEFAULT"
  );
  const [selectedSlot, setSelectedSlot] = useState<{ start: string; end: string } | null>(null);
  const [bookedSlots, setBookedSlots] = useState<string[]>([]);
  const [isLoadingSlots, setIsLoadingSlots] = useState(false);
  const [bookingData, setBookingData] = useState<{
    resourceId: string;
    date: string;
    startTime: string;
    endTime: string;
  } | null>(null);
  const [refreshKey, setRefreshKey] = useState(0); // Used to force re-fetch

  const config = RESOURCE_CONFIG[option.id];
  const resourceIds = config.resources[selectedSubType] || config.resources.DEFAULT;

  // Helper function to check if date is a weekday
  const isWeekday = (date: Date) => {
    const day = date.getDay();
    return day !== 0 && day !== 6; // 0 = Sunday, 6 = Saturday
  };

  // Generate date options (next 14 days, weekdays only)
  const dateOptions: { value: string; label: string }[] = [];
  const date = new Date();
  while (dateOptions.length < 5) {
    if (isWeekday(date)) {
      const dateStr = date.toISOString().split("T")[0];
      const daysFromNow = Math.floor((date.getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24));
      const label = daysFromNow === 0 ? "Today" : daysFromNow === 1 ? "Tomorrow" : date.toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric" });
      dateOptions.push({ value: dateStr, label });
    }
    date.setDate(date.getDate() + 1);
  }

  // Ensure selected date is a weekday on initial load
  useEffect(() => {
    const selectedDateObj = new Date(selectedDate);
    if (!isWeekday(selectedDateObj) && dateOptions.length > 0) {
      setSelectedDate(dateOptions[0].value);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Fetch booked slots when date or subtype changes
  useEffect(() => {
    const fetchBookedSlots = async () => {
      setIsLoadingSlots(true);
      try {
        const params = new URLSearchParams({
          date: selectedDate,
          category: config.category,
          subType: selectedSubType,
        });
        const res = await fetch(`/api/booking/availability?${params}`, {
          cache: "no-store",
        });
        const data = await res.json();
        setBookedSlots(data.bookedSlots || []);
      } catch (err) {
        console.error("Failed to fetch availability:", err);
        setBookedSlots([]);
      } finally {
        setIsLoadingSlots(false);
      }
    };

    fetchBookedSlots();
  }, [selectedDate, selectedSubType, config.category, refreshKey]);

  const handleSlotSelect = (start: string, end: string) => {
    setSelectedSlot({ start, end });
    setStep("confirm");
  };

  const handleBookingComplete = (data: { resourceId: string; date: string; startTime: string; endTime: string }) => {
    setBookingData(data);
    setStep("success");
    // Increment refreshKey to force re-fetch when going back to select
    setRefreshKey((prev) => prev + 1);
  };

  const handleBackToSelect = () => {
    setSelectedSlot(null);
    setStep("select");
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="w-full max-w-lg rounded-2xl bg-white shadow-xl max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className={`p-6 ${option.bgColor}`}>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className={`flex h-10 w-10 items-center justify-center rounded-lg bg-white/80 ${option.iconColor}`}>
                {option.icon}
              </div>
              <div>
                <h2 className="text-lg font-semibold text-slate-900">{option.title}</h2>
                <p className="text-sm text-slate-600">{option.hours}</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="rounded-full p-2 text-slate-500 hover:bg-white/50 transition-colors"
            >
              <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">
          {step === "select" && (
            <div className="space-y-6">
              {/* Date Selection - Hidden for Pool Table */}
              {option.id !== "pool" && (
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Select Date
                  </label>
                  <div className="flex flex-wrap gap-2">
                    {dateOptions.map((date) => (
                      <button
                        key={date.value}
                        onClick={() => setSelectedDate(date.value)}
                        className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                          selectedDate === date.value
                            ? `${option.bgColor} ${option.iconColor}`
                            : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                        }`}
                      >
                        {date.label}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Sub-type Selection */}
              {option.subTypes && option.subTypes.length > 0 && (
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Select Type
                  </label>
                  <div className="flex flex-wrap gap-2">
                    {option.subTypes.map((subType) => (
                      <button
                        key={subType.id}
                        onClick={() => setSelectedSubType(subType.id)}
                        className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                          selectedSubType === subType.id
                            ? `${option.bgColor} ${option.iconColor}`
                            : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                        }`}
                      >
                        {subType.label}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Availability Grid */}
              <AvailabilityGrid
                operatingHours={config.operatingHours}
                bookedSlots={bookedSlots}
                isLoading={isLoadingSlots}
                onSlotSelect={handleSlotSelect}
                selectedDate={selectedDate}
                restrictToCurrentAndNextHour={option.id === "pool"}
              />
            </div>
          )}

          {step === "confirm" && selectedSlot && (
            <BookingConfirmation
              option={option}
              selectedDate={selectedDate}
              selectedSlot={selectedSlot}
              selectedSubType={selectedSubType}
              resourceIds={resourceIds}
              category={config.category}
              onBack={handleBackToSelect}
              onComplete={handleBookingComplete}
            />
          )}

          {step === "success" && bookingData && (
            <div className="text-center py-8">
              <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-emerald-100">
                <svg className="h-8 w-8 text-emerald-600" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-slate-900">Booking Confirmed!</h3>
              <p className="mt-2 text-slate-600">
                Your {option.title.toLowerCase()} has been reserved.
              </p>
              <div className="mt-6 rounded-lg bg-slate-50 p-4 text-left">
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-slate-500">Date:</span>
                    <span className="font-medium text-slate-900">
                      {new Date(bookingData.date).toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric" })}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Time:</span>
                    <span className="font-medium text-slate-900">{bookingData.startTime} - {bookingData.endTime}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Resource:</span>
                    <span className="font-medium text-slate-900">{formatResourceName(bookingData.resourceId)}</span>
                  </div>
                </div>
              </div>
              <button
                onClick={onClose}
                className={`mt-6 w-full rounded-lg ${option.bgColor} ${option.iconColor} px-4 py-3 font-medium transition-opacity hover:opacity-90`}
              >
                Done
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
