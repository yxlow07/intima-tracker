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
