import { NextRequest, NextResponse } from "next/server";
import {
  getAffiliateIdeaById,
  updateAffiliateIdeaStatus,
  updateAffiliateIdea,
  deleteAffiliateIdea,
  AffiliateIdeaStatus,
} from "@/lib/affiliateIdea";

type RouteParams = {
  params: Promise<{
    id: string;
  }>;
};

export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params;
    const idea = await getAffiliateIdeaById(id);

    if (!idea) {
      return NextResponse.json(
        { error: "Affiliate idea not found" },
        { status: 404 }
      );
    }

    return NextResponse.json(idea);
  } catch (error) {
    console.error("Error fetching affiliate idea:", error);
    return NextResponse.json(
      { error: "Failed to fetch affiliate idea" },
      { status: 500 }
    );
  }
}

export async function PATCH(request: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params;
    const body = await request.json();

    const idea = await getAffiliateIdeaById(id);
    if (!idea) {
      return NextResponse.json(
        { error: "Affiliate idea not found" },
        { status: 404 }
      );
    }

    // If only status is being updated, validate it
    if (body.status && Object.keys(body).length === 1) {
      const validStatuses: AffiliateIdeaStatus[] = ["Pending Approval", "Approved", "Rejected"];
      if (!validStatuses.includes(body.status)) {
        return NextResponse.json(
          { error: "Invalid status. Must be one of: Pending Approval, Approved, Rejected" },
          { status: 400 }
        );
      }
      const updatedIdea = await updateAffiliateIdeaStatus(id, body.status);
      return NextResponse.json(updatedIdea);
    }

    // Otherwise, update all provided fields
    const updates: Record<string, unknown> = {};
    if (body.affiliateName !== undefined) updates.affiliateName = body.affiliateName;
    if (body.description !== undefined) updates.description = body.description;
    if (body.positionsOpen !== undefined) updates.positionsOpen = body.positionsOpen;
    if (body.contact !== undefined) updates.contact = body.contact;
    if (body.studentEmail !== undefined) updates.studentEmail = body.studentEmail;
    if (body.status !== undefined) {
      const validStatuses: AffiliateIdeaStatus[] = ["Pending Approval", "Approved", "Rejected"];
      if (!validStatuses.includes(body.status)) {
        return NextResponse.json(
          { error: "Invalid status. Must be one of: Pending Approval, Approved, Rejected" },
          { status: 400 }
        );
      }
      updates.status = body.status;
    }

    const updatedIdea = await updateAffiliateIdea(id, updates);
    return NextResponse.json(updatedIdea);
  } catch (error) {
    console.error("Error updating affiliate idea:", error);
    return NextResponse.json(
      { error: "Failed to update affiliate idea" },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params;
    
    const idea = await getAffiliateIdeaById(id);
    if (!idea) {
      return NextResponse.json(
        { error: "Affiliate idea not found" },
        { status: 404 }
      );
    }

    await deleteAffiliateIdea(id);
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting affiliate idea:", error);
    return NextResponse.json(
      { error: "Failed to delete affiliate idea" },
      { status: 500 }
    );
  }
}
