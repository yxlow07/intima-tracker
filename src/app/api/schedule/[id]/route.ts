import { NextRequest, NextResponse } from "next/server";
import {
  getMemberScheduleById,
  updateMemberSchedule,
  deleteMemberSchedule,
} from "@/lib/schedule";

type RouteParams = {
  params: Promise<{
    id: string;
  }>;
};

// GET: Fetch a single member schedule
export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params;
    const schedule = await getMemberScheduleById(id);

    if (!schedule) {
      return NextResponse.json(
        { error: "Schedule not found" },
        { status: 404 }
      );
    }

    return NextResponse.json(schedule);
  } catch (error) {
    console.error("Error fetching schedule:", error);
    return NextResponse.json(
      { error: "Failed to fetch schedule" },
      { status: 500 }
    );
  }
}

// PATCH: Update a member schedule
export async function PATCH(request: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params;
    const body = await request.json();

    const schedule = await getMemberScheduleById(id);
    if (!schedule) {
      return NextResponse.json(
        { error: "Schedule not found" },
        { status: 404 }
      );
    }

    const updates: Record<string, unknown> = {};
    if (body.name !== undefined) updates.name = body.name;
    if (body.session !== undefined) updates.session = body.session;
    if (body.schedule !== undefined) updates.schedule = body.schedule;

    const updatedSchedule = await updateMemberSchedule(id, updates);
    return NextResponse.json(updatedSchedule);
  } catch (error) {
    console.error("Error updating schedule:", error);
    return NextResponse.json(
      { error: "Failed to update schedule" },
      { status: 500 }
    );
  }
}

// DELETE: Delete a member schedule
export async function DELETE(request: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params;

    const schedule = await getMemberScheduleById(id);
    if (!schedule) {
      return NextResponse.json(
        { error: "Schedule not found" },
        { status: 404 }
      );
    }

    await deleteMemberSchedule(id);
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting schedule:", error);
    return NextResponse.json(
      { error: "Failed to delete schedule" },
      { status: 500 }
    );
  }
}
