import { NextRequest, NextResponse } from "next/server";
import {
  createBooking,
  getBookings,
  getBookedResourceIds,
  getUserBookingsForDateAndCategory,
  calculateConsecutiveHours,
  getLongestConsecutiveBlock,
} from "@/lib/booking";

// POST - Create a new booking
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { userName, userEmail, category, subType, date, startTime, endTime, resourceIds } = body;

    // Validate required fields
    if (!userName || !userEmail || !category || !date || !startTime || !endTime || !resourceIds) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    // For discussion rooms, check consecutive hours limit (max 2 hours)
    if (category === "DISCUSSION_ROOM") {
      const userBookings = await getUserBookingsForDateAndCategory(userEmail, date, category);
      
      // Check if adding this booking would exceed 2 consecutive hours
      const consecutiveHours = calculateConsecutiveHours(userBookings, startTime, endTime);
      
      if (consecutiveHours > 2) {
        // Get the longest consecutive block to show in error
        const longestBlock = getLongestConsecutiveBlock(userBookings);
        const bookedSlots = userBookings
          .map((b) => `${b.startTime} to ${b.endTime}`)
          .join(" and ");
        
        let errorMsg = `You have booked: ${bookedSlots}. `;
        if (longestBlock) {
          const startHour = longestBlock.start.toString().padStart(2, "0");
          const endHour = longestBlock.end.toString().padStart(2, "0");
          errorMsg += `Your longest consecutive booking is ${longestBlock.hours} hours (${startHour}:00 to ${endHour}:00). `;
        }
        errorMsg += `Maximum consecutive booking for discussion rooms is 2 hours.`;
        
        return NextResponse.json(
          { error: errorMsg },
          { status: 409 }
        );
      }
    }

    // Get booked resource IDs for this time slot
    const bookedResourceIds = await getBookedResourceIds(date, startTime, category);

    // Find an available resource
    const availableResource = resourceIds.find(
      (id: string) => !bookedResourceIds.includes(id)
    );

    if (!availableResource) {
      return NextResponse.json(
        { error: "No available resources for this time slot" },
        { status: 409 }
      );
    }

    // Create the booking
    const newBooking = await createBooking({
      userName,
      userEmail,
      category,
      resourceId: availableResource,
      subType: subType || "DEFAULT",
      date,
      startTime,
      endTime,
    });

    return NextResponse.json(newBooking);
  } catch (error) {
    console.error("Failed to create booking:", error);
    return NextResponse.json(
      { error: "Failed to create booking" },
      { status: 500 }
    );
  }
}

// GET - Get bookings (optionally filtered)
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const date = searchParams.get("date") || undefined;
    const category = searchParams.get("category") || undefined;
    const userEmail = searchParams.get("userEmail") || undefined;

    const bookings = await getBookings({
      date,
      category,
      userEmail,
    });

    return NextResponse.json(bookings);
  } catch (error) {
    console.error("Failed to fetch bookings:", error);
    return NextResponse.json(
      { error: "Failed to fetch bookings" },
      { status: 500 }
    );
  }
}
