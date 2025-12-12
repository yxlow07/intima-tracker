import { getDb } from "./mongodb";
import { v4 as uuidv4 } from "uuid";

export type BookingStatus = "CONFIRMED" | "CANCELLED";

export type Booking = {
  id: string;
  userId: string;
  userName: string;
  userEmail: string;
  category: string;
  resourceId: string;
  subType: string;
  date: string;
  startTime: string;
  endTime: string;
  status: BookingStatus;
  createdAt: string;
  updatedAt: string;
};

export type NewBooking = {
  userName: string;
  userEmail: string;
  category: string;
  resourceId: string;
  subType?: string;
  date: string;
  startTime: string;
  endTime: string;
};

// Resource configuration matching the frontend
export const RESOURCE_CONFIG: Record<
  string,
  {
    resources: Record<string, string[]>;
  }
> = {
  DISCUSSION_ROOM: {
    resources: {
      ROOM_1: ["disc_room_1"],
      ROOM_2: ["disc_room_2"],
      ROOM_3: ["disc_room_3"],
      ROOM_4: ["disc_room_4"],
      ROOM_5: ["disc_room_5"],
    },
  },
  MUSIC_ROOM: {
    resources: {
      DEFAULT: ["music_room_1"],
    },
  },
  POOL_TABLE: {
    resources: {
      LARGE: ["pool_large_1"],
      SMALL: ["pool_small_1"],
    },
  },
  PING_PONG: {
    resources: {
      DEFAULT: ["pingpong_1", "pingpong_2"],
    },
  },
};

async function getBookingsCollection() {
  const db = await getDb();
  return db.collection<Booking>("bookings");
}

// Helper function to check if date is a weekday
export function isWeekday(dateString: string): boolean {
  const date = new Date(dateString);
  const day = date.getUTCDay();
  return day !== 0 && day !== 6; // 0 = Sunday, 6 = Saturday
}

export async function createBooking(booking: NewBooking): Promise<Booking> {
  const collection = await getBookingsCollection();
  const now = new Date().toISOString();

  const newBooking: Booking = {
    id: uuidv4(),
    userId: booking.userEmail, // Using email as userId for simplicity
    userName: booking.userName,
    userEmail: booking.userEmail,
    category: booking.category,
    resourceId: booking.resourceId,
    subType: booking.subType || "DEFAULT",
    date: booking.date,
    startTime: booking.startTime,
    endTime: booking.endTime,
    status: "CONFIRMED",
    createdAt: now,
    updatedAt: now,
  };

  await collection.insertOne(newBooking);
  return newBooking;
}

export async function getBookingById(id: string): Promise<Booking | null> {
  const collection = await getBookingsCollection();
  return collection.findOne({ id });
}

export async function getBookings(filters?: {
  date?: string;
  category?: string;
  userEmail?: string;
  status?: BookingStatus;
}): Promise<Booking[]> {
  const collection = await getBookingsCollection();
  const query: Record<string, unknown> = {};

  if (filters?.date) query.date = filters.date;
  if (filters?.category) query.category = filters.category;
  if (filters?.userEmail) query.userEmail = filters.userEmail;
  if (filters?.status) query.status = filters.status;
  else query.status = "CONFIRMED"; // Default to confirmed bookings

  return collection.find(query).sort({ date: 1, startTime: 1 }).toArray();
}

export async function getBookedResourceIds(
  date: string,
  startTime: string,
  category: string
): Promise<string[]> {
  const collection = await getBookingsCollection();
  const bookings = await collection
    .find({
      date,
      startTime,
      category,
      status: "CONFIRMED",
    })
    .toArray();

  return bookings.map((b) => b.resourceId);
}

export async function getBookingsForDateAndCategory(
  date: string,
  category: string
): Promise<Booking[]> {
  const collection = await getBookingsCollection();
  return collection
    .find({
      date,
      category,
      status: "CONFIRMED",
    })
    .toArray();
}

export async function cancelBooking(id: string): Promise<Booking | null> {
  const collection = await getBookingsCollection();
  await collection.updateOne(
    { id },
    { $set: { status: "CANCELLED", updatedAt: new Date().toISOString() } }
  );
  return getBookingById(id);
}

// Helper function to get user's bookings for a specific date and category
export async function getUserBookingsForDateAndCategory(
  userEmail: string,
  date: string,
  category: string
): Promise<Booking[]> {
  const collection = await getBookingsCollection();
  return collection
    .find({
      userEmail,
      date,
      category,
      status: "CONFIRMED",
    })
    .sort({ startTime: 1 })
    .toArray();
}

