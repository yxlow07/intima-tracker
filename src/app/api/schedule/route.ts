import { NextRequest, NextResponse } from "next/server";
import {
  createMemberSchedule,
  createScheduleSlot,
  getAllMemberSchedules,
  getAllSessions,
  getOrCreateScheduleSlots,
  randomizeSchedule,
  clearAllSlots,
} from "@/lib/schedule";

// GET: Fetch all member schedules or schedule slots
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const type = searchParams.get("type"); // "members" | "slots" | "sessions"
    const session = searchParams.get("session");

    if (type === "sessions") {
      const sessions = await getAllSessions();
      return NextResponse.json(sessions);
    }

    if (type === "slots" && session) {
      const slots = await getOrCreateScheduleSlots(session);
      return NextResponse.json(slots);
    }

    // Default: get member schedules
    const members = await getAllMemberSchedules(session || undefined);
    return NextResponse.json(members);
  } catch (error) {
    console.error("Error fetching schedules:", error);
    return NextResponse.json(
      { error: "Failed to fetch schedules" },
      { status: 500 }
    );
  }
}

// POST: Create a new member schedule or perform actions
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { action } = body;

    // Handle special actions
    if (action === "randomize") {
      const { session } = body;
      if (!session) {
        return NextResponse.json(
          { error: "Session is required for randomization" },
          { status: 400 }
        );
      }
      const slots = await randomizeSchedule(session);
      return NextResponse.json(slots);
    }

    if (action === "clear") {
      const { session } = body;
      if (!session) {
        return NextResponse.json(
          { error: "Session is required for clearing" },
          { status: 400 }
        );
      }
      await clearAllSlots(session);
      return NextResponse.json({ success: true });
    }

    if (action === "create") {
      const { day, start, end, session, assignedMembers } = body;
      if (!day || !start || !end || !session) {
        return NextResponse.json(
          { error: "Day, start, end, and session are required" },
          { status: 400 }
        );
      }
      const slot = await createScheduleSlot(day, start, end, session, assignedMembers || []);
      return NextResponse.json(slot, { status: 201 });
    }

    // Create new member schedule
    const { name, session, schedule } = body;

    if (!name || !name.trim()) {
      return NextResponse.json(
        { error: "Name is required" },
        { status: 400 }
      );
    }

    if (!session || !session.trim()) {
      return NextResponse.json(
        { error: "Session is required" },
        { status: 400 }
      );
    }

    if (!schedule) {
      return NextResponse.json(
        { error: "Schedule is required" },
        { status: 400 }
      );
    }

    const memberSchedule = await createMemberSchedule({
      name: name.trim(),
      session: session.trim(),
      schedule,
    });

    return NextResponse.json(memberSchedule, { status: 201 });
  } catch (error) {
    console.error("Error creating schedule:", error);
    return NextResponse.json(
      { error: "Failed to create schedule" },
      { status: 500 }
    );
  }
}
