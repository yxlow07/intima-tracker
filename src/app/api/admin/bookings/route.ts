import { NextRequest, NextResponse } from "next/server";
import { cancelBooking, type Booking } from "@/lib/booking";
import { getDb } from "@/lib/mongodb";
import { verifySession } from "@/lib/auth";
import { cookies } from "next/headers";

// GET - Get all bookings for admin (with optional filters)
export async function GET(request: NextRequest) {
  try {
    // Check authentication
    const cookieStore = await cookies();
    const token = cookieStore.get("admin-auth")?.value;
    const session = token ? await verifySession(token) : null;
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const date = searchParams.get("date") || undefined;
    const category = searchParams.get("category") || undefined;
    const status = searchParams.get("status") as "CONFIRMED" | "CANCELLED" | undefined;
    const userEmail = searchParams.get("userEmail") || undefined;

    // Get bookings from MongoDB directly to include all statuses
    const db = await getDb();
    const collection = db.collection<Booking>("bookings");
    
    const query: Record<string, unknown> = {};
    if (date) query.date = date;
    if (category) query.category = category;
    if (status) query.status = status;
    if (userEmail) query.userEmail = { $regex: userEmail, $options: "i" };

    const bookings = await collection
      .find(query)
      .sort({ date: -1, startTime: 1 })
      .toArray();

    return NextResponse.json(bookings);
  } catch (error) {
    console.error("Failed to fetch bookings:", error);
    return NextResponse.json(
      { error: "Failed to fetch bookings" },
      { status: 500 }
    );
  }
}

// DELETE - Cancel a booking
export async function DELETE(request: NextRequest) {
  try {
    // Check authentication
    const cookieStore = await cookies();
    const token = cookieStore.get("admin-auth")?.value;
    const session = token ? await verifySession(token) : null;
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json(
        { error: "Booking ID is required" },
        { status: 400 }
      );
    }

    const updatedBooking = await cancelBooking(id);

    if (!updatedBooking) {
      return NextResponse.json(
        { error: "Booking not found" },
        { status: 404 }
      );
    }

    return NextResponse.json(updatedBooking);
  } catch (error) {
    console.error("Failed to cancel booking:", error);
    return NextResponse.json(
      { error: "Failed to cancel booking" },
      { status: 500 }
    );
  }
}