// Helper function to get the longest consecutive booking block for a user on a specific date
export function getLongestConsecutiveBlock(bookings: Booking[]): { start: number; end: number; hours: number } | null {
  if (bookings.length === 0) {
    return null;
  }

  const timeToHour = (time: string): number => parseInt(time.split(":")[0]);
  
  // Sort bookings by start time
  const sorted = [...bookings].sort((a, b) => {
    const aStart = timeToHour(a.startTime);
    const bStart = timeToHour(b.startTime);
    return aStart - bStart;
  });

  let longestStart = timeToHour(sorted[0].startTime);
  let longestEnd = timeToHour(sorted[0].endTime);
  let longestHours = longestEnd - longestStart;

  let currentStart = longestStart;
  let currentEnd = longestEnd;

  for (let i = 1; i < sorted.length; i++) {
    const nextStart = timeToHour(sorted[i].startTime);
    const nextEnd = timeToHour(sorted[i].endTime);

    // Check if consecutive (adjacent or overlapping)
    if (nextStart <= currentEnd) {
      // Extend current block
      currentEnd = Math.max(currentEnd, nextEnd);
    } else {
      // Gap found, check if current block is longer
      const currentHours = currentEnd - currentStart;
      if (currentHours > longestHours) {
        longestStart = currentStart;
        longestEnd = currentEnd;
        longestHours = currentHours;
      }
      // Start new block
      currentStart = nextStart;
      currentEnd = nextEnd;
    }
  }

  // Check the final block
  const currentHours = currentEnd - currentStart;
  if (currentHours > longestHours) {
    longestStart = currentStart;
    longestEnd = currentEnd;
    longestHours = currentHours;
  }

  return {
    start: longestStart,
    end: longestEnd,
    hours: longestHours,
  };
}

// Helper function to calculate total consecutive hours with a new booking
// This only checks if the new booking would extend an existing consecutive block beyond 2 hours
export function calculateConsecutiveHours(
  existingBookings: Booking[],
  newStartTime: string,
  newEndTime: string
): number {
  // Convert time strings to hours for comparison
  const timeToHour = (time: string): number => parseInt(time.split(":")[0]);
  const newStart = timeToHour(newStartTime);
  const newEnd = timeToHour(newEndTime);
  const newDuration = newEnd - newStart;

  if (existingBookings.length === 0) {
    return newDuration;
  }

  // Check if the new booking is consecutive (adjacent) to any existing booking
  let isConsecutive = false;
  
  for (const booking of existingBookings) {
    const existingStart = timeToHour(booking.startTime);
    const existingEnd = timeToHour(booking.endTime);

    // Check if bookings are consecutive (adjacent in time)
    if (existingEnd === newStart || newEnd === existingStart) {
      isConsecutive = true;
      break;
    }
  }

  // If not consecutive to any existing booking, return just the new duration (it's a separate block)
  if (!isConsecutive) {
    return newDuration;
  }

  // If consecutive, calculate the total span of consecutive bookings
  // Collect all bookings that are part of this consecutive block
  const timeToHourFn = timeToHour;
  let minStart = newStart;
  let maxEnd = newEnd;

  for (const booking of existingBookings) {
    const existingStart = timeToHourFn(booking.startTime);
    const existingEnd = timeToHourFn(booking.endTime);

    // Check if this booking is part of the consecutive chain
    // A booking is part of the chain if it overlaps or is adjacent to our current block
    if (!(existingEnd < minStart || existingStart > maxEnd)) {
      minStart = Math.min(minStart, existingStart);
      maxEnd = Math.max(maxEnd, existingEnd);
    }
  }

  return maxEnd - minStart;
}

export async function getAvailability(
  date: string,
  category: string,
  subType: string
): Promise<{
  date: string;
  category: string;
  subType: string;
  totalResources: number;
  bookedSlots: string[];
}> {
  const config = RESOURCE_CONFIG[category];
  if (!config) {
    throw new Error("Invalid category");
  }

  const resourceIds = config.resources[subType] || config.resources.DEFAULT;
  if (!resourceIds) {
    throw new Error("Invalid subType");
  }

  const bookings = await getBookingsForDateAndCategory(date, category);

  // Group bookings by start time for this subType's resources
  const bookingsByTime: Record<string, Set<string>> = {};

  bookings.forEach((booking) => {
    if (resourceIds.includes(booking.resourceId)) {
      const time = booking.startTime;
      if (!bookingsByTime[time]) {
        bookingsByTime[time] = new Set();
      }
      bookingsByTime[time].add(booking.resourceId);
    }
  });

  // Find fully booked time slots (all resources taken)
  const bookedSlots: string[] = [];
  Object.entries(bookingsByTime).forEach(([time, bookedResources]) => {
    // If all resources for this subType are booked, the slot is unavailable
    if (bookedResources.size >= resourceIds.length) {
      bookedSlots.push(time);
    }
  });

  return {
    date,
    category,
    subType,
    totalResources: resourceIds.length,
    bookedSlots,
  };
}
