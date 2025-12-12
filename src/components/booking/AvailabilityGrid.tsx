"use client";

type AvailabilityGridProps = {
  operatingHours: { start: number; end: number };
  bookedSlots: string[]; // Array of start times like ["09:00", "10:00"]
  isLoading: boolean;
  onSlotSelect: (start: string, end: string) => void;
  selectedDate: string;
  restrictToCurrentAndNextHour?: boolean;
};

export default function AvailabilityGrid({
  operatingHours,
  bookedSlots,
  isLoading,
  onSlotSelect,
  selectedDate,
  restrictToCurrentAndNextHour = false,
}: AvailabilityGridProps) {
  // Generate time slots based on operating hours
  const timeSlots = [];
  for (let hour = operatingHours.start; hour < operatingHours.end; hour++) {
    const start = `${hour.toString().padStart(2, "0")}:00`;
    const end = `${(hour + 1).toString().padStart(2, "0")}:00`;
    timeSlots.push({ start, end });
  }

  // Check if a slot is in the past
  const isSlotPast = (slotStart: string) => {
    const today = new Date().toISOString().split("T")[0];
    if (selectedDate > today) return false;
    if (selectedDate < today) return true;
    
    const now = new Date();
    const [hours] = slotStart.split(":").map(Number);
    return hours < now.getHours();
  };

  // Check if slot is outside allowed hours for pool table (only current and next hour allowed)
  const isOutsidePoolHours = (slotStart: string) => {
    if (!restrictToCurrentAndNextHour) return false;
    
    const today = new Date().toISOString().split("T")[0];
    if (selectedDate !== today) return false; // Only apply to today
    
    const now = new Date();
    const currentHour = now.getHours();
    const [hours] = slotStart.split(":").map(Number);
    
    // Allow only current hour and next hour
    return hours !== currentHour && hours !== currentHour + 1;
  };

  if (isLoading) {
    return (
      <div>
        <label className="block text-sm font-medium text-slate-700 mb-2">
          Available Time Slots
        </label>
        <div className="grid grid-cols-3 gap-2">
          {Array.from({ length: 9 }).map((_, i) => (
            <div
              key={i}
              className="h-12 rounded-lg bg-slate-100 animate-pulse"
            />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div>
      <label className="block text-sm font-medium text-slate-700 mb-2">
        Available Time Slots
      </label>
      <div className="grid grid-cols-3 gap-2">
        {timeSlots.map((slot) => {
          const isBooked = bookedSlots.includes(slot.start);
          const isPast = isSlotPast(slot.start);
          const isOutsidePool = isOutsidePoolHours(slot.start);
          const isDisabled = isBooked || isPast || isOutsidePool;

          return (
            <button
              key={slot.start}
              onClick={() => !isDisabled && onSlotSelect(slot.start, slot.end)}
              disabled={isDisabled}
              className={`relative rounded-lg px-3 py-3 text-sm font-medium transition-all ${
                isBooked
                  ? "bg-red-100 text-red-400 cursor-not-allowed"
                  : isDisabled
                  ? "bg-slate-100 text-slate-400 cursor-not-allowed"
                  : `bg-emerald-50 text-emerald-700 hover:bg-emerald-100 hover:ring-2 hover:ring-emerald-300`
              }`}
            >
              <span>{slot.start}</span>
              {isBooked && (
                <span className="block text-[10px] text-red-500 mt-0.5">Booked</span>
              )}
              {isPast && !isBooked && (
                <span className="block text-[10px] text-slate-400 mt-0.5">Past</span>
              )}
              {isOutsidePool && !isPast && !isBooked && (
                <span className="block text-[10px] text-slate-400 mt-0.5">Not Available</span>
              )}
            </button>
          );
        })}
      </div>
      
      {/* Legend */}
      <div className="mt-4 flex items-center gap-4 text-xs text-slate-500">
        <div className="flex items-center gap-1.5">
          <div className="h-3 w-3 rounded bg-emerald-100 border border-emerald-300" />
          <span>Available</span>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="h-3 w-3 rounded bg-red-100 border border-red-200" />
          <span>Booked</span>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="h-3 w-3 rounded bg-slate-100 border border-slate-200" />
          <span>Unavailable</span>
        </div>
      </div>
    </div>
  );
}
