import { NextRequest, NextResponse } from "next/server";
import { updateScheduleSlot, getScheduleSlots } from "@/lib/schedule";

type RouteParams = {
  params: Promise<{
    slotId: string;
  }>;
};

// PATCH: Update assigned members for a slot
export async function PATCH(request: NextRequest, { params }: RouteParams) {
  try {
    const { slotId } = await params;
    const body = await request.json();
    const { assignedMembers } = body;

    if (!Array.isArray(assignedMembers)) {
      return NextResponse.json(
        { error: "assignedMembers must be an array" },
        { status: 400 }
      );
    }

    const updatedSlot = await updateScheduleSlot(slotId, assignedMembers);
    
    if (!updatedSlot) {
      return NextResponse.json(
        { error: "Slot not found" },
        { status: 404 }
      );
    }

    return NextResponse.json(updatedSlot);
  } catch (error) {
    console.error("Error updating slot:", error);
    return NextResponse.json(
      { error: "Failed to update slot" },
      { status: 500 }
    );
  }
}
