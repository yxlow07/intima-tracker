import { NextRequest, NextResponse } from "next/server";
import {
  createBooking,
  getBookings,
  getBookedResourceIds,
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
