import { NextRequest, NextResponse } from "next/server";
import { getAvailableMembersForSlot, type WeeklySchedule } from "@/lib/schedule";

// GET: Get available members for a specific slot
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const session = searchParams.get("session");
    const day = searchParams.get("day") as keyof WeeklySchedule | null;
    const start = searchParams.get("start");
    const end = searchParams.get("end");

    if (!session || !day || !start || !end) {
      return NextResponse.json(
        { error: "Missing required parameters: session, day, start, end" },
        { status: 400 }
      );
    }

    const validDays = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"];
    if (!validDays.includes(day)) {
      return NextResponse.json(
        { error: "Invalid day. Must be Monday-Friday" },
        { status: 400 }
      );
    }

    const availableMembers = await getAvailableMembersForSlot(session, day, start, end);
    return NextResponse.json(availableMembers);
  } catch (error) {
    console.error("Error fetching available members:", error);
    return NextResponse.json(
      { error: "Failed to fetch available members" },
      { status: 500 }
    );
  }
}
