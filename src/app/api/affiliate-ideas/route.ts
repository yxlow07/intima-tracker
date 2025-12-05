import { NextRequest, NextResponse } from "next/server";
import {
  createAffiliateIdea,
  getApprovedAffiliateIdeas,
  getAllAffiliateIdeas,
  validateStudentEmail,
} from "@/lib/affiliateIdea";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const showAll = searchParams.get("all") === "true";

    // Only admin should see all (including pending/rejected)
    // Public users only see approved ideas
    const ideas = showAll ? getAllAffiliateIdeas() : getApprovedAffiliateIdeas();

    return NextResponse.json(ideas);
  } catch (error) {
    console.error("Error fetching affiliate ideas:", error);
    return NextResponse.json(
      { error: "Failed to fetch affiliate ideas" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { affiliateName, description, positionsOpen, contact, studentEmail } = body;

    // Validation
    if (!affiliateName || !affiliateName.trim()) {
      return NextResponse.json(
        { error: "Affiliate name is required" },
        { status: 400 }
      );
    }

    if (!contact || !contact.trim()) {
      return NextResponse.json(
        { error: "Contact information is required" },
        { status: 400 }
      );
    }

    if (!studentEmail || !studentEmail.trim()) {
      return NextResponse.json(
        { error: "Student email is required" },
        { status: 400 }
      );
    }

    // Validate student email format
    if (!validateStudentEmail(studentEmail)) {
      return NextResponse.json(
        { error: "Invalid email address" },
        { status: 400 }
      );
    }

    const newIdea = createAffiliateIdea({
      affiliateName: affiliateName.trim(),
      description: description?.trim() || undefined,
      positionsOpen: Array.isArray(positionsOpen) ? positionsOpen.filter((p: string) => p.trim()) : undefined,
      contact: contact.trim(),
      studentEmail: studentEmail.trim().toLowerCase(),
    });

    return NextResponse.json(newIdea, { status: 201 });
  } catch (error) {
    console.error("Error creating affiliate idea:", error);
    return NextResponse.json(
      { error: "Failed to create affiliate idea" },
      { status: 500 }
    );
  }
}
