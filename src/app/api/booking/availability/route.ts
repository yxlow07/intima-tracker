import { NextRequest, NextResponse } from "next/server";
import { getAvailability, isWeekday, RESOURCE_CONFIG } from "@/lib/booking";

// GET - Check availability for a specific date and category
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const date = searchParams.get("date");
    const category = searchParams.get("category");
    const subType = searchParams.get("subType") || "DEFAULT";

    if (!date || !category) {
      return NextResponse.json(
        { error: "Date and category are required" },
        { status: 400 }
      );
    }

    // Validate that the date is a weekday
    if (!isWeekday(date)) {
      return NextResponse.json(
        { error: "Bookings are only available on weekdays (Monday-Friday)" },
        { status: 400 }
      );
    }

    // Get the resource configuration for this category
    const config = RESOURCE_CONFIG[category];
    if (!config) {
      return NextResponse.json({ error: "Invalid category" }, { status: 400 });
    }

    const resourceIds = config.resources[subType] || config.resources.DEFAULT;
    if (!resourceIds) {
      return NextResponse.json(
        { error: "Invalid subType" },
        { status: 400 }
      );
    }

    const availability = await getAvailability(date, category, subType);

    // Return with no-cache headers to ensure fresh data
    const response = NextResponse.json(availability);
    response.headers.set("Cache-Control", "no-store, no-cache, must-revalidate");
    return response;
  } catch (error) {
    console.error("Failed to check availability:", error);
    return NextResponse.json(
      { error: "Failed to check availability" },
      { status: 500 }
    );
  }
}
